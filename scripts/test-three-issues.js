/**
 * Test script to verify the three PDF generation issues are fixed:
 * 1. Date of Application mapping (Part 1A vs Part 2)
 * 2. Source of Funds checkboxes showing in PDF
 * 3. Company Stamp upload and display in PDF
 */

const path = require('path');
const fs = require('fs');
const { fillPdfTemplate, expandMultiValueFields } = require('../backend/pdf-filler');
const { getTemplate } = require('../backend/template-defs');

async function testThreeIssues() {
  console.log('\n=== Testing Three PDF Generation Issues ===\n');
  
  const template = getTemplate('due_diligence');
  if (!template) {
    console.error('❌ Template not found');
    return;
  }

  // Test Data with all three problem areas
  const testData = {
    // Issue 1: Date of Application should appear in Part 1A (page 0)
    date_of_application: '2026-08-13',
    
    // Part 1A data
    company_name: 'Test Company Sdn Bhd',
    old_reg_no: '123456-X',
    new_reg_no: '202301234567',
    tin_no: 'TIN123456',
    sst_reg_no: 'SST987654',
    date_of_incorporation: '2020-01-15',
    country_of_incorporation: 'Malaysia',
    contact_number: '03-12345678',
    registered_address: '123 Test Street, Kuala Lumpur',
    business_address: '456 Business Avenue, Petaling Jaya',
    nature_of_business: 'Software Development',
    business_email: 'business@testcompany.com',
    contact_email: 'contact@testcompany.com',
    has_corporate_shareholder: 'No',
    is_corporate_group: 'No',
    
    // Issue 2: Source of Funds checkboxes (Part 1D)
    source_of_fund: ['Sales profits', 'Capital injection', 'Borrowing (bank borrowing/ advances from shareholders)'],
    
    // Part 2 data
    entity_type: 'Part 2',
    entity_name: 'Test Entity Ltd',
    entity_office_bearers_type: 'A',
    
    // Declaration
    declaration_name: 'John Doe',
    declaration_designation: 'Managing Director',
    declaration_date: '2026-08-13',
    
    // Issue 3: Company Stamp (base64 image data)
    company_stamp: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FAAhKDveksOjuAAAAAElFTkSuQmCC'
  };

  console.log('📋 Test Data Summary:');
  console.log('  - Date of Application:', testData.date_of_application);
  console.log('  - Source of Funds:', testData.source_of_fund);
  console.log('  - Company Stamp:', testData.company_stamp ? 'Present' : 'Missing');
  console.log('');

  // Check field mappings
  console.log('🔍 Checking Field Mappings:\n');
  
  // Issue 1: Date mappings
  const dateFields = Object.entries(template.fields).filter(([k, v]) => v.source === 'date_of_application');
  console.log('1️⃣  Date of Application Mappings:');
  dateFields.forEach(([key, mapping]) => {
    console.log(`   ✓ ${key}: page ${mapping.page}, x=${mapping.x}, y=${mapping.y}`);
  });
  console.log('');
  
  // Issue 2: Source of funds checkboxes
  const sourceFields = Object.entries(template.fields).filter(([k, v]) => v.source === 'source_of_fund');
  console.log('2️⃣  Source of Funds Checkbox Mappings:');
  sourceFields.forEach(([key, mapping]) => {
    console.log(`   ✓ ${key}: checkedWhen="${mapping.options?.checkedWhen}"`);
  });
  console.log('');
  
  // Issue 3: Company stamp mapping
  const stampField = Object.entries(template.fields).find(([k, v]) => v.source === 'company_stamp');
  console.log('3️⃣  Company Stamp Mapping:');
  if (stampField) {
    const [key, mapping] = stampField;
    console.log(`   ✓ ${key}: page ${mapping.page}, type=${mapping.type}`);
  }
  console.log('');

  // Expand multi-value fields
  const expandedData = expandMultiValueFields(testData, template.fields);
  
  // Prepare signatures object for stamp
  const signatures = {};
  if (testData.company_stamp && testData.company_stamp.startsWith('data:image')) {
    signatures['company_stamp_note'] = testData.company_stamp;
  }

  // Generate PDF
  console.log('📄 Generating Test PDF...\n');
  try {
    const pdfBuffer = await fillPdfTemplate(
      template.file,
      template.fields,
      expandedData,
      { signatures }
    );

    const outputPath = path.join(__dirname, '..', 'test_three_issues_output.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log('✅ PDF Generated Successfully!');
    console.log(`📁 Output: ${outputPath}`);
    console.log('');
    console.log('🔍 Please verify in the PDF:');
    console.log('   1️⃣  Part 1A shows date: 2026-08-13');
    console.log('   2️⃣  Part 1D shows 3 checkboxes marked with "X"');
    console.log('   3️⃣  Company Stamp appears on page 3');
  } catch (err) {
    console.error('❌ Error generating PDF:', err.message);
    console.error(err.stack);
  }
}

testThreeIssues().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
