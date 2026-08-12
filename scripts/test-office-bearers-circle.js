#!/usr/bin/env node

/**
 * Test Office Bearers A/B Circle Drawing Feature
 * Tests that circles are drawn correctly around selected Office Bearers options
 */

const fs = require('fs');
const path = require('path');
const { fillPdfTemplate, expandMultiValueFields } = require('../backend/pdf-filler');
const { getTemplate } = require('../backend/template-defs');

async function testOfficeBearsersCircle() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     TEST: OFFICE BEARERS A/B CIRCLE DRAWING FEATURE           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const template = getTemplate('due_diligence');
    if (!template) {
      throw new Error('Due Diligence template not found');
    }

    // Test Case 1: Option A selected
    console.log('📋 Test Case 1: Option A Selected');
    console.log('─'.repeat(60));
    
    const testDataA = {
      date_of_application: '2026-08-11',
      business_relationship_type: ['Corporate Customer'],
      company_name: 'Test Company A',
      entity_name: 'Government Department A',
      entity_office_bearers_type: 'A',  // Select Option A
      entity_office_bearers: 'Test Officer A',
      declaration_name: 'John Doe',
      declaration_designation: 'Director',
      declaration_date: '2026-08-11'
    };

    const expandedDataA = expandMultiValueFields(testDataA, template.fields);
    const pdfBufferA = await fillPdfTemplate(
      template.file,
      template.fields,
      expandedDataA,
      { signatures: {} }
    );

    const outputPathA = path.join(__dirname, '..', 'public', 'TEST_OFFICE_BEARERS_OPTION_A.pdf');
    fs.writeFileSync(outputPathA, pdfBufferA);
    console.log(`✅ Generated: TEST_OFFICE_BEARERS_OPTION_A.pdf`);
    console.log(`   Size: ${(pdfBufferA.length / 1024).toFixed(2)} KB`);
    console.log(`   Option A circle should be drawn at coordinates: x=170, y=645\n`);

    // Test Case 2: Option B selected
    console.log('📋 Test Case 2: Option B Selected');
    console.log('─'.repeat(60));
    
    const testDataB = {
      date_of_application: '2026-08-11',
      business_relationship_type: ['Corporate Customer'],
      company_name: 'Test Company B',
      entity_name: 'Charity Organization B',
      entity_office_bearers_type: 'B',  // Select Option B
      entity_office_bearers: 'President, Deputy, Treasurer, Secretary',
      declaration_name: 'Jane Smith',
      declaration_designation: 'Secretary',
      declaration_date: '2026-08-11'
    };

    const expandedDataB = expandMultiValueFields(testDataB, template.fields);
    const pdfBufferB = await fillPdfTemplate(
      template.file,
      template.fields,
      expandedDataB,
      { signatures: {} }
    );

    const outputPathB = path.join(__dirname, '..', 'public', 'TEST_OFFICE_BEARERS_OPTION_B.pdf');
    fs.writeFileSync(outputPathB, pdfBufferB);
    console.log(`✅ Generated: TEST_OFFICE_BEARERS_OPTION_B.pdf`);
    console.log(`   Size: ${(pdfBufferB.length / 1024).toFixed(2)} KB`);
    console.log(`   Option B circle should be drawn at coordinates: x=170, y=630\n`);

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                       TEST RESULTS                            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    console.log('✅ Both test PDFs generated successfully!\n');
    console.log('📝 VERIFICATION STEPS:');
    console.log('   1. Open TEST_OFFICE_BEARERS_OPTION_A.pdf');
    console.log('   2. Check page 3 (Office Bearers section)');
    console.log('   3. Verify that Option A has a circle drawn around it');
    console.log('   4. Repeat for TEST_OFFICE_BEARERS_OPTION_B.pdf for Option B\n');
    console.log('💡 NOTES:');
    console.log('   • Circles are drawn using pdf-lib\'s drawCircle() method');
    console.log('   • Circle radius: 10pt (configurable via options.radius)');
    console.log('   • Border width: 1.5pt');
    console.log('   • The circle is drawn based on entity_office_bearers_type value\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testOfficeBearsersCircle();
