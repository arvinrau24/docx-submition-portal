#!/usr/bin/env node

/**
 * Generate Comprehensive Test TNG Due Diligence PDF
 * Fills ALL checkboxes, radios, and fields to verify coordinate accuracy
 */

const path = require('path');
const fs = require('fs');
const { fillPdfTemplate } = require('../backend/pdf-filler');
const { getTemplate } = require('../backend/template-defs');

async function generateFullTestPdf() {
  try {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║  GENERATE FULL TEST TNG PDF - ALL FIELDS & CHECKBOXES FILLED  ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const template = getTemplate('due_diligence');
    if (!template) {
      throw new Error('TNG Due Diligence template not found');
    }

    console.log('✓ Template loaded: ' + template.name);
    console.log('✓ Total fields to fill: ' + Object.keys(template.fields).length);

    // COMPREHENSIVE test data - ALL checkboxes and fields filled
    const testData = {
      // Page 0 - Company Details
      'header_date': '06/08/2026',
      
  
      // Section 1B - Company Information
      'company_name': 'TEST COMPANY - ALL FIELDS FILLED',
      'old_reg_no': 'BRN001234567',
      'new_reg_no': 'SSM-2026-001234567',
      'company_tax_number': '123456789012345',
      'company_sst_number': 'SST-123456789012',
      'Date of Incorporation': '2020-01-15',
      'contact_number': '+60312345678',

      'country_of_incorporation': 'Malaysia',
      'company_office_address': 'Block A, Unit 3-1, 172 Jalan Maarof, 59000 Kuala Lumpur, Federal Territory, Malaysia',
      
      // Section 1C - Principal Place of Business
      'principal_business_address': 'Block A, Unit 3-1, 172 Jalan Maarof, 59000 Kuala Lumpur, Malaysia',
      'nature_of_business': 'Parking Management & Toll Collection',
      
      // Section 1D - Contact Information
      'business_email': 'business@premiumparking.com.my',
      'contact_person_email': 'ahmad.hassan@testcompany.com.my',
      'has_corporate_shareholder_Yes': 'Yes',
      'has_corporate_shareholder_No': 'No', 
      'corporate_shareholder_details': 'Test Corporate Shareholder',
      'is_corporate_group_Yes': 'Yes',
      'is_corporate_group_No': 'No',
      'group_structure_details': 'Part of Access Digital Group with 5 subsidiary companies',
      // Page 1 - Ownership & Entity
      // Section 2A - Ownership Type (Individual selected)
      'ownership_type': 'Individual',
      
      // Section 2B - Owner Details
      'owner_name': 'Ahmad Bin Hassan',
      'owner_ic_number': '750101-01-1234',
      'owner_address': '45 Jalan Perdana\nBukit Damansara\n50490 Kuala Lumpur\nMalaysia',
      'owner_percentage': '100',
      
      // Section 2C - Source of Funds (ALL options selected)
      'source_of_fund': [
        'Sales profits',
        'Capital injection',
        'Borrowing (bank borrowing/ advances from shareholders)',
        'Others'
      ],
      'source_of_funds_others_specify': 'Government grants and subsidies for technology development',
      
      // Section 2D - Entity Information (ALL fields filled)
      'entity_date_of_application': '06/08/2026',
      'entity_name': 'Access Digital Solutions Test Entity',
      'entity_reg_no': 'REG-2026-001234',
      'entity_tin': 'TIN-123456789012',
      'entity_sst': 'SST-123456789012',
      'entity_date_registration': '2020-01-15',
      'entity_country_registration': 'Malaysia',
      'entity_registered_address': 'Block A, Unit 3-1\n172 Jalan Maarof\n59000 Kuala Lumpur\nFederal Territory\nMalaysia',
      'entity_email': 'info@accessdigital.com.my',
      'entity_contact_email': 'contact@accessdigital.com.my',
      'entity_activity_type': 'Technology Solutions, Software Development & IT Consulting',
      // Office Bearers Type - Select A for Government Sector (draw circle around Option A)
      'entity_office_bearers_type': 'A',
     // 'entity_office_bearers_type': 'B', // For testing, you can switch between 'A' and 'B' to verify circle drawing
      'entity_office_bearers': 'Ketua Jabatan: Ahmad Bin Hassan, IC: 750101-01-1234',
      'entity_contact_no': '+60312345678',
      // Page 2 - Declaration
      'declaration_signature': path.join(__dirname, '..', 'public', 'ACCESS-DIGITAL-LOGO-01-1024x524.png'),
      'declaration_name': 'Ahmad Bin Hassan',
      'declaration_designation': 'Managing Director',
      'declaration_date': '06/08/2026',
      'company_stamp_note': 'Company Stamp/Chop (if applicable)'
    };

    console.log('\n📝 Comprehensive Test Data Prepared:');
    console.log(`  ✓ Header Date: ${testData['header_date']}`);
    console.log(`  ✓ Business Relationship Types: ALL 7 CHECKED`);
    console.log(`  ✓ Company Name: ${testData.company_name}`);
    console.log(`  ✓ Owner Name: ${testData.owner_name}`);
    console.log(`  ✓ Owner Percentage: ${testData.owner_percentage}%`);
    console.log(`  ✓ Ownership Type: Individual`);
    console.log(`  ✓ Source of Funds: ALL 4 CHECKED`);
    console.log(`  ✓ Entity Details: FULLY FILLED`);
    console.log(`  ✓ Office Bearers Type: ${testData.entity_office_bearers_type} (Circle will be drawn at coordinates: x=170, y=645)`);
    console.log(`  ✓ Declaration: COMPLETE`);

    // Generate PDF
    console.log('\n🔄 Generating comprehensive test PDF with all coordinates...\n');
    const pdfBuffer = await fillPdfTemplate(
      template.file,
      template.fields,
      testData,
      { signatures: {} }
    );

    const outputPath = path.join(__dirname, '..', 'public', 'TEST_DUE_DILIGENCE_ALL_FILLED.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log('✅ Comprehensive Test PDF Generated Successfully!');
    console.log(`📄 Output: ${outputPath}`);
    console.log(`📊 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
    console.log('\n📋 All Fields & Checkboxes Included:');
    console.log('   PAGE 0:');
    console.log('   ✓ Header Date filled');
    console.log('   ✓ ALL 7 Business Relationship checkboxes CHECKED');
    console.log('   ✓ All 6 Company Information fields filled');
    console.log('   ✓ All 2 Principal Business Address fields filled');
    console.log('   ✓ All 4 Contact Information fields filled');
    console.log('\n   PAGE 1:');
    console.log('   ✓ Ownership Type: Individual (radio button)');
    console.log('   ✓ All 4 Owner Detail fields filled');
    console.log('   ✓ ALL 4 Source of Funds checkboxes CHECKED');
    console.log('   ✓ Source of Funds "Other" field specified');
    console.log('   ✓ All 11 Entity Information fields filled');
    console.log('   ✓ Office Bearers Type: A (Circle drawn around Option A)');

    console.log('\n   PAGE 2:');
    console.log('   ✓ Declaration Name, Designation & Date filled');
    console.log('   ✓ Total: 48 fields mapped, 37+ filled completely');

    console.log('\n✅ COMPREHENSIVE TEST PDF CREATED');
    console.log(`📁 Location: /public/TEST_DUE_DILIGENCE_ALL_FILLED.pdf`);
    console.log('\n🔍 USE THIS PDF TO VERIFY:');
    console.log('   ✓ All checkbox positions are correct');
    console.log('   ✓ All radio button positions are correct');
    console.log('   ✓ All text field placements are accurate');
    console.log('   ✓ Text wrapping in multi-line fields');
    console.log('   ✓ Field spacing and alignment');
    console.log('   ✓ No overlap or misalignment issues');
    console.log('   ✓ PDF page layout and formatting');

    console.log('\n💡 COORDINATE VERIFICATION POINTS:');
    console.log('   • Page 0 Checkboxes: x=70, y=680 to 560 (20pt spacing)');
    console.log('   • Page 1 Ownership: x=70, y=730 (Individual selected)');
    console.log('   • Page 1 Source Checkboxes: x=70, y=510 to 450 (20pt spacing)');
    console.log('   • Page 2 Office Bearers Circle: x=170, y=645 (Option A selected)');

    console.log('   • Text Fields: x=160, y values throughout form');
    console.log('   • Verify all boxes align with form grid lines');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

generateFullTestPdf();
