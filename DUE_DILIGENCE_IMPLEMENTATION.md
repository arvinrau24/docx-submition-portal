# Due Diligence Form Implementation

## Overview
This document describes the implementation of the Due Diligence Form feature for the Access Digital Client Portal. The form allows all clients (Group A and B) to fill out a comprehensive due diligence form online, which admins can then download as a formatted DOCX file.

## Features Implemented

### 1. Client-Side Form
- **Route**: `/client/due-diligence`
- **Access**: All authenticated clients (both Group A and B)
- **Functionality**:
  - Multi-section form with validation
  - Save as draft capability
  - Submit for review
  - Read-only mode after submission
  - Auto-populate with client data where applicable

### 2. Admin View
- **Route**: `/admin/due-diligence`
- **Access**: Admin users only
- **Functionality**:
  - List all submitted due diligence forms
  - View submission status (Draft/Submitted)
  - Download individual forms as DOCX
  - Link to client details page

### 3. DOCX Generation
- **Template-based**: Generates professional DOCX files matching the original template
- **Format**: Follows "TNGSB Due Diligence Form.docx" structure
- **Features**:
  - Proper table formatting
  - Checkbox rendering (☐/☒)
  - Multi-section layout
  - Professional styling

## Form Sections

### Part 1A: Company Details
- Date of application
- Type of business relationship (multiple selection)
- Purpose of business relationship
- Company registration details
- Contact information
- Business addresses

### Part 1B: Company Structure
- Corporate shareholder information
- Corporate group details

### Part 1C: Document Requirements
- Information section (read-only)
- Lists required documents based on entity type

### Part 1D: Source of Funds
- Multiple selection options
- "Others" text field for additional details

### Part 2A: Other Entity Types
- For Government/Club/Societies/Schools/Universities/Embassy
- Registration and contact details

### Declaration Section
- Signature (typed)
- Name, Designation, Date
- Declaration statement

## Database Schema

### Table: `due_diligence_forms`
```sql
CREATE TABLE due_diligence_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER UNIQUE NOT NULL,
  form_data TEXT,                    -- JSON string of form data
  is_submitted INTEGER DEFAULT 0,    -- 0 = draft, 1 = submitted
  submission_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
)
```

## API Routes

### Client Routes
- `GET /client/due-diligence` - Display form (load existing draft if available)
- `POST /client/due-diligence` - Save or submit form

### Admin Routes
- `GET /admin/due-diligence` - List all submissions
- `GET /admin/due-diligence/:id/download` - Download specific form as DOCX
- `GET /admin/client/:id/due-diligence/download` - Download form from client detail page

## File Structure

```
backend/
  ├── server.js                 # Routes and DOCX generation logic
  └── db.js                     # Database schema

frontend/
  └── views.js                  # Form HTML generation
    ├── dueDiligenceForm()      # Client form view
    └── dueDiligenceList()      # Admin list view

tests/
  └── test-due-diligence.js    # Automated route tests

public/
  └── TNGSB Due Diligence Form.docx  # Original template reference
```

## Key Functions

### `dueDiligenceForm(client, formData, user, errors)`
Generates the HTML form for clients to fill out.
- Handles draft and submitted states
- Pre-fills data from previous saves
- Disables editing after submission

### `generateDueDiligenceDocx(client, data)`
Creates a DOCX file from form data.
- Uses `docx` library for generation
- Matches template formatting
- Handles checkbox states and multi-line fields

### `dueDiligenceList(submissions, user)`
Displays list of all submissions for admin.
- Shows company name, client ID, status
- Provides download links
- Sortable by date

## Testing

### Automated Tests
Run: `node tests/test-due-diligence.js`
- Verifies all routes exist
- Tests authentication redirects
- Confirms server is running

### Manual Testing Steps

1. **Admin Login**
   - Go to http://localhost:3000
   - Login: admin / admin123

2. **Create Test Client**
   - Navigate to "Add New Client"
   - Fill required fields
   - Note the Client ID and temporary password

3. **Client Login**
   - Logout from admin
   - Login with Client ID and temporary password
   - You'll be redirected to `/client/due-diligence`

4. **Fill Due Diligence Form**
   - Complete required fields (marked with *)
   - Click "Save Draft" to save progress
   - Click "Submit" when ready (requires confirmation)

5. **Admin Review**
   - Login as admin
   - Go to "Due Diligence" menu
   - View submitted forms
   - Click "Download" to get DOCX file

6. **Verify DOCX**
   - Open downloaded file
   - Check formatting matches template
   - Verify all data is correctly populated

## Security Features

- **Authentication Required**: Both client and admin routes require login
- **Authorization**: Clients can only view/edit their own form
- **Input Sanitization**: All form data is sanitized
- **Audit Logging**: All actions are logged
- **CSRF Protection**: Form submissions include CSRF tokens
- **Rate Limiting**: Prevents abuse

## Data Flow

```
Client fills form → POST /client/due-diligence → Save to DB
                                                 ↓
                                            JSON storage
                                                 ↓
Admin requests download → GET /admin/due-diligence/:id/download
                                                 ↓
                                    Parse JSON → Generate DOCX → Send file
```

## Fixes Applied

1. ✅ Fixed `views.js` line 538 - Single quote conflict in onclick attribute
2. ✅ Added missing return statement in `adminClientDetail()` function
3. ✅ Fixed missing `sanitizedCompanyName` variable in `/admin/add-client` route
4. ✅ Removed helper scripts from project root

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile: ✅ Responsive design

## Future Enhancements

- [ ] File upload for supporting documents
- [ ] Email notifications on submission
- [ ] Bulk download of all forms
- [ ] Form version history
- [ ] Admin comments/feedback feature
- [ ] Export to PDF option

## Support

For issues or questions:
1. Check server logs in `data/audit.log`
2. Verify database at `data/portal.db`
3. Review console output for errors

## Deployment Notes

Before production:
- Set strong `SESSION_SECRET` in `.env`
- Enable HTTPS
- Configure proper file storage (consider cloud storage)
- Set up database backups
- Review security settings in `backend/server.js`
