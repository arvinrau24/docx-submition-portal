# Document Submission Portal - SECURE VERSION

A production-ready, security-hardened web application for managing client document submissions for Touch 'n Go and bank applications.

## 🔒 Security Features

✅ **Helmet** - HTTP security headers  
✅ **Rate Limiting** - Prevents brute force attacks  
✅ **Input Validation** - Server-side validation with express-validator  
✅ **Audit Logging** - Comprehensive activity tracking  
✅ **Session Security** - Secure session management with regeneration  
✅ **Path Traversal Protection** - Prevents directory traversal attacks  
✅ **Account Lockout** - 5 failed attempts = 15 minute lockout  
✅ **MIME Type Validation** - Strict file upload validation  
✅ **Password Hashing** - bcrypt with 12 rounds  
✅ **SQL Injection Protection** - Parameterized queries  
✅ **XSS Protection** - HTML escaping and CSP headers  

## 📋 Features

### Client Management
- Unique client ID generation
- Form group assignment (Group A or Group B)
- Temporary password creation
- Client profile management

### Document Submission
- Online form filling
- Live form preview while editing
- Multi-document upload with validation
- Progress tracking
- Auto-rename on download
- Bulk ZIP download

### Status Tracking
- Touch 'n Go status (Pending → Submitted → Approved)
- Bank status (Pending → Submitted → Approved)
- Separate tracking for each approval process
- Submission completion tracking

### Role-Based Access
- **Admin**: Full system access, client management, status updates
- **Staff**: View clients, download documents, view statuses (read-only)
- **Client**: Submit forms and documents for their account only
- **Boss**: Read-only dashboard with overview statistics

## 🚀 Quick Start

### Development Mode
```bash
# Install dependencies
npm install

# Start the application
npm start
```

Backend code is in `backend/`; edit the HTML templates in `frontend/views.js`.

Visit `http://localhost:3000/login`

### Default Credentials
| Role   | Username | Password  |
|--------|----------|-----------|
| Admin  | admin    | admin123  |
| Staff  | staff    | staff123  |
| Boss   | boss     | boss123   |

**⚠️ CHANGE THESE IMMEDIATELY IN PRODUCTION!**

## 📁 Project Structure

```
web_agreement_docx/
├── backend/
│   ├── server.js          # Application entry point and API/routes
│   └── db.js              # Database schema and form definitions
├── frontend/
│   └── views.js           # HTML templates with inline CSS
├── public/                # Static frontend assets
├── package.json           # Dependencies
├── .env                   # Environment variables (NOT in git)
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── SECURITY_REVIEW.md     # Detailed security analysis
├── DEPLOYMENT_GUIDE.md    # Production deployment guide
├── README.md              # Project documentation
└── data/
    ├── portal.db          # SQLite database (auto-created)
    ├── audit.log          # Security audit log
    └── uploads/           # Client document storage
```

## 🔧 Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Required for production
SESSION_SECRET=your-secure-64-char-random-string
NODE_ENV=production

# Optional configurations
PORT=3000
MAX_LOGIN_ATTEMPTS=5
RATE_LIMIT_WINDOW_MS=900000
SESSION_TIMEOUT_MS=1800000
MAX_FILE_SIZE_MB=10
```

## 📦 Dependencies

### Core
- `express` - Web framework
- `express-session` - Session management
- `bcryptjs` - Password hashing
- `multer` - File uploads
- `sql.js` - SQLite database

### Security
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation
- `dotenv` - Environment variables

### Utilities
- `archiver` - ZIP file creation

## 🛡️ Security Considerations

### ⚠️ DO NOT USE IN PRODUCTION WITHOUT:
1. Setting strong `SESSION_SECRET` in `.env`
2. Enabling HTTPS/SSL
3. Changing all default passwords
4. Reviewing `SECURITY_REVIEW.md`
5. Following `DEPLOYMENT_GUIDE.md`

### Current Limitations
- ❌ No HTTPS (requires reverse proxy)
- ❌ No 2FA
- ❌ No database encryption
- ❌ In-memory login attempt tracking (use Redis in production)
- ❌ No CSRF tokens (express-validator deprecation)

See `SECURITY_REVIEW.md` for complete security analysis.

## 📖 Documentation

- **[SECURITY_REVIEW.md](SECURITY_REVIEW.md)** - Complete security audit and recommendations
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[.env.example](.env.example)** - Environment configuration template

## 🔄 Workflow

### Admin Workflow
1. Login → Admin Dashboard
2. "+ Add New Client" → Enter details + Select form group (A or B)
3. System generates Client ID + Temp Password
4. Share credentials with client
5. Monitor submissions in dashboard
6. Download documents when ready
7. Update TNG/Bank statuses as approvals come in

### Client Workflow
1. Login with provided credentials (CLT-XXXX)
2. See assigned form group (A or B)
3. Fill online form
4. Upload required documents (PDF, JPG, PNG, DOC, DOCX)
5. Submit when complete
6. Wait for TNG and Bank approvals

### Staff Workflow
1. Login → View all client submissions
2. Download documents to submit to TNG/Bank
3. View current statuses (read-only)

### Boss Workflow
1. Login → See overview dashboard
2. View statistics and current statuses
3. Monitor progress (read-only, no editing)

## 🚨 Security Incident Response

If breach suspected:
```bash
# Stop the server immediately
pm2 stop portal-secure

# Preserve evidence
cp data/audit.log /secure/backup/
cp data/portal.db /secure/backup/

# Review logs
grep "FAILED\|UNAUTHORIZED" data/audit.log
```

See full incident response plan in `DEPLOYMENT_GUIDE.md`.

## 📊 Monitoring

### Audit Log
```bash
# View real-time activity
tail -f data/audit.log

# Search for security events
grep "LOGIN_FAILED" data/audit.log
grep "UNAUTHORIZED" data/audit.log
grep "TRAVERSAL" data/audit.log
```

### Application Logs
```bash
# If using PM2
pm2 logs portal-secure
pm2 monit
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (test rate limiting after 5 attempts)
- [ ] Create new client
- [ ] Upload documents (various file types)
- [ ] Try uploading invalid file types
- [ ] Download individual document
- [ ] Download ZIP bundle
- [ ] Update TNG/Bank status
- [ ] Test each role's access restrictions
- [ ] Check audit log entries

### Security Testing
```bash
# Run npm audit
npm audit

# Check for outdated packages
npm outdated
```

## 📝 Form Groups

### Group A (Form A)
- Bank Statement (3 months) - Required
- SSM Certificate - Required
- Director IC - Required
- Business Registration - Optional

### Group B (Form B)
- Bank Statement (6 months) - Required
- Company Profile - Required
- Financial Statement - Required
- Authorization Letter - Optional

(Configure in `db.js` → `FORM_DEFINITIONS`)

## 🔗 API Endpoints

### Authentication
- `GET /login` - Login page
- `POST /login` - Login submission
- `GET /logout` - Logout

### Admin
- `GET /admin` - Dashboard
- `GET /admin/add-client` - Add client form
- `POST /admin/add-client` - Create client
- `GET /admin/client/:id` - Client details
- `POST /admin/client/:id/status` - Update status
- `GET /admin/client/:id/download/:docId` - Download document
- `GET /admin/client/:id/download-all` - Download ZIP
- `POST /admin/client/:id/delete` - Delete client

### Staff
- `GET /staff` - Dashboard
- `GET /staff/client/:id` - View client
- `GET /staff/client/:id/download/:docId` - Download document
- `GET /staff/client/:id/download-all` - Download ZIP

### Boss
- `GET /boss` - Read-only dashboard

## 💡 Tips

### Performance
- Use PM2 cluster mode for high traffic
- Enable gzip compression
- Regularly vacuum SQLite database
- Implement caching for static assets

### Backup
- Automate daily database backups
- Store backups off-site
- Test restore procedure monthly

### Monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure email alerts for downtime
- Monitor disk space (uploads can grow large)

## 📞 Support

For issues or questions:
1. Check `SECURITY_REVIEW.md` for security questions
2. Check `DEPLOYMENT_GUIDE.md` for deployment issues
3. Review audit logs for activity tracking
4. Check PM2 logs for application errors

## 📜 License

Proprietary - Internal use only

## ⚠️ Disclaimer

This system handles sensitive client documents. Ensure proper security measures are in place before production deployment. Review all security documentation and follow deployment guidelines carefully.

---

**Last Updated**: 2026-07-22  
**Version**: 1.0.0-secure  
**Status**: Production-ready (after security configuration)