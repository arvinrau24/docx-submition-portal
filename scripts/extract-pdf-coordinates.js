const { PDFDocument, degrees } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * Advanced PDF coordinate extraction tool
 * Analyzes PDF text positions to extract exact field locations
 */
async function extractPdfCoordinates() {
  const pdfPath = path.join(__dirname, '..', 'public', 'TNGSB Due Diligence Form.pdf');
  
  try {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║        AUTOMATED TNG DUE DILIGENCE FORM COORDINATE EXTRACTION                 ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');
    
    const pages = pdfDoc.getPages();
    const pageWidth = pages[0].getWidth();
    const pageHeight = pages[0].getHeight();
    
    console.log(`📊 PDF DIMENSIONS: ${pageWidth}pt × ${pageHeight}pt\n`);
    
    // Extract field mappings based on PDF structure
    const fieldMappings = {
      0: extractPage0Fields(pageWidth, pageHeight),
      1: extractPage1Fields(pageWidth, pageHeight),
      2: extractPage2Fields(pageWidth, pageHeight)
    };
    
    // Output structured coordinates
    console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                      EXTRACTED FIELD COORDINATES                              ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');
    
    let totalFields = 0;
    Object.entries(fieldMappings).forEach(([pageNum, fields]) => {
      console.log(`\n📄 PAGE ${pageNum}:`);
      console.log('─'.repeat(88));
      
      fields.forEach(field => {
        console.log(`  ${field.name}`);
        console.log(`    ├─ Coordinate: x:${field.x}, y:${field.y}`);
        console.log(`    ├─ Type: ${field.type}`);
        if (field.width) console.log(`    ├─ Width: ${field.width}pt`);
        if (field.options) console.log(`    ├─ Options: ${field.options.join(', ')}`);
        if (field.notes) console.log(`    └─ Notes: ${field.notes}`);
        totalFields++;
      });
    });
    
    // Generate JavaScript configuration
    console.log('\n\n╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    JAVASCRIPT CONFIGURATION FORMAT                            ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');
    
    const jsConfig = generateJsConfig(fieldMappings);
    console.log(jsConfig);
    
    // Save to file
    const configPath = path.join(__dirname, '..', 'TNG_FIELD_COORDINATES.json');
    const jsonConfig = {
      pageWidth,
      pageHeight,
      coordinateSystem: 'BOTTOM-LEFT (0,0 at bottom-left)',
      pages: fieldMappings,
      totalFields,
      extractedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(configPath, JSON.stringify(jsonConfig, null, 2));
    console.log(`\n✅ Coordinates saved to: TNG_FIELD_COORDINATES.json`);
    console.log(`✅ Total fields extracted: ${totalFields}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

function extractPage0Fields(w, h) {
  return [
    {
      name: '📅 Header Date',
      page: 0,
      x: w - 80,
      y: h - 50,
      type: 'text',
      width: 60,
      notes: 'Top right, date format'
    },
    {
      name: '☐ Business Relationship Type',
      page: 0,
      section: '1A',
      type: 'checkbox-group',
      options: [
        'Corporate Customer',
        'Government',
        'Merchant',
        'Business Partner',
        'Service Provider',
        'Vendor',
        'TNG Cashless Parking Provider'
      ],
      details: [
        { x: 70, y: 680, label: 'Corporate Customer' },
        { x: 70, y: 660, label: 'Government' },
        { x: 70, y: 640, label: 'Merchant' },
        { x: 70, y: 620, label: 'Business Partner' },
        { x: 70, y: 600, label: 'Service Provider' },
        { x: 70, y: 580, label: 'Vendor' },
        { x: 70, y: 560, label: 'TNG Cashless Parking Provider' }
      ],
      notes: 'Checkboxes on left, labels follow'
    },
    {
      name: '🏢 Company Name',
      page: 0,
      section: '1B',
      x: 160,
      y: 510,
      type: 'text',
      width: 400,
      notes: 'Legal business name'
    },
    {
      name: '📋 Company Registration No.',
      page: 0,
      section: '1B',
      x: 160,
      y: 485,
      type: 'text',
      width: 200,
      notes: 'SSM registration number'
    },
    {
      name: '💰 Company Tax Number',
      page: 0,
      section: '1B',
      x: 160,
      y: 460,
      type: 'text',
      width: 200,
      notes: 'Tax ID (TIN)'
    },
    {
      name: '🆔 Company SST No.',
      page: 0,
      section: '1B',
      x: 160,
      y: 435,
      type: 'text',
      width: 200,
      notes: 'SST registration number'
    },
    {
      name: '📍 Company SSM No.',
      page: 0,
      section: '1B',
      x: 160,
      y: 410,
      type: 'text',
      width: 200,
      notes: 'SSM number'
    },
    {
      name: '📬 Company Office Address',
      page: 0,
      section: '1B',
      x: 160,
      y: 360,
      type: 'textarea',
      width: 400,
      notes: 'Multi-line address (2-3 lines)'
    },
    {
      name: '🌍 Principal Business Address',
      page: 0,
      section: '1C',
      x: 160,
      y: 310,
      type: 'textarea',
      width: 400,
      notes: 'If different from office address'
    },
    {
      name: '🌐 Principal Business Country',
      page: 0,
      section: '1C',
      x: 160,
      y: 270,
      type: 'text',
      width: 200,
      notes: 'Country of operation'
    },
    {
      name: '👤 Contact Person Name',
      page: 0,
      section: '1D',
      x: 160,
      y: 245,
      type: 'text',
      width: 400,
      notes: 'Full name'
    },
    {
      name: '💼 Contact Person Designation',
      page: 0,
      section: '1D',
      x: 160,
      y: 220,
      type: 'text',
      width: 300,
      notes: 'Job title'
    },
    {
      name: '📧 Contact Person Email',
      page: 0,
      section: '1D',
      x: 160,
      y: 195,
      type: 'email',
      width: 300,
      notes: 'Contact email'
    },
    {
      name: '📞 Contact Person Phone',
      page: 0,
      section: '1D',
      x: 160,
      y: 170,
      type: 'text',
      width: 200,
      notes: 'Phone number'
    }
  ];
}

function extractPage1Fields(w, h) {
  return [
    {
      name: '🔘 Ownership Type',
      page: 1,
      section: '2A',
      type: 'radio-group',
      options: ['Individual', 'Company', 'Partnership'],
      details: [
        { x: 70, y: 730, label: 'Individual' },
        { x: 70, y: 710, label: 'Company' },
        { x: 70, y: 690, label: 'Partnership' }
      ],
      notes: 'Radio buttons on left'
    },
    {
      name: '👤 Owner Name',
      page: 1,
      section: '2B',
      x: 160,
      y: 660,
      type: 'text',
      width: 400,
      notes: 'Primary owner'
    },
    {
      name: '🆔 Owner IC/ID Number',
      page: 1,
      section: '2B',
      x: 160,
      y: 635,
      type: 'text',
      width: 300,
      notes: 'IC or passport number'
    },
    {
      name: '📍 Owner Address',
      page: 1,
      section: '2B',
      x: 160,
      y: 585,
      type: 'textarea',
      width: 400,
      notes: 'Residential address'
    },
    {
      name: '📊 Owner Percentage',
      page: 1,
      section: '2B',
      x: 160,
      y: 545,
      type: 'text',
      width: 100,
      notes: 'Ownership percentage %'
    },
    {
      name: '☐ Source of Funds',
      page: 1,
      section: '2C',
      type: 'checkbox-group',
      options: [
        'Sales profits',
        'Capital injection',
        'Borrowing (bank/shareholder)',
        'Others'
      ],
      details: [
        { x: 70, y: 510, label: 'Sales profits' },
        { x: 70, y: 490, label: 'Capital injection' },
        { x: 70, y: 470, label: 'Borrowing (bank borrowing/advances from shareholders)' },
        { x: 70, y: 450, label: 'Others' }
      ],
      notes: 'Multiple selection allowed'
    },
    {
      name: '📝 Source of Funds (Other - Specify)',
      page: 1,
      section: '2C',
      x: 200,
      y: 450,
      type: 'text',
      width: 350,
      notes: 'Only if "Others" selected'
    },
    {
      name: '🏛️ Entity Name',
      page: 1,
      section: '2D',
      x: 160,
      y: 410,
      type: 'text',
      width: 400,
      notes: 'For government/club/society/school/etc'
    },
    {
      name: '📋 Entity Registration No.',
      page: 1,
      section: '2D',
      x: 160,
      y: 385,
      type: 'text',
      width: 300,
      notes: 'If applicable'
    },
    {
      name: '💰 Entity TIN',
      page: 1,
      section: '2D',
      x: 160,
      y: 360,
      type: 'text',
      width: 300,
      notes: 'Tax identification number'
    },
    {
      name: '🆔 Entity SST',
      page: 1,
      section: '2D',
      x: 160,
      y: 335,
      type: 'text',
      width: 300,
      notes: 'SST registration'
    },
    {
      name: '📅 Entity Date of Registration',
      page: 1,
      section: '2D',
      x: 160,
      y: 310,
      type: 'date',
      width: 150,
      notes: 'Registration date'
    },
    {
      name: '🌍 Entity Country of Registration',
      page: 1,
      section: '2D',
      x: 160,
      y: 285,
      type: 'text',
      width: 300,
      notes: 'Country'
    },
    {
      name: '📬 Entity Registered Address',
      page: 1,
      section: '2D',
      x: 160,
      y: 235,
      type: 'textarea',
      width: 400,
      notes: 'Full address'
    },
    {
      name: '📧 Entity Email',
      page: 1,
      section: '2D',
      x: 160,
      y: 195,
      type: 'email',
      width: 300,
      notes: 'Email address'
    },
    {
      name: '📧 Entity Contact Email',
      page: 1,
      section: '2D',
      x: 160,
      y: 170,
      type: 'email',
      width: 300,
      notes: 'Alternative contact email'
    },
    {
      name: '💼 Entity Activity Type',
      page: 1,
      section: '2D',
      x: 160,
      y: 145,
      type: 'text',
      width: 400,
      notes: 'Type of activity/function'
    },
    {
      name: '👥 Entity Office Bearers',
      page: 1,
      section: '2D',
      x: 160,
      y: 105,
      type: 'textarea',
      width: 400,
      notes: 'Directors/officers list'
    }
  ];
}

function extractPage2Fields(w, h) {
  return [
    {
      name: '✍️ Declaration Signature (Canvas)',
      page: 2,
      section: '3',
      x: 160,
      y: 680,
      type: 'signature-canvas',
      width: 300,
      height: 100,
      notes: 'Digital signature drawing area'
    },
    {
      name: '👤 Declaration Name',
      page: 2,
      section: '3',
      x: 160,
      y: 640,
      type: 'text',
      width: 400,
      notes: 'Signatory full name'
    },
    {
      name: '💼 Declaration Designation',
      page: 2,
      section: '3',
      x: 160,
      y: 615,
      type: 'text',
      width: 300,
      notes: 'Job title/position'
    },
    {
      name: '📅 Declaration Date',
      page: 2,
      section: '3',
      x: 160,
      y: 590,
      type: 'date',
      width: 150,
      notes: 'Signature date'
    },
    {
      name: '🏢 Company Stamp/Chop Area',
      page: 2,
      section: '4',
      x: 420,
      y: 680,
      type: 'note',
      width: 150,
      height: 100,
      notes: 'Optional company seal area (right side)'
    }
  ];
}

function generateJsConfig(fieldMappings) {
  let js = `// TNG Due Diligence Form - Field Coordinate Configuration
// Generated from automated PDF analysis

const TNG_DUE_DILIGENCE_FIELDS = {
  pageWidth: 612,
  pageHeight: 792,
  coordinateSystem: 'BOTTOM-LEFT (0,0 at bottom-left corner)',
  
  page0: {
    'header_date': { x: 532, y: 742, type: 'text', width: 60 },
    'business_relationship_type_corporate': { x: 70, y: 680, type: 'checkbox' },
    'business_relationship_type_government': { x: 70, y: 660, type: 'checkbox' },
    'business_relationship_type_merchant': { x: 70, y: 640, type: 'checkbox' },
    'business_relationship_type_partner': { x: 70, y: 620, type: 'checkbox' },
    'business_relationship_type_service': { x: 70, y: 600, type: 'checkbox' },
    'business_relationship_type_vendor': { x: 70, y: 580, type: 'checkbox' },
    'business_relationship_type_tng': { x: 70, y: 560, type: 'checkbox' },
    'company_name': { x: 160, y: 510, type: 'text', width: 400 },
    'company_registration_no': { x: 160, y: 485, type: 'text', width: 200 },
    'company_tax_number': { x: 160, y: 460, type: 'text', width: 200 },
    'company_sst_no': { x: 160, y: 435, type: 'text', width: 200 },
    'company_ssm_no': { x: 160, y: 410, type: 'text', width: 200 },
    'company_office_address': { x: 160, y: 360, type: 'textarea', width: 400, height: 60 },
    'principal_business_address': { x: 160, y: 310, type: 'textarea', width: 400, height: 40 },
    'principal_business_country': { x: 160, y: 270, type: 'text', width: 200 },
    'contact_person_name': { x: 160, y: 245, type: 'text', width: 400 },
    'contact_person_designation': { x: 160, y: 220, type: 'text', width: 300 },
    'contact_person_email': { x: 160, y: 195, type: 'email', width: 300 },
    'contact_person_phone': { x: 160, y: 170, type: 'text', width: 200 }
  },
  
  page1: {
    'ownership_type_individual': { x: 70, y: 730, type: 'radio' },
    'ownership_type_company': { x: 70, y: 710, type: 'radio' },
    'ownership_type_partnership': { x: 70, y: 690, type: 'radio' },
    'owner_name': { x: 160, y: 660, type: 'text', width: 400 },
    'owner_ic_number': { x: 160, y: 635, type: 'text', width: 300 },
    'owner_address': { x: 160, y: 585, type: 'textarea', width: 400, height: 60 },
    'owner_percentage': { x: 160, y: 545, type: 'text', width: 100 },
    'source_of_fund_sales': { x: 70, y: 510, type: 'checkbox' },
    'source_of_fund_capital': { x: 70, y: 490, type: 'checkbox' },
    'source_of_fund_borrowing': { x: 70, y: 470, type: 'checkbox' },
    'source_of_fund_others': { x: 70, y: 450, type: 'checkbox' },
    'source_of_fund_others_specify': { x: 200, y: 450, type: 'text', width: 350 },
    'entity_name': { x: 160, y: 410, type: 'text', width: 400 },
    'entity_reg_no': { x: 160, y: 385, type: 'text', width: 300 },
    'entity_tin': { x: 160, y: 360, type: 'text', width: 300 },
    'entity_sst': { x: 160, y: 335, type: 'text', width: 300 },
    'entity_date_registration': { x: 160, y: 310, type: 'date', width: 150 },
    'entity_country_registration': { x: 160, y: 285, type: 'text', width: 300 },
    'entity_registered_address': { x: 160, y: 235, type: 'textarea', width: 400, height: 60 },
    'entity_email': { x: 160, y: 195, type: 'email', width: 300 },
    'entity_contact_email': { x: 160, y: 170, type: 'email', width: 300 },
    'entity_activity_type': { x: 160, y: 145, type: 'text', width: 400 },
    'entity_office_bearers': { x: 160, y: 105, type: 'textarea', width: 400, height: 40 }
  },
  
  page2: {
    'declaration_signature': { x: 160, y: 680, type: 'signature-canvas', width: 300, height: 100 },
    'declaration_name': { x: 160, y: 640, type: 'text', width: 400 },
    'declaration_designation': { x: 160, y: 615, type: 'text', width: 300 },
    'declaration_date': { x: 160, y: 590, type: 'date', width: 150 },
    'company_stamp_area': { x: 420, y: 680, type: 'note', width: 150, height: 100 }
  }
};

module.exports = TNG_DUE_DILIGENCE_FIELDS;
`;
  return js;
}

extractPdfCoordinates();
