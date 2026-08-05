#!/usr/bin/env node

/**
 * Test script to fill your PDF templates with sample data
 * This helps you verify coordinates and adjust them in backend/template-defs.js
 * 
 * Usage: node scripts/test-pdf-fill.js
 */

const path = require('path');
const fs = require('fs');
const { fillPdfTemplate, expandMultiValueFields } = require('../backend/pdf-filler');
const { getTemplate } = require('../backend/template-defs');

async function testOnboardingForm() {
  console.log('\n📄 Testing Onboarding Form...');
  
  const template = getTemplate('onboarding');
  
  // Sample data matching your form fields
  const sampleData = {
    serial_number: 'SN00001',
    header_date: '03/08/2026',
    company_name: 'ABC Parking Solutions Sdn Bhd',
    company_office_address: '123 Jalan Technology, Cyberjaya, Selangor 63000, Malaysia',
    company_registration_no: '201901234567',
    company_tax_number: 'C1234567890',
    company_ssm_no: 'SSM-123456-A',
    company_sst_no: 'SST-987654-B',
    car_park_site_name: 'Cyberjaya Tech Mall',
    car_park_site_address: '456 Jalan Shopping, Cyberjaya, Selangor 63000',
    car_park_type: 'Commercial Building (Mall)',
    no_of_entry: '3',
    no_of_exit: '2',
    no_of_zone: '5',
    no_of_validator: '4',
    no_of_parking_bay: '150',
    authorized_pic_office_name: 'Ahmad bin Abdullah',
    authorized_pic_office_contact: '+60123456789',
    authorized_pic_site_name: 'Siti binti Hassan',
    authorized_pic_site_contact: '+60198765432',
    authorized_email: 'operations@abcparking.com.my',
    authorized_email_cc: 'finance@abcparking.com.my',
    bank_name: 'Maybank',
    bank_account_name: 'ABC Parking Solutions Sdn Bhd',
    bank_account_number: '1234567890123',
    bank_address: 'Maybank Tower, Kuala Lumpur',
    primary_active_bank_account: '1',
    commercial_model: 'Lease-to-Own (3-5 years)',
    declaration_name: 'Ahmad bin Abdullah',
    declaration_designation: 'Managing Director',
    declaration_date: '2026-07-31'
  };

  const expandedData = expandMultiValueFields(sampleData, template.fields);
  
  try {
    const pdfBuffer = await fillPdfTemplate(
      template.file,
      template.fields,
      expandedData,
      { signatures: {} }
    );

    const outputPath = path.join(__dirname, '..', 'data', 'TEST_Onboarding_Filled.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('✅ Successfully generated: ' + outputPath);
    console.log('   Open this file to check if fields are correctly positioned');
  } catch (error) {
    console.error('❌ Error generating onboarding form:', error.message);
  }
}

async function testDueDiligenceForm() {
  console.log('\n📄 Testing Due Diligence Form...');
  
  const template = getTemplate('due_diligence');
  
  // Sample data matching due diligence form
  const sampleData = {
    date_of_application: '2026-07-31',
    business_relationship_type: 'TNG Cashless Parking Provider',
    purpose_of_relationship: 'Cashless parking system implementation',
    company_name: 'XYZ Tech Services Sdn Bhd',
    old_reg_no: '123456-A',
    new_reg_no: '202001234567',
    tin_no: 'C9876543210',
    sst_reg_no: 'SST-111222-C',
    date_of_incorporation: '2020-01-15',
    country_of_incorporation: 'Malaysia',
    contact_number: '+60321234567',
    registered_address: '789 Jalan Business Park, Petaling Jaya, Selangor 47800',
    business_address: '789 Jalan Business Park, Petaling Jaya, Selangor 47800',
    nature_of_business: 'Software and Technology Services',
    business_email: 'info@xyztech.com.my',
    contact_email: 'contact@xyztech.com.my',
    has_corporate_shareholder: 'No',
    corporate_shareholder_details: '',
    is_corporate_group: 'Yes',
    group_structure_details: 'Part of XYZ Holdings Group with 3 subsidiaries',
    source_of_fund: 'Sales profits,Capital injection',
    source_of_fund_others: '',
    entity_name: 'XYZ Tech Services',
    entity_reg_no: '202001234567',
    entity_tin: 'C9876543210',
    entity_sst: 'SST-111222-C',
    entity_date_registration: '2020-01-15',
    entity_country_registration: 'Malaysia',
    entity_contact_no: '+60321234567',
    entity_registered_address: '789 Jalan Business Park, Petaling Jaya, Selangor',
    entity_email: 'info@xyztech.com.my',
    entity_contact_email: 'contact@xyztech.com.my',
    entity_activity_type: 'Technology Solutions Provider',
    entity_office_bearers: 'Lee Wei Ming - Managing Director',
    declaration_name: 'Lee Wei Ming',
    declaration_designation: 'Managing Director',
    declaration_date: '2026-07-31'
  };

  const expandedData = expandMultiValueFields(sampleData, template.fields);
  
  try {
    const pdfBuffer = await fillPdfTemplate(
      template.file,
      template.fields,
      expandedData,
      { signatures: {} }
    );

    const outputPath = path.join(__dirname, '..', 'data', 'TEST_DueDiligence_Filled.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('✅ Successfully generated: ' + outputPath);
    console.log('   Open this file to check if fields are correctly positioned');
  } catch (error) {
    console.error('❌ Error generating due diligence form:', error.message);
  }
}

async function main() {
  console.log('🧪 PDF Template Filling Test Script');
  console.log('====================================');
  console.log('This script will generate filled PDFs with sample data.');
  console.log('Check the generated files to verify field positions.\n');

  // Ensure data directory exists
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  try {
    await testOnboardingForm();
    await testDueDiligenceForm();
    
    console.log('\n✅ All tests completed!');
    console.log('\nNext steps:');
    console.log('1. Open the generated PDFs in data/ folder');
    console.log('2. Check if text is positioned correctly');
    console.log('3. If misaligned, adjust coordinates in backend/template-defs.js');
    console.log('4. Run this script again to verify\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

main();