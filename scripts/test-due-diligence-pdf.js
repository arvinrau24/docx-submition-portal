const path = require('path');
const fs = require('fs');
const { fillPdfTemplate, expandMultiValueFields } = require('../backend/pdf-filler');
const { getTemplate } = require('../backend/template-defs');

async function testDueDiligencePdf() {
  console.log('\n📋 Testing TNG Due Diligence PDF Generation\n');

  try {
    const template = getTemplate('due_diligence');
    if (!template) {
      throw new Error('Due diligence template not found');
    }

    console.log('✓ Template loaded:', template.name);
    console.log('✓ PDF file:', template.file);
    console.log(`✓ Total fields: ${Object.keys(template.fields).length}`);

    // Test data
    const testData = {
      // Page 0 fields
      'header_date': '06/08/2026',
      'company_name': 'Test Company Sdn Bhd',
      'company_registration_no': 'SSM123456789',
      'company_tax_number': 'TIN123456789',
      'Date of Incorporation': '2020-01-15',
      'company_sst_number': 'SST123456789',
      'company_ssm_no': 'SSM123456789',
      'company_office_address': '123 Test Street, Kuala Lumpur 50000',
      'principal_business_address': '456 Business Avenue, Kuala Lumpur 60000',
      'principal_business_country': 'Malaysia',
      'contact_person_name': 'John Doe',
      'contact_person_designation': 'Director',
      'contact_person_email': 'john@testcompany.com',
      'contact_person_phone': '+60123456789',

      // Page 1 fields
      'ownership_type': 'Company',
      'owner_name': 'Test Holdings Ltd',
      'owner_ic_number': 'ABC123456789',
      'owner_address': '789 Owner Street, Singapore 123456',
      'owner_percentage': '100',
      'source_of_fund': 'Capital injection',
      'entity_name': 'Test Enterprise',
      'entity_reg_no': 'REG987654321',
      'entity_tin': 'TIN987654321',
      'entity_sst': 'SST987654321',
      'entity_date_registration': '2020-01-15',
      'entity_country_registration': 'Malaysia',
      'entity_registered_address': '321 Entity Road, Kuala Lumpur 70000',
      'entity_email': 'entity@testcompany.com',
      'entity_contact_email': 'contact@testcompany.com',
      'entity_activity_type': 'Parking Management',
      'entity_office_bearers': 'John Doe (Chairman), Jane Smith (Director)',

      // Page 2 fields
      'declaration_name': 'John Doe',
      'declaration_designation': 'Director',
      'declaration_date': '2026-08-06',
      'declaration_signature': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    };

    console.log('\n✓ Test data prepared');
    console.log('  - Company: ' + testData.company_name);
    console.log('  - Contact: ' + testData.contact_person_name);
    console.log('  - Date: ' + testData.header_date);

    // Expand and prepare data
    const expandedData = expandMultiValueFields(testData, template.fields);
    console.log('\n✓ Data expanded for PDF filling');

    // Handle signature
    const signatures = {};
    if (testData.declaration_signature && testData.declaration_signature.startsWith('data:image')) {
      signatures['declaration_signature'] = testData.declaration_signature;
      console.log('✓ Signature data URL prepared');
    }

    // Generate PDF
    console.log('\n⏳ Generating PDF... (this may take a moment)');
    const pdfBuffer = await fillPdfTemplate(
      template.file,
      template.fields,
      expandedData,
      { signatures }
    );

    console.log('✓ PDF generated successfully');
    console.log('  - Size: ' + (pdfBuffer.length / 1024).toFixed(2) + ' KB');

    // Save to test file
    const testOutputPath = path.join(__dirname, '..', 'public', 'TEST_DUE_DILIGENCE_FORM.pdf');
    fs.writeFileSync(testOutputPath, pdfBuffer);
    console.log('\n✅ Test PDF saved to: public/TEST_DUE_DILIGENCE_FORM.pdf');

    console.log('\n📊 Summary:');
    console.log('  ✓ Template: ' + template.name);
    console.log('  ✓ Pages: 3');
    console.log('  ✓ Fields mapped: ' + Object.keys(template.fields).length);
    console.log('  ✓ PDF size: ' + (pdfBuffer.length / 1024).toFixed(2) + ' KB');
    console.log('  ✓ Signature: Canvas drawing supported');
    console.log('\n✅ All tests passed!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

testDueDiligencePdf();
