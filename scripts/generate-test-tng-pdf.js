#!/usr/bin/env node

/**
 * Generate Test TNG Due Diligence PDF
 * Creates a filled PDF with sample data and saves to public folder
 */

const path = require('path');
const fs = require('fs');
const { fillPdfTemplate } = require('../backend/pdf-filler');
const { getTemplate } = require('../backend/template-defs');

async function generateTestPdf() {
  try {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║     GENERATE TEST TNG DUE DILIGENCE PDF FOR PUBLIC FOLDER      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const template = getTemplate('due_diligence');
    if (!template) {
      throw new Error('TNG Due Diligence template not found');
    }

    console.log('✓ Template loaded: ' + template.name);
    console.log('✓ Total fields to fill: ' + Object.keys(template.fields).length);

    // Sample data for testing
    const testData = {
      // Page 0 - Company Details
      'header_date': new Date().toLocaleDateString('en-MY'),
      'business_relationship_type': ['Corporate Customer'],
      'company_name': 'ACCESS DIGITAL SOLUTIONS SDN BHD',
      'company_registration_no': 'SSM001234567',
      'company_tax_number': '123456789012',
      'company_sst_number': 'SST123456789',
      'company_ssm_no': 'SSM001234567',
      'company_office_address': 'Unit 3A-3-1, 3A Tower\n172 Jalan Maarof\n59000 Kuala Lumpur\nMalaysia',
      'principal_business_address': 'Unit 3A-3-1, 3A Tower\n172 Jalan Maarof\n59000 Kuala Lumpur',
      'principal_business_country': 'Malaysia',
      'contact_person_name': 'Ahmad Bin Hassan',
      'contact_person_designation': 'Managing Director',
      'contact_person_email': 'ahmad@accessdigital.com',
      'contact_person_phone': '+60 3 2782 1234',

      // Page 1 - Ownership & Entity
      'ownership_type': ['Individual'],
      'owner_name': 'Ahmad Bin Hassan',
      'owner_ic_number': '750101-01-1234',
      'owner_address': '45 Jalan Perdana\nKuala Lumpur 50050\nMalaysia',
      'owner_percentage': '100',
      'source_of_fund': ['Capital injection'],
      'entity_name': 'Access Digital Solutions',
      'entity_reg_no': 'SSM001234567',
      'entity_tin': 'TIN123456789',
      'entity_sst': 'SST123456789',
      'entity_date_registration': '2020-01-15',
      'entity_country_registration': 'Malaysia',
      'entity_registered_address': 'Unit 3A-3-1, 3A Tower\n172 Jalan Maarof\n59000 Kuala Lumpur\nMalaysia',
      'entity_email': 'info@accessdigital.com',
      'entity_contact_email': 'contact@accessdigital.com',
      'entity_activity_type': 'Technology & Software Solutions',
      'entity_office_bearers': 'Ahmad Bin Hassan - Managing Director\nFatimah Binti Ibrahim - Finance Manager',

      // Page 2 - Declaration
      'declaration_name': 'Ahmad Bin Hassan',
      'declaration_designation': 'Managing Director',
      'declaration_date': new Date().toLocaleDateString('en-MY'),
    };

    console.log('\n📝 Test Data Prepared:');
    console.log(`  • Company: ${testData.company_name}`);
    console.log(`  • Owner: ${testData.owner_name}`);
    console.log(`  • Registration: ${testData.company_registration_no}`);
    console.log(`  • Pages: 3`);

    // Generate PDF
    console.log('\n🔄 Generating PDF with all coordinates...\n');
    const pdfBuffer = await fillPdfTemplate(
      template.file,
      template.fields,
      testData,
      { signatures: {} }
    );

    const outputPath = path.join(__dirname, '..', 'public', 'TEST_DUE_DILIGENCE_FILLED.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log('✅ PDF Generated Successfully!');
    console.log(`📄 Output: ${outputPath}`);
    console.log(`📊 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
    console.log('\n📋 Sample Data Included:');
    console.log('   ✓ Page 0 (14 fields): Company details, business type, contact info');
    console.log('   ✓ Page 1 (19 fields): Ownership, entity, source of funds');
    console.log('   ✓ Page 2 (5 fields): Declaration, signature, date');

    console.log('\n✅ TEST PDF CREATED - Available for download at:');
    console.log(`   /public/TEST_DUE_DILIGENCE_FILLED.pdf`);
    console.log('\n💡 Use this to verify:');
    console.log('   • Field alignment and positioning');
    console.log('   • Text formatting and wrapping');
    console.log('   • Checkbox and signature placement');
    console.log('   • Overall PDF layout and appearance');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

generateTestPdf();
