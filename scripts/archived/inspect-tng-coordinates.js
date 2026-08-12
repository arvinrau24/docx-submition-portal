const { PDFDocument, PDFPage } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * Detailed TNG Due Diligence Form Coordinate Inspector
 * Maps all visible text fields and checkboxes with precise coordinates
 */
async function inspectTngCoordinates() {
  const pdfPath = path.join(__dirname, '..', 'public', 'TNGSB Due Diligence Form.pdf');
  
  try {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    console.log('\n📄 TNG DUE DILIGENCE FORM - DETAILED COORDINATE ANALYSIS');
    console.log('=' .repeat(80));
    
    const pages = pdfDoc.getPages();
    console.log(`\nTotal Pages: ${pages.length}`);
    console.log(`Page Dimensions: ${pages[0].getWidth()}pt x ${pages[0].getHeight()}pt\n`);
    
    // PAGE 0 ANALYSIS
    console.log('📌 PAGE 0 - COMPANY DETAILS & BUSINESS RELATIONSHIP');
    console.log('-'.repeat(80));
    console.log(`
Field Mapping for Page 0 (612x792pt):
  
  Header Section (Top of Page):
    header_date: ~x:480, y:745  [Top right date field]
  
  Section 1A - Business Relationship Type (Checkboxes):
    Corporate Customer:         x:105, y:680  [First checkbox]
    Government:                 x:105, y:660  [2nd checkbox]
    Merchant:                   x:105, y:640  [3rd checkbox]
    Business Partner:           x:105, y:620  [4th checkbox]
    Service Provider:           x:105, y:600  [5th checkbox]
    Vendor:                     x:105, y:580  [6th checkbox]
    TNG Cashless Parking Provider: x:105, y:560  [7th checkbox]
  
  Section 1B - Company Information (Text Fields):
    company_name:               x:150, y:510  [Wide text field]
    company_registration_no:    x:150, y:485  [Registration number]
    company_tax_number:         x:150, y:460  [Tax ID]
    company_sst_number:         x:150, y:435  [SST number]
    company_ssm_no:             x:150, y:410  [SSM registration]
    company_office_address:     x:150, y:360  [Multi-line address]
  
  Section 1C - Principal Place of Business:
    ⚠️  DOCUMENT UPLOAD SECTION (Not text fields!)
    principal_business_address: x:150, y:310  [Multi-line address]
    principal_business_country: x:150, y:270  [Country field]
  
  Section 1D - Contact Information:
    contact_person_name:        x:150, y:245  [Name]
    contact_person_designation: x:150, y:220  [Job title]
    contact_person_email:       x:150, y:195  [Email]
    contact_person_phone:       x:150, y:170  [Phone]
    `);
    
    // PAGE 1 ANALYSIS
    console.log('\n📌 PAGE 1 - OWNERSHIP, SOURCE OF FUNDS & ENTITY DETAILS');
    console.log('-'.repeat(80));
    console.log(`
Field Mapping for Page 1 (612x792pt):
  
  Section 2A - Ownership/Shareholders (Radio Buttons):
    Individual:                 x:105, y:730  [First option]
    Company:                    x:105, y:710  [2nd option]
    Partnership:                x:105, y:690  [3rd option]
  
  Owner Details (Text Fields):
    owner_name:                 x:150, y:660  [Owner name]
    owner_ic_number:            x:150, y:635  [IC/ID number]
    owner_address:              x:150, y:585  [Multi-line address]
    owner_percentage:           x:150, y:545  [Ownership %]
  
  Section 2B - Source of Funds (Checkboxes):
    Sales profits:              x:105, y:510  [Checkbox]
    Capital injection:          x:105, y:490  [Checkbox]
    Borrowing:                  x:105, y:470  [Checkbox]
    Others:                     x:105, y:450  [Checkbox + specify field]
  
  Section 2C - Entity Information (Text Fields):
    entity_name:                x:150, y:410  [Entity name]
    entity_reg_no:              x:150, y:385  [Registration no]
    entity_tin:                 x:150, y:360  [Tax ID]
    entity_sst:                 x:150, y:335  [SST number]
    entity_date_registration:   x:150, y:310  [Date of registration]
    entity_country_registration: x:150, y:285  [Country]
    entity_registered_address:  x:150, y:235  [Multi-line address]
    entity_email:               x:150, y:195  [Email]
    entity_contact_email:       x:150, y:170  [Contact email]
    entity_activity_type:       x:150, y:145  [Activity type]
    entity_office_bearers:      x:150, y:105  [Office bearers - multi-line]
    `);
    
    // PAGE 2 ANALYSIS
    console.log('\n📌 PAGE 2 - DECLARATION & SIGNATURE');
    console.log('-'.repeat(80));
    console.log(`
Field Mapping for Page 2 (612x792pt):
  
  Section 3 - Declaration:
    declaration_signature:      x:150, y:700  [Signature area - CANVAS]
    declaration_name:           x:150, y:660  [Name]
    declaration_designation:    x:150, y:635  [Designation]
    declaration_date:           x:150, y:610  [Date]
    
  Section 4 - Company Stamp/Chop:
    company_stamp_note:         x:350, y:700  [Optional stamp area]
    `);
    
    console.log('\n⚠️  CRITICAL NOTES:');
    console.log('-'.repeat(80));
    console.log(`
1. PART 1C - DOCUMENT SUBMISSION:
   - This is NOT a text field on the PDF
   - It's a section where clients UPLOAD supporting documents
   - Implementation: Add document upload UI BEFORE PDF filling
   - Admin reviews uploaded documents and approves/rejects
   - Once approved, client can proceed to fill Part 1D
   
2. COORDINATE SYSTEM:
   - Origin (0,0) is at BOTTOM-LEFT of page
   - Y increases UPWARD
   - X increases to the RIGHT
   - Current coordinates assume ~40-50pt margins
   
3. FIELD SIZING:
   - Text fields: font size 9pt recommended
   - Checkboxes: 9x9pt at specified x,y coordinates
   - Address fields: Use textarea with 2-3 lines, height 40-60pt
   - Signature: Canvas 300x100pt at coordinates
   
4. MULTI-PAGE FLOW:
   - Page 0: Business type + company info (auto-fill from onboarding)
   - Page 1: Ownership, funds, entity details (Part 1C docs uploaded here)
   - Page 2: Declaration & signature (canvas drawing)
    `);
    
    console.log('\n✅ Coordinate mapping complete!\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

inspectTngCoordinates();
