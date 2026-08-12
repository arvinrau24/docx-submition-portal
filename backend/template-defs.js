const path = require('path');

/**
 * Template Definitions
 * Maps form data fields to PDF coordinates for each template
 * 
 * Coordinate system: (0,0) is bottom-left of page
 * To find coordinates, use scripts/find-coordinates.js
 */

const TEMPLATES = {
  // Customer Onboarding Form Template
  onboarding: {
    file: path.join(__dirname, '..', 'public', 'Customer Onboarding Form 01.pdf'),
    name: 'Customer Onboarding Form (COF01/0726/00)',
    fields: {
       // Header date field (top of page)
       'header_date0': { x: 439, y: 716, size: 8, type: 'text', page: 0, maxWidth: 80 },
       'header_date1': { x: 439, y: 716, size: 8, type: 'text', page: 1, maxWidth: 80 },
       // Page 1 — company and site information. Coordinates are based on
       // Customer Onboarding Form 01, revision COF01/0726/00 (two pages).
       'company_name': { x: 275, y: 617, size: 9, type: 'text', page: 0, maxWidth: 245 },
      'company_office_address': { x: 275, y: 592, size: 9, type: 'textarea', page: 0, maxWidth: 245 },
      'company_registration_no': { x: 275, y: 543, size: 9, type: 'text', page: 0, maxWidth: 245 },
      'company_tax_number': { x: 275, y: 517, size: 9, type: 'text', page: 0, maxWidth: 245 },
      'company_ssm_no': { x: 275, y: 491, size: 9, type: 'text', page: 0, maxWidth: 245 },
      'company_sst_no': { x: 275, y: 465, size: 9, type: 'text', page: 0, maxWidth: 245 },
      'car_park_site_name': { x: 275, y: 439, size: 9, type: 'text', page: 0, maxWidth: 245 },
      'car_park_site_address': { x: 275, y: 417, size: 9, type: 'textarea', page: 0, maxWidth: 245 },

      // Car-park type is a single web radio field mapped to the printed boxes.
      'car_park_type_open_site': { x: 277, y: 366, size: 9, type: 'checkbox', page: 0, source: 'car_park_type', options: { checkedWhen: 'Open Site' } },
      'car_park_type_office_building': { x: 277, y: 351, size: 9, type: 'checkbox', page: 0, source: 'car_park_type', options: { checkedWhen: 'Office Building' } },
      'car_park_type_commercial_building': { x: 277, y: 336, size: 9, type: 'checkbox', page: 0, source: 'car_park_type', options: { checkedWhen: 'Commercial Building (Mall)' } },
      'car_park_type_government_building': { x: 277, y: 322, size: 9, type: 'checkbox', page: 0, source: 'car_park_type', options: { checkedWhen: 'Government Building' } },
      'car_park_type_hospital': { x: 277, y: 308, size: 9, type: 'checkbox', page: 0, source: 'car_park_type', options: { checkedWhen: 'Hospital' } },
      'no_of_entry': { x: 275, y: 290, size: 9, type: 'text', page: 0 },
      'no_of_exit': { x: 275, y: 264, size: 9, type: 'text', page: 0 },
      'no_of_zone': { x: 275, y: 238, size: 9, type: 'text', page: 0 },
      'no_of_validator': { x: 275, y: 212, size: 9, type: 'text', page: 0 },
      'no_of_parking_bay': { x: 275, y: 186, size: 9, type: 'text', page: 0 },
      'authorized_pic_office_name': { x: 315, y: 164, size: 9, type: 'text', page: 0, maxWidth: 200 },
      'authorized_pic_office_contact': { x: 362, y: 138, size: 9, type: 'text', page: 0, maxWidth: 155 },
      'authorized_pic_site_name': { x: 316, y: 125, size: 9, type: 'text', page: 0, maxWidth: 200 },
      'authorized_pic_site_contact': { x: 363, y: 100, size: 9, type: 'text', page: 0, maxWidth: 155 },

      // Page 2 — contacts, banking and commercial mode.
      'authorized_email': { x: 275, y: 678, size: 9, type: 'text', page: 1, maxWidth: 245 },
       'authorized_email_cc': { x: 275, y: 644, size: 9, type: 'text', page: 1, maxWidth: 245 },
        'bank_name': { x: 305, y: 608, size: 9, type: 'text', page: 1, maxWidth: 205 },
        'bank_account_name': { x: 379, y: 582, size: 9, type: 'text', page: 1, maxWidth: 205 },
        'bank_account_number': { x: 364, y: 557, size: 9, type: 'text', page: 1, maxWidth: 160 },
      'bank_address': { x: 350, y: 532, size: 9, type: 'textarea', page: 1, maxWidth: 170 },
      'primary_active_bank_account': { x: 277, y: 480, size: 9, type: 'checkbox', page: 1, options: { checkedWhen: '1' } },
      'commercial_model_outright_purchase': { x: 277, y: 452, size: 9, type: 'checkbox', page: 1, source: 'commercial_model', options: { checkedWhen: 'Outright Purchase (1 Year)' } },
       'commercial_model_lease_to_own': { x: 277, y: 437, size: 9, type: 'checkbox', page: 1, source: 'commercial_model', options: { checkedWhen: 'Lease-to-Own (3-5 years)' } },
       'commercial_model_rent': { x: 277, y: 424, size: 9, type: 'checkbox', page: 1, source: 'commercial_model', options: { checkedWhen: 'Rent' } },
        
     }
   },

   // TNG Due Diligence Form Template (3 pages)
   // Coordinates extracted from actual PDF analysis (612pt × 792pt, BOTTOM-LEFT origin)
   due_diligence: {
     file: path.join(__dirname, '..', 'public', 'TNGSB Due Diligence Form.pdf'),
     name: 'TNG Due Diligence Form',
     fields: {
       // ===== PAGE 0 (First Page) =====
       // Header - Date (top right)
       'header_date': { x: 175, y: 670, size: 9, type: 'text', page: 0, maxWidth: 60 },

        // Section 1B - Company Information (Text Fields)
        'company_name': { x: 165, y: 530, size: 9, type: 'text', page: 0, maxWidth: 350 },
        'old_reg_no': { x: 165, y: 500, size: 9, type: 'text', page: 0, maxWidth: 350 },
        'new_reg_no': { x: 415, y: 500, size: 9, type: 'text', page: 0, maxWidth: 350 },
        'company_tax_number': { x: 165, y: 460, size: 9, type: 'text', page: 0, maxWidth: 350 },
        'company_sst_number': { x: 415, y: 460, size: 9, type: 'text', page: 0, maxWidth: 350 },
        'Date of Incorporation': { x: 165, y: 430, size: 9, type: 'text', page: 0, maxWidth: 150 },
        'country_of_incorporation': { x: 165, y: 400, size: 9, type: 'text', page: 0, maxWidth: 150 },
        'contact_number': { x: 165, y: 379, size: 9, type: 'text', page: 0, maxWidth: 100 },
        'company_office_address': { x: 165, y: 360, size: 9, type: 'text', page: 0, maxWidth: 500 },

       // Section 1C - Principal Place of Business (Textarea and Text)
       'principal_business_address': { x: 165, y: 345, size: 9, type: 'textarea', page: 0, maxWidth: 350 },
       'nature_of_business': { x: 165, y: 328, size: 9, type: 'text', page: 0, maxWidth: 350 },

       // Section 1D - Contact Information (Text Fields)
       'business_email': { x: 165, y: 310, size: 9, type: 'text', page: 0, maxWidth: 100 },
       'contact_person_email': { x: 415, y: 310, size: 9, type: 'text', page: 0, maxWidth: 100 },
       'has_corporate_shareholder_yes': { x: 173, y: 243, size: 9, type: 'checkbox', page: 0, source: 'has_corporate_shareholder', options: { checkedWhen: 'Yes' } },
       'has_corporate_shareholder_no': { x: 302, y: 243, size: 9, type: 'checkbox', page: 0, source: 'has_corporate_shareholder', options: { checkedWhen: 'No' } },

       'corporate_shareholder_details': { x: 170, y: 220, size: 9, type: 'text', page: 0, maxWidth: 350 },
       'is_corporate_group_yes': { x: 167, y: 182, size: 9, type: 'checkbox', page: 0, source: 'is_corporate_group', options: { checkedWhen: 'Yes' } },
       'is_corporate_group_no': { x: 369, y: 182, size: 9, type: 'checkbox', page: 0, source: 'is_corporate_group', options: { checkedWhen: 'No' } },
       'group_structure_details': { x: 170, y: 160, size: 9, type: 'text', page: 0, maxWidth: 350 },

       // ===== PAGE 1 (Second Page) =====
        // Section 2A - Business Registration (Text Fields)
       

       // Section 2C - Source of Funds (Checkboxes)
       'source_of_funds_sales': { x: 80, y: 492, size: 8, type: 'checkbox', page: 1, source: 'source_of_fund', options: { checkedWhen: 'Sales profits' } },
       'source_of_funds_capital': { x: 188, y: 492, size: 8, type: 'checkbox', page: 1, source: 'source_of_fund', options: { checkedWhen: 'Capital injection' } },
       'source_of_funds_borrowing': { x: 80, y: 480, size: 8, type: 'checkbox', page: 1, source: 'source_of_fund', options: { checkedWhen: 'Borrowing (bank borrowing/ advances from shareholders)' } },
       'source_of_funds_others': { x: 80, y: 452, size: 8, type: 'checkbox', page: 1, source: 'source_of_fund', options: { checkedWhen: 'Others' } },
       'source_of_funds_others_specify': { x: 154, y: 453, size: 9, type: 'text', page: 1, maxWidth: 350 },

       // Section 2D - Entity Information (Text and Textarea Fields)
       'entity_date_of_application': { x: 170, y: 360, size: 9, type: 'text', page: 1, maxWidth: 150 },
       'entity_name': { x: 170, y: 315, size: 9, type: 'text', page: 1, maxWidth: 350 },
       'entity_reg_no': { x: 170, y: 285, size: 9, type: 'text', page: 1, maxWidth: 350 },
       'entity_tin': { x: 170, y: 225, size: 9, type: 'text', page: 1, maxWidth: 350 },
       'entity_sst': { x: 270, y: 225, size: 9, type: 'text', page: 1, maxWidth: 350 },
       'entity_date_registration': { x: 170, y: 160, size: 9, type: 'text', page: 1, maxWidth: 150 },
       'entity_country_registration': { x: 170, y: 85, size: 9, type: 'text', page: 1, maxWidth: 350 },
       'entity_registered_address': { x: 170, y: 754, size: 9, type: 'textarea', page: 2, maxWidth: 350 },
       'entity_email': { x: 170, y: 687, size: 9, type: 'text', page: 2, maxWidth: 350 },
       'entity_contact_email': { x: 415, y: 687, size: 9, type: 'text', page: 2, maxWidth: 350 },
       'entity_activity_type': { x: 170, y: 665, size: 9, type: 'text', page: 2, maxWidth: 350 },
       // Office Bearers A/B - Draw circles around selected option based on entity_office_bearers_type
       'entity_office_bearers_A': { x: 173, y: 635, size: 9, type: 'circle', page: 2, source: 'entity_office_bearers_type', options: { checkedWhen: 'A', radius: 6 } },
       'entity_office_bearers_B': { x: 173, y: 612, size: 9, type: 'circle', page: 2, source: 'entity_office_bearers_type', options: { checkedWhen: 'B', radius: 6 } },
       'entity_contact_no': { x: 170, y: 35, size: 9, type: 'text', page: 1, maxWidth: 350 },
       // ===== PAGE 2 (Third Page) =====
       // Section 3 - Declaration and Signature
       'declaration_signature': { x: 170, y: 470, size: 9, type: 'signature', page: 2, options: { width: 300, height: 100 } },
       'declaration_name': { x: 170, y: 430, size: 9, type: 'text', page: 2, maxWidth: 350 },
       'declaration_designation': { x: 170, y: 395, size: 9, type: 'text', page: 2, maxWidth: 350 },
       'declaration_date': { x: 170, y: 355, size: 9, type: 'text', page: 2, maxWidth: 150 },

       // Section 4 - Company Stamp/Chop (optional visual marker, right side)
       'company_stamp_note': { x: 170, y: 323, size: 8, type: 'text', page: 2, maxWidth: 350 }
     }
   }
};

/**
 * Get template definition by name
 */
function getTemplate(templateName) {
  return TEMPLATES[templateName];
}

/**
 * Get all template names
 */
function getTemplateNames() {
  return Object.keys(TEMPLATES);
}

module.exports = {
  TEMPLATES,
  getTemplate,
  getTemplateNames
};