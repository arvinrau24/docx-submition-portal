const path = require('path');

/**
 * Template Definitions
 * Maps form data fields to PDF coordinates for each template
 * 
 * Coordinate system: (0,0) is bottom-left of page
 * To find coordinates, use scripts/find-coordinates.js
 */

const TEMPLATES = {
  // Due Diligence Form Template
  due_diligence: {
    file: path.join(__dirname, '..', 'public', 'TNGSB Due Diligence Form.pdf'),
    name: 'TNGSB Due Diligence Form',
    fields: {
      // Part 1A: Company Details
      'date_of_application': { x: 120, y: 720, size: 10, type: 'text', page: 0 },
      'business_relationship_type': { x: 120, y: 680, size: 9, type: 'text', page: 0, maxWidth: 400 },
      'business_relationship_purpose': { x: 120, y: 650, size: 9, type: 'textarea', page: 0, maxWidth: 450 },
      'company_name': { x: 120, y: 610, size: 10, type: 'text', page: 0 },
      'old_reg_no': { x: 120, y: 590, size: 10, type: 'text', page: 0 },
      'new_reg_no': { x: 120, y: 570, size: 10, type: 'text', page: 0 },
      'tin_no': { x: 120, y: 550, size: 10, type: 'text', page: 0 },
      'sst_reg_no': { x: 120, y: 530, size: 10, type: 'text', page: 0 },
      'date_of_incorporation': { x: 120, y: 510, size: 10, type: 'text', page: 0 },
      'country_of_incorporation': { x: 300, y: 510, size: 10, type: 'text', page: 0 },
      'contact_number': { x: 120, y: 490, size: 10, type: 'text', page: 0 },
      'registered_address': { x: 120, y: 470, size: 9, type: 'textarea', page: 0, maxWidth: 450 },
      'business_address': { x: 120, y: 440, size: 9, type: 'textarea', page: 0, maxWidth: 450 },
      'nature_of_business': { x: 120, y: 410, size: 10, type: 'text', page: 0, maxWidth: 450 },
      'business_email': { x: 120, y: 390, size: 10, type: 'text', page: 0 },
      'contact_email': { x: 120, y: 370, size: 10, type: 'text', page: 0 },
      
      // Part 1B: Company Structure
      'has_corporate_shareholder': { x: 120, y: 330, size: 10, type: 'text', page: 0 },
      'is_corporate_group': { x: 120, y: 310, size: 10, type: 'text', page: 0 },
      
      // Part 1D: Source of Funds
      'source_of_fund': { x: 120, y: 250, size: 10, type: 'text', page: 0, maxWidth: 450 },
      'source_of_fund_others': { x: 150, y: 230, size: 10, type: 'text', page: 0, maxWidth: 420 },
      
      // Part 2A: Other Entity (if applicable)
      'entity_name': { x: 120, y: 180, size: 10, type: 'text', page: 0 },
      'entity_registration_no': { x: 120, y: 160, size: 10, type: 'text', page: 0 },
      'entity_tin': { x: 120, y: 140, size: 10, type: 'text', page: 0 },
      
      // Declaration
      'declaration_name': { x: 120, y: 80, size: 10, type: 'text', page: 0 },
      'declaration_designation': { x: 120, y: 60, size: 10, type: 'text', page: 0 },
      'declaration_date': { x: 120, y: 40, size: 10, type: 'text', page: 0 },
      'declaration_signature': { x: 120, y: 95, size: 10, type: 'signature', page: 0, options: { width: 150, height: 40 } },
    }
  },

  // Customer Onboarding Form Template
  onboarding: {
    file: path.join(__dirname, '..', 'public', 'Customer Onboarding Form 01.pdf'),
    name: 'Customer Onboarding Form (COF01/0726/00)',
    fields: {
      // Page 1 — company and site information. Coordinates are based on
      // Customer Onboarding Form 01, revision COF01/0726/00 (two pages).
      'company_name': { x: 275, y: 620, size: 9, type: 'text', page: 0, maxWidth: 245 },
      'company_office_address': { x: 275, y: 595, size: 9, type: 'textarea', page: 0, maxWidth: 245 },
      'company_registration_no': { x: 275, y: 546, size: 9, type: 'text', page: 0, maxWidth: 245 },
      'company_tax_number': { x: 275, y: 520, size: 9, type: 'text', page: 0, maxWidth: 245 },
      'company_ssm_no': { x: 275, y: 494, size: 9, type: 'text', page: 0, maxWidth: 245 },
      'company_sst_no': { x: 275, y: 468, size: 9, type: 'text', page: 0, maxWidth: 245 },
      'car_park_site_name': { x: 275, y: 442, size: 9, type: 'text', page: 0, maxWidth: 245 },
      'car_park_site_address': { x: 275, y: 417, size: 9, type: 'textarea', page: 0, maxWidth: 245 },

      // Car-park type is a single web radio field mapped to the printed boxes.
      'car_park_type_open_site': { x: 277, y: 366, size: 9, type: 'checkbox', page: 0, source: 'car_park_type', options: { checkedWhen: 'Open Site' } },
      'car_park_type_office_building': { x: 277, y: 352, size: 9, type: 'checkbox', page: 0, source: 'car_park_type', options: { checkedWhen: 'Office Building' } },
      'car_park_type_commercial_building': { x: 277, y: 336, size: 9, type: 'checkbox', page: 0, source: 'car_park_type', options: { checkedWhen: 'Commercial Building (Mall)' } },
      'car_park_type_government_building': { x: 277, y: 322, size: 9, type: 'checkbox', page: 0, source: 'car_park_type', options: { checkedWhen: 'Government Building' } },
      'car_park_type_hospital': { x: 277, y: 308, size: 9, type: 'checkbox', page: 0, source: 'car_park_type', options: { checkedWhen: 'Hospital' } },
      'no_of_entry': { x: 275, y: 290, size: 9, type: 'text', page: 0 },
      'no_of_exit': { x: 275, y: 264, size: 9, type: 'text', page: 0 },
      'no_of_zone': { x: 275, y: 238, size: 9, type: 'text', page: 0 },
      'no_of_validator': { x: 275, y: 212, size: 9, type: 'text', page: 0 },
      'no_of_parking_bay': { x: 275, y: 186, size: 9, type: 'text', page: 0 },
      'authorized_pic_office_name': { x: 318, y: 161, size: 9, type: 'text', page: 0, maxWidth: 200 },
      'authorized_pic_office_contact': { x: 365, y: 136, size: 9, type: 'text', page: 0, maxWidth: 155 },
      'authorized_pic_site_name': { x: 318, y: 123, size: 9, type: 'text', page: 0, maxWidth: 200 },
      'authorized_pic_site_contact': { x: 365, y: 98, size: 9, type: 'text', page: 0, maxWidth: 155 },

      // Page 2 — contacts, banking and commercial mode.
      'authorized_email': { x: 275, y: 678, size: 9, type: 'text', page: 1, maxWidth: 245 },
      'authorized_email_cc': { x: 275, y: 644, size: 9, type: 'text', page: 1, maxWidth: 245 },
      'bank_name': { x: 315, y: 605, size: 9, type: 'text', page: 1, maxWidth: 205 },
      'bank_account_name': { x: 370, y: 580, size: 9, type: 'text', page: 1, maxWidth: 150 },
      'bank_account_number': { x: 360, y: 555, size: 9, type: 'text', page: 1, maxWidth: 160 },
      'bank_address': { x: 350, y: 530, size: 9, type: 'textarea', page: 1, maxWidth: 170 },
      'primary_active_bank_account': { x: 277, y: 479, size: 9, type: 'checkbox', page: 1, options: { checkedWhen: '1' } },
      'commercial_model_outright_purchase': { x: 277, y: 450, size: 9, type: 'checkbox', page: 1, source: 'commercial_model', options: { checkedWhen: 'Outright Purchase (1 Year)' } },
      'commercial_model_lease_to_own': { x: 277, y: 437, size: 9, type: 'checkbox', page: 1, source: 'commercial_model', options: { checkedWhen: 'Lease-to-Own (3-5 years)' } },
      'commercial_model_rent': { x: 277, y: 424, size: 9, type: 'checkbox', page: 1, source: 'commercial_model', options: { checkedWhen: 'Rent' } },

      // Page 2 — declaration. The website currently stores the typed name in
      // declaration_signature, so place it in the signature area as text.
      'declaration_signature': { x: 95, y: 302, size: 10, type: 'text', page: 1, maxWidth: 220 },
      'declaration_name': { x: 125, y: 277, size: 9, type: 'text', page: 1, maxWidth: 205 },
      'declaration_date': { x: 125, y: 264, size: 9, type: 'text', page: 1, maxWidth: 205 },
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