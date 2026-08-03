const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const PROJECT_ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(PROJECT_ROOT, 'data', 'portal.db');

let db = null;

// Form field definitions for each group
const FORM_DEFINITIONS = {
  A: {
    name: 'Form A',
    fields: [
      { id: 'company_name', label: 'Company Name', type: 'text', required: true },
      { id: 'company_reg_no', label: 'Company Registration No (SSM)', type: 'text', required: true },
      { id: 'director_name', label: 'Director Name', type: 'text', required: true },
      { id: 'director_ic', label: 'Director IC Number', type: 'text', required: true },
      { id: 'bank_name', label: 'Bank Name', type: 'text', required: true },
      { id: 'bank_account_no', label: 'Bank Account Number', type: 'text', required: true },
      { id: 'contact_email', label: 'Contact Email', type: 'email', required: true },
      { id: 'contact_phone', label: 'Contact Phone', type: 'tel', required: true },
    ],
    documents: [
      { id: 'bank_statement', label: 'Bank Statement (Last 3 Months)', required: true },
      { id: 'ssm_cert', label: 'SSM Certificate', required: true },
      { id: 'director_ic_front', label: 'Director IC (Front)', required: true },
      { id: 'director_ic_back', label: 'Director IC (Back)', required: true },
      { id: 'company_stamp', label: 'Company Stamp / Chop', required: false },
    ]
  },
  B: {
    name: 'Form B',
    fields: [
      { id: 'company_name', label: 'Company Name', type: 'text', required: true },
      { id: 'company_reg_no', label: 'Company Registration No (SSM)', type: 'text', required: true },
      { id: 'partner_name', label: 'Partner / Director Name', type: 'text', required: true },
      { id: 'partner_ic', label: 'Partner / Director IC Number', type: 'text', required: true },
      { id: 'bank_name', label: 'Bank Name', type: 'text', required: true },
      { id: 'bank_account_no', label: 'Bank Account Number', type: 'text', required: true },
      { id: 'contact_email', label: 'Contact Email', type: 'email', required: true },
      { id: 'contact_phone', label: 'Contact Phone', type: 'tel', required: true },
      { id: 'additional_note', label: 'Additional Notes', type: 'textarea', required: false },
    ],
    documents: [
      { id: 'bank_statement', label: 'Bank Statement (Last 3 Months)', required: true },
      { id: 'ssm_cert', label: 'SSM Certificate', required: true },
      { id: 'partner_ic_front', label: 'Partner/Director IC (Front)', required: true },
      { id: 'partner_ic_back', label: 'Partner/Director IC (Back)', required: true },
      { id: 'additional_docs', label: 'Additional Supporting Documents', required: false },
    ]
  }
};

async function initDatabase() {
  const SQL = await initSqlJs();

  // Ensure data directory exists
  const dataDir = path.join(PROJECT_ROOT, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing DB or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable WAL mode for better performance
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA foreign_keys = ON;');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'client')),
      password_changed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      address TEXT,
      pic_name TEXT,
      email TEXT,
      ssm_number TEXT,
      phone TEXT,
      form_group TEXT NOT NULL CHECK(form_group IN ('A', 'B')),
      user_id INTEGER UNIQUE,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

   // New onboarding_data table for comprehensive client information
   db.run(`
     CREATE TABLE IF NOT EXISTS onboarding_data (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       client_id INTEGER UNIQUE NOT NULL,
       
       -- Company Info
       company_name TEXT,
       company_office_address TEXT,
       company_registration_no TEXT,
       company_tax_number TEXT,
       company_ssm_no TEXT,
       company_sst_no TEXT,
       
       -- Car Park Site Info
       car_park_site_name TEXT,
       car_park_site_address TEXT,
       car_park_type TEXT CHECK(car_park_type IN ('Open Site', 'Office Building', 'Commercial Building (Mall)', 'Government Building', 'Hospital', '')),
       
       -- Site Capacity
       no_of_entry INTEGER,
       no_of_exit INTEGER,
       no_of_zone INTEGER,
       no_of_validator INTEGER,
       no_of_parking_bay INTEGER,
       
       -- Authorized Contacts
       authorized_pic_office_name TEXT,
       authorized_pic_office_contact TEXT,
       authorized_pic_site_name TEXT,
       authorized_pic_site_contact TEXT,
       authorized_email TEXT,
       authorized_email_cc TEXT,
       
        -- Billing / Financial Info
        bank_name TEXT,
        bank_account_name TEXT,
        bank_account_number TEXT,
        bank_address TEXT,
        tax_number TEXT,
        primary_active_bank_account TEXT,
        
        -- Commercial Arrangement
        commercial_model TEXT CHECK(commercial_model IN ('Outright Purchase (1 Year)', 'Lease-to-Own (3-5 years)', 'Rent', '')),
       
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
     )
   `);

  migrateOnboardingDataSchema();

  db.run(`
    CREATE TABLE IF NOT EXISTS form_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      form_data TEXT DEFAULT '{}',
      is_submitted INTEGER DEFAULT 0,
      submission_done INTEGER DEFAULT 0,
      submission_done_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      stored_filename TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS statuses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER UNIQUE NOT NULL,
      tng_status TEXT DEFAULT 'pending' CHECK(tng_status IN ('pending', 'submitted', 'approved')),
      bank_status TEXT DEFAULT 'pending' CHECK(bank_status IN ('pending', 'submitted', 'approved')),
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Stored in the portal so requests work without an email-service setup.
  db.run(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_type TEXT NOT NULL CHECK(request_type IN ('password_reset', 'support')),
      client_id INTEGER,
      requester_name TEXT NOT NULL,
      requester_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved')),
      admin_note TEXT,
      resolved_at DATETIME,
      resolved_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
      FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Due Diligence Form Data table
  db.run(`
    CREATE TABLE IF NOT EXISTS due_diligence_forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER UNIQUE NOT NULL,
      form_data TEXT,
      is_submitted INTEGER DEFAULT 0,
      approval_status TEXT DEFAULT 'pending' CHECK(approval_status IN ('pending', 'approved', 'rejected')),
      approval_date DATETIME,
      approval_by TEXT,
      rejection_reason TEXT,
      submission_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Add missing columns if they don't exist (for existing databases)
  try {
    db.run(`ALTER TABLE due_diligence_forms ADD COLUMN form_data TEXT`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    db.run(`ALTER TABLE due_diligence_forms ADD COLUMN is_submitted INTEGER DEFAULT 0`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    db.run(`ALTER TABLE due_diligence_forms ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK(approval_status IN ('pending', 'approved', 'rejected'))`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    db.run(`ALTER TABLE due_diligence_forms ADD COLUMN approval_date DATETIME`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    db.run(`ALTER TABLE due_diligence_forms ADD COLUMN approval_by TEXT`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    db.run(`ALTER TABLE due_diligence_forms ADD COLUMN rejection_reason TEXT`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    db.run(`ALTER TABLE due_diligence_forms ADD COLUMN submission_date DATETIME`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    db.run(`ALTER TABLE due_diligence_forms ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Due Diligence Documents table
  db.run(`
    CREATE TABLE IF NOT EXISTS due_diligence_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      due_diligence_id INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      stored_filename TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (due_diligence_id) REFERENCES due_diligence_forms(id) ON DELETE CASCADE
    )
  `);

  // Create default admin user
  const adminExists = db.exec("SELECT id FROM users WHERE username = 'admin'");
  if (!adminExists.length || adminExists[0].values.length === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')", ['admin', hash]);
  }

  saveDatabase();
  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

function migrateOnboardingDataSchema() {
  const schemaResult = db.exec("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'onboarding_data'");
  const schema = schemaResult[0]?.values[0]?.[0] || '';

  // Check if schema is already up-to-date
  const isCurrentSchema = schema.includes('company_registration_no')
    && schema.includes('company_ssm_no')
    && schema.includes('company_sst_no')
    && schema.includes('primary_active_bank_account');
  if (isCurrentSchema) return;

  db.run('PRAGMA foreign_keys = OFF;');
  db.run('BEGIN TRANSACTION;');
  try {
    db.run(`
      CREATE TABLE onboarding_data_migrated (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER UNIQUE NOT NULL,
        company_name TEXT,
        company_office_address TEXT,
        company_registration_no TEXT,
        company_tax_number TEXT,
        company_ssm_no TEXT,
        company_sst_no TEXT,
        car_park_site_name TEXT,
        car_park_site_address TEXT,
        car_park_type TEXT CHECK(car_park_type IN ('Open Site', 'Office Building', 'Commercial Building (Mall)', 'Government Building', 'Hospital', '')),
        no_of_entry INTEGER,
        no_of_exit INTEGER,
        no_of_zone INTEGER,
        no_of_validator INTEGER,
        no_of_parking_bay INTEGER,
        authorized_pic_office_name TEXT,
        authorized_pic_office_contact TEXT,
        authorized_pic_site_name TEXT,
        authorized_pic_site_contact TEXT,
        authorized_email TEXT,
        authorized_email_cc TEXT,
        bank_name TEXT,
        bank_account_name TEXT,
        bank_account_number TEXT,
        bank_address TEXT,
        tax_number TEXT,
        primary_active_bank_account TEXT,
        commercial_model TEXT CHECK(commercial_model IN ('Outright Purchase (1 Year)', 'Lease-to-Own (3-5 years)', 'Rent', '')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);
    
    // Check which columns exist in the old schema and migrate accordingly
    const hasCompanyName = schema.includes('company_name');
    const hasCustomerName = schema.includes('customer_name');
    const hasPrimaryBank = schema.includes('primary_active_bank_account');
    
    if (hasCompanyName || hasCustomerName) {
      const companyNameCol = hasCompanyName ? 'company_name' : 'customer_name';
      const companyAddressCol = hasCompanyName ? 'company_office_address' : 'customer_office_address';
      const primaryBankSelect = hasPrimaryBank ? 'COALESCE(primary_active_bank_account, "")' : '""';
      
      db.run(`
        INSERT INTO onboarding_data_migrated (
          id, client_id, company_name, company_office_address, company_registration_no, company_tax_number, company_ssm_no, company_sst_no,
          car_park_site_name, car_park_site_address, car_park_type,
          no_of_entry, no_of_exit, no_of_zone, no_of_validator, no_of_parking_bay,
          authorized_pic_office_name, authorized_pic_office_contact,
          authorized_pic_site_name, authorized_pic_site_contact,
          authorized_email, authorized_email_cc,
          bank_name, bank_account_name, bank_account_number, bank_address, tax_number,
          primary_active_bank_account, commercial_model, created_at, updated_at
        )
        SELECT
          id, client_id, COALESCE(${companyNameCol}, ''), COALESCE(${companyAddressCol}, ''), 
          COALESCE(company_registration_no, ''), COALESCE(company_tax_number, ''), COALESCE(company_ssm_no, ''), COALESCE(company_sst_no, ''),
          COALESCE(car_park_site_name, ''), COALESCE(car_park_site_address, ''), COALESCE(car_park_type, ''),
          COALESCE(no_of_entry, 0), COALESCE(no_of_exit, 0), COALESCE(no_of_zone, 0), COALESCE(no_of_validator, 0), COALESCE(no_of_parking_bay, 0),
          COALESCE(authorized_pic_office_name, ''), COALESCE(authorized_pic_office_contact, ''),
          COALESCE(authorized_pic_site_name, ''), COALESCE(authorized_pic_site_contact, ''),
          COALESCE(authorized_email, ''), COALESCE(authorized_email_cc, ''),
          COALESCE(bank_name, ''), COALESCE(bank_account_name, ''), COALESCE(bank_account_number, ''), COALESCE(bank_address, ''), COALESCE(tax_number, ''),
          ${primaryBankSelect}, COALESCE(commercial_model, ''), COALESCE(created_at, CURRENT_TIMESTAMP), COALESCE(updated_at, CURRENT_TIMESTAMP)
        FROM onboarding_data
      `);
    } else {
      const primaryBankSelect = hasPrimaryBank ? 'primary_active_bank_account' : '""';
      
      db.run(`
        INSERT INTO onboarding_data_migrated (
          id, client_id, company_name, company_office_address, company_registration_no, company_tax_number, company_ssm_no, company_sst_no,
          car_park_site_name, car_park_site_address, car_park_type,
          no_of_entry, no_of_exit, no_of_zone, no_of_validator, no_of_parking_bay,
          authorized_pic_office_name, authorized_pic_office_contact,
          authorized_pic_site_name, authorized_pic_site_contact,
          authorized_email, authorized_email_cc,
          bank_name, bank_account_name, bank_account_number, bank_address, tax_number,
          primary_active_bank_account, commercial_model, created_at, updated_at
        )
        SELECT
          id, client_id, company_name, company_office_address, company_registration_no, company_tax_number, company_ssm_no, company_sst_no,
          car_park_site_name, car_park_site_address, car_park_type,
          no_of_entry, no_of_exit, no_of_zone, no_of_validator, no_of_parking_bay,
          authorized_pic_office_name, authorized_pic_office_contact,
          authorized_pic_site_name, authorized_pic_site_contact,
          authorized_email, authorized_email_cc,
          bank_name, bank_account_name, bank_account_number, bank_address, tax_number,
          ${primaryBankSelect}, commercial_model, created_at, updated_at
        FROM onboarding_data
      `);
    }
    
    db.run('DROP TABLE onboarding_data;');
    db.run('ALTER TABLE onboarding_data_migrated RENAME TO onboarding_data;');
    db.run('COMMIT;');
  } catch (error) {
    db.run('ROLLBACK;');
    throw error;
  } finally {
    db.run('PRAGMA foreign_keys = ON;');
  }
}

function getDb() {
  return db;
}

// Helper: run query and return results as array of objects
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper: run query and return first result
function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Helper: run statement
function run(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
}

module.exports = {
  initDatabase,
  getDb,
  saveDatabase,
  queryAll,
  queryOne,
  run,
  FORM_DEFINITIONS
};
