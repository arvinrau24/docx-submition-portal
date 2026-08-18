/**
 * Enhanced test with debug logging for checkbox processing
 */

const path = require('path');
const fs = require('fs');
const { fillPdfTemplate, expandMultiValueFields } = require('../backend/pdf-filler');
const { getTemplate } = require('../backend/template-defs');

async function debugCheckboxProcessing() {
  console.log('\n=== Debugging Checkbox Processing ===\n');
  
  const template = getTemplate('due_diligence');
  const testData = {
    date_of_application: '2026-08-13',
    company_name: 'Test Company Sdn Bhd',
    source_of_fund: ['Sales profits', 'Capital injection', 'Borrowing (bank borrowing/ advances from shareholders)'],
    company_stamp: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FAAhKDveksOjuAAAAAElFTkSuQmCC',
    declaration_name: 'John Doe',
    declaration_designation: 'Director',
    declaration_date: '2026-08-13'
  };

  console.log('📋 Original Data:');
  console.log('   source_of_fund:', testData.source_of_fund);
  console.log('   Type:', typeof testData.source_of_fund, Array.isArray(testData.source_of_fund) ? '(Array)' : '');
  console.log('');

  // Test the checkbox logic manually
  const sourceFields = Object.entries(template.fields).filter(([k, v]) => v.source === 'source_of_fund');
  
  console.log('🔍 Checkbox Field Mappings:');
  sourceFields.forEach(([fieldName, mapping]) => {
    const expectedValue = mapping.options?.checkedWhen;
    const value = testData.source_of_fund;
    const values = Array.isArray(value) ? value.map(String) : [String(value)];
    const checked = expectedValue !== undefined ? values.includes(String(expectedValue)) : false;
    
    console.log(`   ${fieldName}:`);
    console.log(`     - Expected: "${expectedValue}"`);
    console.log(`     - Values array: [${values.map(v => `"${v}"`).join(', ')}]`);
    console.log(`     - Match: ${checked ? '✅ YES' : '❌ NO'}`);
  });
  console.log('');

  // Expand and generate
  const expandedData = expandMultiValueFields(testData, template.fields);
  
  console.log('📦 After expandMultiValueFields:');
  console.log('   source_of_fund:', expandedData.source_of_fund);
  console.log('   Type:', typeof expandedData.source_of_fund);
  console.log('');

  const signatures = {
    'company_stamp_note': testData.company_stamp
  };

  console.log('📄 Generating PDF with debug data...\n');
  
  const pdfBuffer = await fillPdfTemplate(
    template.file,
    template.fields,
    expandedData,
    { signatures }
  );

  const outputPath = path.join(__dirname, '..', 'test_checkbox_debug.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log('✅ Debug PDF Generated!');
  console.log(`📁 Output: ${outputPath}`);
  console.log('\n🔍 Check Part 1D on page 1 for checkboxes marked with "X"');
}

debugCheckboxProcessing().catch(console.error);
