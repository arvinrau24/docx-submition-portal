/**
 * Script: Create Filled Test PDF
 * Generates a complete test PDF with all fields filled and all checkboxes marked
 * Output: public/TEST_FORM_ALL_FILLED.pdf
 */

const { fillPdfTemplate } = require('../backend/pdf-filler');
const { getTemplate } = require('../backend/template-defs');
const fs = require('fs');
const path = require('path');

// Helper: Get today's date in DD/MM/YY format
function getTodayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

async function createFilledTestPdf() {
  console.log('📄 Creating filled test PDF with all data and checkboxes marked...\n');

  try {
    // Get the onboarding template
    const template = getTemplate('onboarding');
    
    // Prepare complete test data with all fields filled
    const testData = {
      // Header date fields (page 0 and page 1)
      header_date0: getTodayDate(),
      header_date1: getTodayDate(),
      
      // Section 1: Company Information
      company_name: 'COMPLETE TEST COMPANY SDN BHD',
      company_office_address: 'Level 25, Premium Tower\nNo. 100 Main Street\n50200 Kuala Lumpur, Malaysia',
      company_registration_no: 'SSM1234567890AB',
      company_tax_number: 'CT9876543210XY',
      company_ssm_no: 'SSM202401001234',
      company_sst_no: 'SST1234567890ZZ',
      
      // Section 2: Car Park Site Information
      car_park_site_name: 'Complete Test Parking Complex',
      car_park_site_address: 'Basement B1-B15\nComplete Plaza\n50200 Kuala Lumpur, Malaysia',
      // All car park types - will tick all checkboxes
      car_park_type: ['Open Site', 'Office Building', 'Commercial Building (Mall)', 'Government Building', 'Hospital'],
      
      // Section 3: Car Park Capacity
      no_of_entry: '6',
      no_of_exit: '6',
      no_of_zone: '12',
      no_of_validator: '20',
      no_of_parking_bay: '1500',
      
      // Section 4: Authorized Person in Charge (Office)
      authorized_pic_office_name: 'Datuk Encik Muhammad Rizuan Abdullah',
      authorized_pic_office_contact: '+601-2-3456-7890',
      
      // Section 5: Authorized Person in Charge (Site)
      authorized_pic_site_name: 'Puan Datin Siti Nurhaliza Mohamed',
      authorized_pic_site_contact: '+601-9-8765-4321',
      
      // Section 6: Authorized Email
      authorized_email: 'official@completetestcompany.com.my',
      authorized_email_cc: 'finance@completetestcompany.com.my',
      
      // Section 7: Bank Details
      bank_name: 'Maybank Berhad (MAYBANK)',
      bank_account_name: 'Test Company Sdn Bhd Account',
      bank_account_number: '67890123456',
      bank_address: 'Maybank Tower\nJalan Tun Perak\n50050 Kuala Lumpur, Malaysia',
      tax_number: 'CT9876543210XY',
      
      // Checkboxes (all checked = '1')
      primary_active_bank_account: '1',
      commercial_model: 'Lease-to-Own (3-5 years)',
      declaration: '1',
      
      // Declaration section
      declaration_signature: 'Datuk Encik Muhammad Rizuan Abdullah',
      declaration_name: 'Datuk Encik Muhammad Rizuan Abdullah',
      declaration_designation: 'Authorized Officer',
      declaration_date: getTodayDate()
    };

    // Generate the PDF with all data filled
    console.log('Filling PDF template with complete test data...');
    const pdfBuffer = await fillPdfTemplate(
      template.file,
      template.fields,
      testData,
      { signatures: {} }
    );

    // Save to public folder
    const outputPath = path.join(__dirname, '..', 'public', 'TEST_FORM_ALL_FILLED.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log('✅ PDF created successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📄 TEST PDF CREATED');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Location: public/TEST_FORM_ALL_FILLED.pdf\n`);
    console.log('📋 FORM CONTENT:');
    console.log('✅ All fields filled with complete test data');
    console.log('✅ Header date auto-filled with today\'s date');
    console.log('✅ All checkboxes marked with X:');
    console.log('   • Primary & Active Bank Account');
    console.log('   • Commercial Model: Lease-to-Own (3-5 years)');
    console.log('   • Declaration: I certify that information is true\n');
    console.log('📝 DATA INCLUDED:');
    console.log(`   • Company: ${testData.company_name}`);
    console.log(`   • Registration: ${testData.company_registration_no}`);
    console.log(`   • Car Park: ${testData.car_park_site_name}`);
    console.log(`   • Parking Bays: ${testData.no_of_parking_bay}`);
    console.log(`   • Bank: ${testData.bank_name}`);
    console.log(`   • Account: ${testData.bank_account_name.trim()}`);
    console.log(`   • Date: ${testData.header_date}\n`);
    console.log('🔍 HOW TO VIEW:');
    console.log('   1. Open browser: http://localhost:3000');
    console.log('   2. Download: http://localhost:3000/public/TEST_FORM_ALL_FILLED.pdf');
    console.log('   3. Or find file: public/TEST_FORM_ALL_FILLED.pdf\n');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error creating PDF:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
createFilledTestPdf();
