require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const archiver = require('archiver');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { initDatabase, run, queryOne, queryAll, FORM_DEFINITIONS } = require('./db');
const views = require('../frontend/views');
const { fillPdfTemplate, fillDocxTemplate, expandMultiValueFields } = require('./pdf-filler');
const { getTemplate } = require('./template-defs');

const app = express();
const PROJECT_ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
if (IS_PRODUCTION) {
  app.set('trust proxy', 1);
}

// Security: Audit logging
const auditLog = (action, user, details = {}) => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${action} | User: ${user} | ${JSON.stringify(details)}\n`;
    fs.appendFileSync(path.join(PROJECT_ROOT, 'data', 'audit.log'), logEntry);
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

// Ensure directories exist
const UPLOAD_DIR = path.join(PROJECT_ROOT, 'data', 'uploads');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
[DATA_DIR, UPLOAD_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function generateOnboardingPdf(client, onboarding) {
  const template = getTemplate('onboarding');
  const data = expandMultiValueFields(onboarding || {}, template.fields);
  const signatures = {};
  
  // If signature exists in data
  if (data._signature) {
    signatures['declaration_signature'] = data._signature;
  }
  
  const pdfBuffer = await fillPdfTemplate(
    template.file,
    template.fields,
    data,
    { signatures }
  );
  
  return pdfBuffer;
}


// Security: Helmet - HTTP security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: IS_PRODUCTION ? 31536000 : 0,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' }
}));

// TLS is terminated by the deployment proxy. Never serve authenticated pages over HTTP.
app.use((req, res, next) => {
  if (IS_PRODUCTION && !req.secure) {
    const host = req.get('host');
    if (!host) return res.status(400).send('Invalid request');
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  }
  next();
});

// Security: Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many uploads, please slow down.'
});

app.use(globalLimiter);

// Security: File upload with strict validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    };
    
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    
    if (allowedMimes[mimeType] && allowedMimes[mimeType].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC, DOCX allowed.'));
    }
  }
});

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(PROJECT_ROOT, 'public')));

// Security: Session configuration
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.includes('CHANGE_ME') || sessionSecret.includes('dev_secret')) {
  console.warn('⚠️  WARNING: Using weak SESSION_SECRET! Set a strong one in .env for production!');
}

app.use(session({
  secret: sessionSecret || crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(process.env.SESSION_TIMEOUT_MS) || 1800000
  }
}));

// Security: Track failed login attempts (in-memory, use Redis in production)
const loginAttempts = new Map();

function checkLoginAttempts(identifier) {
  const attempts = loginAttempts.get(identifier) || { count: 0, lockUntil: null };
  
  if (attempts.lockUntil && Date.now() < attempts.lockUntil) {
    const minutesLeft = Math.ceil((attempts.lockUntil - Date.now()) / 60000);
    return { locked: true, minutesLeft };
  }
  
  if (attempts.lockUntil && Date.now() >= attempts.lockUntil) {
    loginAttempts.delete(identifier);
  }
  
  return { locked: false };
}

function recordFailedLogin(identifier) {
  const attempts = loginAttempts.get(identifier) || { count: 0, lockUntil: null };
  attempts.count++;
  
  if (attempts.count >= 5) {
    attempts.lockUntil = Date.now() + (15 * 60 * 1000); // 15 min lockout
    attempts.count = 0;
  }
  
  loginAttempts.set(identifier, attempts);
}

function clearLoginAttempts(identifier) {
  loginAttempts.delete(identifier);
}

// Auth middleware with session regeneration
function requireAuth(role = null) {
  return (req, res, next) => {
    if (!req.session.user) {
      auditLog('UNAUTHORIZED_ACCESS', 'anonymous', { ip: req.ip, path: req.path });
      return res.redirect('/login');
    }
    
    if (role && req.session.user.role !== role && req.session.user.role !== 'admin') {
      auditLog('FORBIDDEN_ACCESS', req.session.user.username, { 
        ip: req.ip, 
        path: req.path, 
        requiredRole: role 
      });
      return res.status(403).send('Access denied');
    }
    
    // Periodic session regeneration to prevent fixation
    if (!req.session.lastRegenerate || Date.now() - req.session.lastRegenerate > 1800000) {
      const oldUser = req.session.user;
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.user = oldUser;
        req.session.lastRegenerate = Date.now();
        next();
      });
    } else {
      next();
    }
  };
}

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, 500);
}

// Helper: Get today's date in DD/MM/YY format
function getTodayDateFormatted() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}


// Security: Path traversal protection
function validateAndGetDocument(docId, clientId, userId) {
  const doc = queryOne('SELECT * FROM documents WHERE id = ? AND client_id = ?', [docId, clientId]);
  if (!doc) return null;

  const filePath = path.join(UPLOAD_DIR, doc.stored_filename);
  const normalizedPath = path.normalize(filePath);
  
  if (!normalizedPath.startsWith(UPLOAD_DIR)) {
    auditLog('DIRECTORY_TRAVERSAL_ATTEMPT', userId, { docId, clientId, attemptedPath: filePath });
    return null;
  }

  if (!fs.existsSync(filePath)) return null;
  return { doc, filePath };
}

// ============ AUTH ROUTES ============

app.get('/', (req, res) => {
  if (req.session.user) {
    const dashboard = getDashboard(req.session.user.role);
    if (dashboard !== '/login') return res.redirect(dashboard);
  }
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    const dashboard = getDashboard(req.session.user.role);
    if (dashboard !== '/login') return res.redirect(dashboard);
  }
  res.send(views.loginPage());
});

app.post('/login', loginLimiter, [
  body('username').trim().isLength({ min: 1, max: 50 }).escape(),
  body('password').isLength({ min: 1, max: 100 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    auditLog('LOGIN_VALIDATION_ERROR', 'unknown', { ip: req.ip });
    return res.send(views.loginPage('Invalid input'));
  }

  const { username, password } = req.body;
  const identifier = req.ip + ':' + username;

  const lockStatus = checkLoginAttempts(identifier);
  if (lockStatus.locked) {
    auditLog('LOGIN_BLOCKED_LOCKED', username, { ip: req.ip });
    return res.send(views.loginPage(`Account locked. Try again in ${lockStatus.minutesLeft} minutes.`));
  }

  const user = queryOne('SELECT * FROM users WHERE username = ?', [username]);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    recordFailedLogin(identifier);
    auditLog('LOGIN_FAILED', username, { ip: req.ip });
    return res.send(views.loginPage('Invalid username or password'));
  }

  clearLoginAttempts(identifier);

  req.session.regenerate((err) => {
    if (err) {
      auditLog('SESSION_ERROR', username, { ip: req.ip });
      return res.send(views.loginPage('Login error. Please try again.'));
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      passwordChanged: !!user.password_changed
    };
    req.session.lastRegenerate = Date.now();

    auditLog('LOGIN_SUCCESS', username, { ip: req.ip, role: user.role });
    res.redirect(getDashboard(user.role));
  });
});

app.get('/logout', (req, res) => {
  const username = req.session.user ? req.session.user.username : 'anonymous';
  auditLog('LOGOUT', username, { ip: req.ip });
  
  req.session.destroy((err) => {
    if (err) {
      auditLog('SESSION_DESTROY_ERROR', username, { ip: req.ip });
      return res.status(500).send('Unable to log out safely');
    }
    res.clearCookie('sessionId');
    res.redirect('/login');
  });
});

// ============ PUBLIC HELP CENTRE ============

app.get('/help/password-reset', (req, res) => {
  res.send(views.helpRequestPage('password_reset'));
});

app.get('/help/support', (req, res) => {
  res.send(views.helpRequestPage('support'));
});

function createHelpRequest(type) {
  return [
    body('requester_name').trim().isLength({ min: 2, max: 100 }).escape(),
    body('requester_email').trim().isEmail().normalizeEmail(),
    body('client_id').optional({ checkFalsy: true }).trim().isLength({ max: 50 }).escape(),
    body('subject').optional({ checkFalsy: true }).trim().isLength({ max: 150 }).escape(),
    body('message').trim().isLength({ min: 5, max: 2000 }).escape()
  ];
}

function submitHelpRequest(type) {
  return (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(views.helpRequestPage(type, null, 'Please complete all required fields correctly.'));

    const { requester_name, requester_email, client_id, subject, message } = req.body;
    const client = client_id ? queryOne(`
      SELECT c.id FROM clients c
      JOIN onboarding_data o ON o.client_id = c.id
      WHERE c.client_id = ? AND lower(o.authorized_email) = lower(?)
    `, [client_id, requester_email]) : null;

    // Password reset requests must match the authorised client email, but
    // the response remains generic so client IDs cannot be enumerated.
    if (type === 'password_reset' && !client) {
      auditLog('PASSWORD_RESET_REQUEST_UNVERIFIED', 'anonymous', { ip: req.ip });
      return res.send(views.helpRequestPage(type, 'If the details match our records, the support team will contact you shortly.'));
    }

    run(`INSERT INTO support_tickets (request_type, client_id, requester_name, requester_email, subject, message)
         VALUES (?, ?, ?, ?, ?, ?)`, [
      type, client ? client.id : null, requester_name, requester_email,
      subject || (type === 'password_reset' ? 'Password reset request' : 'Support request'), message
    ]);
    auditLog('HELP_REQUEST_CREATED', requester_email, { type, clientIdProvided: !!client_id, ip: req.ip });
    res.send(views.helpRequestPage(type, 'Your request has been received. Our support team will contact you soon.'));
  };
}

app.post('/help/password-reset', createHelpRequest('password_reset'), submitHelpRequest('password_reset'));
app.post('/help/support', createHelpRequest('support'), submitHelpRequest('support'));

function getDashboard(role) {
  switch (role) {
    case 'admin': return '/admin';
    case 'client': return '/client/due-diligence';
    default: return '/login';
  }
}

app.get('/admin/add-client', requireAuth('admin'), (req, res) => {
  res.send(views.addClientPage(req.session.user));
});

app.post('/admin/add-client', requireAuth('admin'), upload.none(), [
  body('form_group').notEmpty(),
  body('company_name').notEmpty(),
  body('company_office_address').notEmpty(),
  body('company_registration_no').notEmpty(),
  body('company_tax_number').notEmpty(),
  body('company_ssm_no').notEmpty(),
  body('company_sst_no').notEmpty(),
  body('car_park_site_name').notEmpty(),
  body('car_park_site_address').notEmpty(),
  body('car_park_type').notEmpty(),
  body('no_of_entry').notEmpty().isInt({ min: 1 }),
  body('no_of_exit').notEmpty().isInt({ min: 1 }),
  body('no_of_zone').notEmpty().isInt({ min: 1 }),
  body('no_of_validator').notEmpty().isInt({ min: 0 }),
  body('no_of_parking_bay').notEmpty().isInt({ min: 1 }),
  body('authorized_pic_office_name').notEmpty(),
  body('authorized_pic_office_contact').notEmpty(),
  body('authorized_pic_site_name').notEmpty(),
  body('authorized_pic_site_contact').notEmpty(),
  body('authorized_email').notEmpty().isEmail(),
  body('bank_name').notEmpty(),
  body('bank_account_name').notEmpty(),
  body('bank_account_number').notEmpty(),
  body('bank_address').notEmpty(),
  body('tax_number').notEmpty(),
  body('primary_active_bank_account').notEmpty(),
  body('commercial_model').notEmpty(),
  body('declaration').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.send(views.addClientPage(req.session.user, 'Please fill all required fields correctly'));
  }

  const {
    form_group, company_name, company_office_address, company_registration_no,
    company_tax_number, company_ssm_no, company_sst_no,
    car_park_site_name, car_park_site_address, car_park_type,
    no_of_entry, no_of_exit, no_of_zone, no_of_validator, no_of_parking_bay,
    authorized_pic_office_name, authorized_pic_office_contact,
    authorized_pic_site_name, authorized_pic_site_contact,
    authorized_email, authorized_email_cc,
    bank_name, bank_account_name, bank_account_number, bank_address, tax_number,
    primary_active_bank_account, commercial_model, declaration,
    action
  } = req.body;

  const sanitizedCompanyName = sanitizeInput(company_name);
  const baseClientId = sanitizedCompanyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase().substring(0, 25);
  const safeBase = baseClientId || 'CLIENT';
  let counter = 1;
  const maxLength = 30;
  const suffix = String(counter).padStart(3, '0');
  const truncated = safeBase.substring(0, maxLength - suffix.length - 1);
  let clientId = `${truncated}_${suffix}`;
  counter++;
  while (queryOne('SELECT id FROM users WHERE username = ?', [clientId]) || 
         queryOne('SELECT id FROM clients WHERE client_id = ?', [clientId])) {
    const nextSuffix = String(counter).padStart(3, '0');
    const nextTruncated = safeBase.substring(0, maxLength - nextSuffix.length - 1);
    clientId = `${nextTruncated}_${nextSuffix}`;
    counter++;
  }

   const tempPassword = crypto.randomBytes(8).toString('hex');
    const passwordHash = bcrypt.hashSync(tempPassword, 10);

    const existingUser = queryOne('SELECT id FROM users WHERE username = ?', [clientId]);
    if (existingUser) {
      return res.send(views.addClientPage(req.session.user, 'Client ID already exists'));
    }

    run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'client')", [clientId, passwordHash]);
    const userId = queryOne('SELECT MAX(id) as id FROM users').id;

    run(`INSERT INTO clients (client_id, company_name, address, form_group, user_id, status) VALUES (?, ?, ?, ?, ?, 'active')`,
      [clientId, sanitizedCompanyName, sanitizeInput(company_office_address), form_group, userId]);
   const clientDbId = queryOne('SELECT MAX(id) as id FROM clients').id;

  run(`INSERT INTO onboarding_data (
    client_id, company_name, company_office_address, company_registration_no,
    company_tax_number, company_ssm_no, company_sst_no,
    car_park_site_name, car_park_site_address, car_park_type,
    no_of_entry, no_of_exit, no_of_zone, no_of_validator, no_of_parking_bay,
    authorized_pic_office_name, authorized_pic_office_contact,
    authorized_pic_site_name, authorized_pic_site_contact,
    authorized_email, authorized_email_cc,
    bank_name, bank_account_name, bank_account_number, bank_address, tax_number,
    primary_active_bank_account, commercial_model
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clientDbId, sanitizedCompanyName, sanitizeInput(company_office_address), sanitizeInput(company_registration_no),
      sanitizeInput(company_tax_number), sanitizeInput(company_ssm_no), sanitizeInput(company_sst_no),
      sanitizeInput(car_park_site_name), sanitizeInput(car_park_site_address), car_park_type,
      no_of_entry, no_of_exit, no_of_zone, no_of_validator, no_of_parking_bay,
      sanitizeInput(authorized_pic_office_name), sanitizeInput(authorized_pic_office_contact),
      sanitizeInput(authorized_pic_site_name), sanitizeInput(authorized_pic_site_contact),
      sanitizeInput(authorized_email), authorized_email_cc ? sanitizeInput(authorized_email_cc) : '',
      sanitizeInput(bank_name), sanitizeInput(bank_account_name), sanitizeInput(bank_account_number), sanitizeInput(bank_address), sanitizeInput(tax_number),
      primary_active_bank_account, commercial_model
    ]
  );

  run("INSERT INTO form_submissions (client_id) VALUES (?)", [clientDbId]);
  run("INSERT INTO statuses (client_id) VALUES (?)", [clientDbId]);

   const onboarding = {
     header_date0: getTodayDateFormatted(),
     header_date1: getTodayDateFormatted(),
     company_name: sanitizedCompanyName,
     company_office_address: company_office_address,
     company_registration_no: company_registration_no,
     company_tax_number: company_tax_number,
     company_ssm_no: company_ssm_no,
     company_sst_no: company_sst_no,
     car_park_site_name: car_park_site_name,
     car_park_site_address: car_park_site_address,
     car_park_type: car_park_type,
     no_of_entry: no_of_entry,
     no_of_exit: no_of_exit,
     no_of_zone: no_of_zone,
     no_of_validator: no_of_validator,
     no_of_parking_bay: no_of_parking_bay,
     authorized_pic_office_name: authorized_pic_office_name,
     authorized_pic_office_contact: authorized_pic_office_contact,
     authorized_pic_site_name: authorized_pic_site_name,
     authorized_pic_site_contact: authorized_pic_site_contact,
     authorized_email: authorized_email,
     authorized_email_cc: authorized_email_cc || '',
     bank_name: bank_name,
     bank_account_name: bank_account_name,
     bank_account_number: bank_account_number,
     bank_address: bank_address,
     tax_number: tax_number,
     primary_active_bank_account: primary_active_bank_account,
     commercial_model: commercial_model
   };

  const buffer = await generateOnboardingPdf({ company_name: sanitizedCompanyName }, onboarding);
  const filename = `${clientId}_onboarding.pdf`;
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, buffer);

  res.send(views.clientCreatedPage(clientId, tempPassword, sanitizedCompanyName, clientDbId));
});

app.get('/admin', requireAuth('admin'), (req, res) => {
  const clients = queryAll(`
    SELECT c.*, u.username,
      CASE WHEN fs.is_submitted = 1 THEN 'Submitted' ELSE 'Pending' END as submission_status
    FROM clients c
    LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN form_submissions fs ON c.id = fs.client_id
    ORDER BY c.created_at DESC
  `);
  res.send(views.adminDashboard(clients, req.session.user));
});

app.get('/admin/help', requireAuth('admin'), (req, res) => {
  const tickets = queryAll(`
    SELECT st.*, c.client_id AS client_reference
    FROM support_tickets st LEFT JOIN clients c ON st.client_id = c.id
    ORDER BY CASE st.status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END, st.created_at DESC
  `);
  res.send(views.adminHelpPage(tickets, req.session.user));
});

app.get('/admin/help/:id', requireAuth('admin'), (req, res) => {
  const ticket = queryOne(`SELECT st.*, c.client_id AS client_reference FROM support_tickets st LEFT JOIN clients c ON st.client_id = c.id WHERE st.id = ?`, [req.params.id]);
  if (!ticket) return res.redirect('/admin/help');
  res.send(views.adminHelpDetailPage(ticket, req.session.user));
});

app.post('/admin/help/:id/update', requireAuth('admin'), [
  body('status').isIn(['in_progress', 'resolved', 'reset_password']),
  body('admin_note').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }).escape()
], (req, res) => {
  const ticket = queryOne('SELECT * FROM support_tickets WHERE id = ?', [req.params.id]);
  if (!ticket || !validationResult(req).isEmpty()) return res.redirect('/admin/help');

  const note = req.body.admin_note || '';
  if (req.body.status === 'reset_password') {
    if (ticket.request_type !== 'password_reset' || !ticket.client_id) return res.redirect(`/admin/help/${ticket.id}`);
    const client = queryOne('SELECT user_id FROM clients WHERE id = ?', [ticket.client_id]);
    if (!client?.user_id) return res.redirect(`/admin/help/${ticket.id}`);
    const tempPassword = crypto.randomBytes(8).toString('hex');
    run('UPDATE users SET password_hash = ?, password_changed = 0 WHERE id = ?', [bcrypt.hashSync(tempPassword, 12), client.user_id]);
    run(`UPDATE support_tickets SET status = 'resolved', admin_note = ?, resolved_at = CURRENT_TIMESTAMP, resolved_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [note, req.session.user.id, ticket.id]);
    auditLog('PASSWORD_RESET_COMPLETED', req.session.user.username, { ticketId: ticket.id, clientId: ticket.client_id });
    const updated = queryOne(`SELECT st.*, c.client_id AS client_reference FROM support_tickets st LEFT JOIN clients c ON st.client_id = c.id WHERE st.id = ?`, [ticket.id]);
    return res.send(views.adminHelpDetailPage(updated, req.session.user, tempPassword));
  }

  const resolved = req.body.status === 'resolved';
  run(`UPDATE support_tickets SET status = ?, admin_note = ?, resolved_at = ${resolved ? 'CURRENT_TIMESTAMP' : 'NULL'}, resolved_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [req.body.status, note, resolved ? req.session.user.id : null, ticket.id]);
  auditLog('HELP_REQUEST_UPDATED', req.session.user.username, { ticketId: ticket.id, status: req.body.status });
  res.redirect(`/admin/help/${ticket.id}`);
});


app.get('/admin/client/:id', requireAuth('admin'), (req, res) => {
  const client = queryOne('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  if (!client) return res.redirect('/admin');

  const submission = queryOne('SELECT * FROM form_submissions WHERE client_id = ?', [client.id]);
  const documents = queryAll('SELECT * FROM documents WHERE client_id = ? ORDER BY uploaded_at DESC', [client.id]);
  const status = queryOne('SELECT * FROM statuses WHERE client_id = ?', [client.id]);
  const formDef = FORM_DEFINITIONS[client.form_group];
  const onboarding = queryOne('SELECT * FROM onboarding_data WHERE client_id = ?', [client.id]);
  const dueDiligence = queryOne('SELECT * FROM due_diligence_forms WHERE client_id = ?', [client.id]);
  
  // Fetch due diligence documents
  let dueDiligenceDocs = [];
  if (dueDiligence) {
    dueDiligenceDocs = queryAll('SELECT * FROM due_diligence_documents WHERE due_diligence_id = ? ORDER BY uploaded_at DESC', [dueDiligence.id]);
  }

  res.send(views.adminClientDetail(client, submission, documents, status, formDef, req.session.user, onboarding, dueDiligence, dueDiligenceDocs));
});


app.post('/admin/client/:id/status', requireAuth('admin'), [
  body('tng_status').optional().isIn(['pending', 'submitted', 'approved']),
  body('bank_status').optional().isIn(['pending', 'submitted', 'approved']),
  body('submission_done').optional().isIn(['1'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect(`/admin/client/${req.params.id}`);
  }

  const { tng_status, bank_status, submission_done } = req.body;
  const client = queryOne('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  if (!client) return res.redirect('/admin');

  if (submission_done === '1') {
    run("UPDATE form_submissions SET submission_done = 1, submission_done_date = datetime('now') WHERE client_id = ?",
      [client.id]);
    auditLog('SUBMISSION_DONE', req.session.user.username, { clientId: client.client_id });
  }

  if (tng_status) {
    run("UPDATE statuses SET tng_status = ?, updated_at = datetime('now') WHERE client_id = ?",
      [tng_status, client.id]);
    auditLog('TNG_STATUS_UPDATE', req.session.user.username, { clientId: client.client_id, status: tng_status });
  }
  
  if (bank_status) {
    run("UPDATE statuses SET bank_status = ?, updated_at = datetime('now') WHERE client_id = ?",
      [bank_status, client.id]);
    auditLog('BANK_STATUS_UPDATE', req.session.user.username, { clientId: client.client_id, status: bank_status });
  }

  res.redirect(`/admin/client/${client.id}`);
});

app.get('/admin/client/:id/download/:docId', requireAuth('admin'), (req, res) => {
   const result = validateAndGetDocument(req.params.docId, req.params.id, req.session.user.username);
   if (!result) return res.status(404).send('Document not found');

   const client = queryOne('SELECT c.company_name, o.car_park_site_name FROM clients c LEFT JOIN onboarding_data o ON o.client_id = c.id WHERE c.id = ?', [req.params.id]);
   const ext = path.extname(result.doc.original_filename);
   const companyName = (client.company_name || 'Company').replace(/[^a-zA-Z0-9]/g, '_');
   const siteName = (client.car_park_site_name || 'Site').replace(/[^a-zA-Z0-9]/g, '_');
   const downloadName = `${companyName}_${siteName}${ext}`;

   auditLog('DOC_DOWNLOAD', req.session.user.username, {
     client: client.company_name,
     docType: result.doc.document_type
   });

   res.download(result.filePath, downloadName);
});

app.get('/admin/client/:id/download-all', requireAuth('admin'), (req, res) => {
  const client = queryOne('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  if (!client) return res.status(404).send('Client not found');

  const documents = queryAll('SELECT * FROM documents WHERE client_id = ?', [client.id]);
  if (documents.length === 0) return res.status(404).send('No documents found');

  const safeName = client.company_name.replace(/[^a-zA-Z0-9]/g, '_');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}_documents.zip"`);

  const archive = archiver('zip', { zlib: { level: 5 } });
  archive.pipe(res);

  documents.forEach(doc => {
    const filePath = path.join(UPLOAD_DIR, doc.stored_filename);
    const normalizedPath = path.normalize(filePath);
    
    if (normalizedPath.startsWith(UPLOAD_DIR) && fs.existsSync(filePath)) {
      const ext = path.extname(doc.original_filename);
      const renameTo = `${safeName}_${doc.document_type}${ext}`;
      archive.file(filePath, { name: renameTo });
    }
  });

  auditLog('DOC_BULK_DOWNLOAD', req.session.user.username, {
    client: client.company_name,
    count: documents.length
  });

  archive.finalize();
});

app.post('/admin/client/:id/delete', requireAuth('admin'), (req, res) => {
  const client = queryOne('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  if (!client) return res.redirect('/admin');

  const documents = queryAll('SELECT stored_filename FROM documents WHERE client_id = ?', [client.id]);
  documents.forEach(doc => {
    const fp = path.join(UPLOAD_DIR, doc.stored_filename);
    const normalized = path.normalize(fp);
    if (normalized.startsWith(UPLOAD_DIR) && fs.existsSync(fp)) {
      fs.unlinkSync(fp);
    }
  });

  if (client.user_id) {
    run("DELETE FROM users WHERE id = ?", [client.user_id]);
  }
  run("DELETE FROM clients WHERE id = ?", [client.id]);

  auditLog('CLIENT_DELETED', req.session.user.username, {
    clientId: client.client_id,
    companyName: client.company_name
  });

  res.redirect('/admin');
});

app.get('/admin/client/:id/download-onboarding-form', requireAuth('admin'), async (req, res) => {
  const client = queryOne('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  if (!client) return res.redirect('/admin');

  const filePath = path.join(UPLOAD_DIR, `${client.client_id}_onboarding.pdf`);

  try {
    let buffer;
    const onboarding = queryOne('SELECT * FROM onboarding_data WHERE client_id = ?', [client.id]);
    if (!onboarding) {
      return res.status(404).send('Onboarding data not found. Please save client details first.');
    }
    // Always regenerate with today's date to ensure fresh timestamp
    onboarding.header_date0 = getTodayDateFormatted();
    onboarding.header_date1 = getTodayDateFormatted();
    buffer = await generateOnboardingPdf(client, onboarding);
    fs.writeFileSync(filePath, buffer);

    // Create filename as CompanyName_SiteName
    const companyName = (onboarding.company_name || 'Company').replace(/[^a-zA-Z0-9]/g, '_');
    const siteName = (onboarding.car_park_site_name || 'Site').replace(/[^a-zA-Z0-9]/g, '_');
    const downloadFileName = `${companyName}_${siteName}.pdf`;

    auditLog('ONBOARDING_DOWNLOAD', req.session.user.username, {
      clientId: client.client_id,
      companyName: client.company_name,
      fileName: downloadFileName
    });

    res.download(filePath, downloadFileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).send('An internal server error occurred');
        }
      }
    });
  } catch (err) {
    console.error('Download route error:', err);
    res.status(500).send('An internal server error occurred');
  }
});

// ============ TEST ROUTES ============

// Test: Download sample onboarding form with test data
app.get('/test/download-sample-onboarding', async (req, res) => {
  const testData = {
    company_name: 'TEST COMPANY PLC',
    company_office_address: '123 Test Street, Test City, 50000 Kuala Lumpur',
    company_registration_no: 'SSM001234567',
    company_tax_number: 'CT1234567890',
    company_ssm_no: 'SSM001234567',
    company_sst_no: 'SST1234567890',
    car_park_site_name: 'Test Car Park Site',
    car_park_site_address: '456 Parking Avenue, Test District, 60000 Kuala Lumpur',
    car_park_type: 'Office Building',
    no_of_entry: '2',
    no_of_exit: '2',
    no_of_zone: '5',
    no_of_validator: '8',
    no_of_parking_bay: '150',
    authorized_pic_office_name: 'John Test',
    authorized_pic_office_contact: '+60123456789',
    authorized_pic_site_name: 'Jane Test',
    authorized_pic_site_contact: '+60187654321',
    authorized_email: 'john@testcompany.com',
    authorized_email_cc: 'jane@testcompany.com',
    bank_name: 'Test Bank Malaysia',
    bank_account_name: 'TEST COMPANY PLC',
    bank_account_number: '123456789012',
    bank_address: '789 Banking Road, Financial District, 50000 Kuala Lumpur',
    primary_active_bank_account: '1',
    commercial_model: 'Office Building',
    declaration_signature: 'John Test',
    declaration_name: 'John Test',
    declaration_date: '2026-08-04'
  };

  try {
    const buffer = await generateOnboardingPdf({ company_name: 'TEST COMPANY' }, testData);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Test_Onboarding_Form_Coordinate_Check.pdf"');
    res.send(buffer);
    console.log('✅ Test onboarding PDF generated and downloaded');
  } catch (err) {
    console.error('Test download error:', err);
    res.status(500).send('Error generating test PDF: ' + err.message);
  }
});


// ============ ERROR HANDLER ============

// Do not expose framework errors or filesystem paths to clients.
app.use((err, req, res, next) => {
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 500
    ? err.status
    : 500;
  auditLog('REQUEST_ERROR', req.session && req.session.user ? req.session.user.username : 'anonymous', {
    method: req.method,
    path: req.path,
    status,
    error: err.message
  });
  if (res.headersSent) return next(err);
  res.status(status).send(status === 500 ? 'An internal server error occurred' : err.message);
});

// ============ START SERVER ============

async function start() {
  try {
    if (IS_PRODUCTION && !sessionSecret) {
      throw new Error('SESSION_SECRET must be configured in production');
    }
    await initDatabase();
    console.log('✅ Database initialized');
    console.log('✅ Security features enabled');

    const clients = queryAll('SELECT client_id FROM clients');
    clients.forEach(c => {
      const dir = path.join(UPLOAD_DIR, c.client_id);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    app.listen(PORT, () => {
      console.log(`\n🔒 SECURE Document Submission Portal`);
      console.log(`   Running at http://localhost:${PORT}\n`);
      console.log('Security features:');
      console.log('  ✅ Helmet (HTTP headers)');
      console.log('  ✅ Rate limiting');
      console.log('  ✅ Input validation');
      console.log('  ✅ Audit logging');
      console.log('  ✅ Session security');
      console.log('  ✅ Path traversal protection');
      console.log('  ✅ Account lockout (5 failed attempts = 15 min lock)');
      console.log('  ✅ MIME type validation');
      console.log('  ✅ CSRF-ready\n');
      console.log('Default credentials:');
      console.log('  Admin: admin / admin123');
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️  DEVELOPMENT MODE');
        console.log('⚠️  Before production: Set strong SESSION_SECRET in .env');
        console.log('⚠️  Before production: Enable HTTPS');
        console.log('⚠️  Before production: Review SECURITY_REVIEW.md\n');
      }
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
