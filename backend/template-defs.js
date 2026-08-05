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