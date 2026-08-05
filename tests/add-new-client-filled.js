/**
 * Test Script: Add New Client with All Fields Filled
 * This script automates the complete "Add New Client" form submission
 * with all data filled in and all checkboxes checked
 */

const http = require('http');
const querystring = require('querystring');

const BASE_URL = 'http://localhost:3000';
let sessionCookie = '';

function makeRequest(path, method = 'GET', data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = data ? querystring.stringify(data) : null;
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData ? Buffer.byteLength(postData) : 0
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        // Capture session cookie
        if (res.headers['set-cookie']) {
          const cookies = res.headers['set-cookie'];
          sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
          cookies: sessionCookie
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTest() {
  console.log('🧪 Add New Client - Full Data Filled Test\n');
  console.log('This script will:');
  console.log('1. Login as admin');
  console.log('2. Fill the "Add New Client" form with complete data');
  console.log('3. Check all required checkboxes');
  console.log('4. Submit and verify client creation\n');
  console.log('Starting...\n');

  try {
    // Step 1: Login as admin
    console.log('📝 Step 1: Logging in as admin...');
    const loginResponse = await makeRequest('/login', 'POST', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.statusCode !== 302 && loginResponse.statusCode !== 200) {
      console.error('❌ Admin login failed');
      return;
    }
    console.log('✅ Admin login successful\n');

    // Step 2: Submit Add Client Form with all data filled
    console.log('📝 Step 2: Submitting "Add New Client" form with complete data...');
    
    const clientData = {
      // Form Group Selection
      form_group: 'A',
      
      // Section 1: Company Information
      company_name: 'Premium Parking Solutions Malaysia Sdn Bhd',
      company_office_address: 'Level 12, Tower A, Menara Sentosa\nNo. 201, Jalan Raja Chulan\n50200 Kuala Lumpur, Malaysia',
      company_registration_no: 'SSM001234567890',
      company_tax_number: 'CT1234567890',
      company_ssm_no: 'SSM202301012345',
      company_sst_no: 'SST1234567890AB',
      
      // Section 2: Car Park Site Information
      car_park_site_name: 'Menara Sentosa Parking Complex',
      car_park_site_address: 'Basement Level B1-B5\nNo. 201, Jalan Raja Chulan\n50200 Kuala Lumpur, Malaysia',
      car_park_type: 'Commercial Building (Mall)',
      
      // Section 3: Car Park Capacity
      no_of_entry: '4',
      no_of_exit: '4',
      no_of_zone: '8',
      no_of_validator: '12',
      no_of_parking_bay: '500',
      
      // Section 4: Authorized Person in Charge (Office)
      authorized_pic_office_name: 'Dato\' Mohd Rizuan Bin Abdullah',
      authorized_pic_office_contact: '+601-2-345-6789',
      
      // Section 5: Authorized Person in Charge (Site)
      authorized_pic_site_name: 'Encik Faizal Bin Hamid',
      authorized_pic_site_contact: '+601-9-876-5432',
      
      // Section 6: Authorized Email
      authorized_email: 'admin@parkingsolutions.com.my',
      authorized_email_cc: 'finance@parkingsolutions.com.my',
      
      // Section 7: Bank Details
      bank_name: 'Malayan Banking Berhad (MAYBANK)',
      bank_account_name: ' Premium Parking Solutions Sdn Bhd',
      bank_account_number: '1234567890123456',
      bank_address: 'Maybank Tower\nJalan Tun Perak\n50050 Kuala Lumpur, Malaysia',
      tax_number: 'CT1234567890',
      
      // ========== ALL CHECKBOXES CHECKED FOR TESTING ==========
      // Section 7: Primary & Active Bank Account Checkbox
      // ✅ CHECKED: Confirms this is the primary and active bank account
      primary_active_bank_account: '1',
      
      // Section 8: Commercial Model
      commercial_model: 'Lease-to-Own (3-5 years)',
      
      // Section 9: Declaration Checkbox
      // ✅ CHECKED: Confirms information is true and complete
      declaration: '1',
      // ========================================================
      
      // Action
      action: 'save'
    };

    const createResponse = await makeRequest('/admin/add-client', 'POST', clientData, sessionCookie);
    
    if (createResponse.statusCode !== 200) {
      console.error(`❌ Form submission failed with status ${createResponse.statusCode}`);
      console.log('Response:', createResponse.body.substring(0, 500));
      return;
    }

    // Extract client ID and password from response
    const clientIdMatch = createResponse.body.match(/Client ID:<\/strong>\s*<code[^>]*>([^<]+)<\/code>/);
    const passwordMatch = createResponse.body.match(/Temporary Password:<\/strong>\s*<code[^>]*>([^<]+)<\/code>/);
    
    if (!clientIdMatch || !passwordMatch) {
      console.error('❌ Failed to extract client credentials from response');
      console.log('Response contains:', createResponse.body.includes('Client Created Successfully') ? '✅ Success page' : '❌ Error page');
      return;
    }

    const clientId = clientIdMatch[1].trim();
    const tempPassword = passwordMatch[1].trim();
    
    console.log('✅ Client created successfully\n');

    // Step 3: Verify client was created by logging in as client
    console.log('📝 Step 3: Verifying client account...');
    
    await makeRequest('/logout', 'GET', null, sessionCookie);
    
    const clientLoginResponse = await makeRequest('/login', 'POST', {
      username: clientId,
      password: tempPassword
    });
    
    if (clientLoginResponse.statusCode !== 302 && clientLoginResponse.statusCode !== 200) {
      console.error('❌ Client login failed - verification unsuccessful');
      return;
    }
    console.log('✅ Client account verified and login successful\n');

    // Step 4: Display results
    console.log('🎉 Test Complete!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ TEST RESULTS - ADD NEW CLIENT WITH FILLED DATA');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Client Information:');
    console.log(`  Company Name: ${clientData.company_name}`);
    console.log(`  Client ID: ${clientId}`);
    console.log(`  Temporary Password: ${tempPassword}`);
    console.log(`  Form Group: ${clientData.form_group}`);
    console.log('\nCompany Details:');
    console.log(`  Registration No: ${clientData.company_registration_no}`);
    console.log(`  Tax Number: ${clientData.company_tax_number}`);
    console.log(`  SSM No: ${clientData.company_ssm_no}`);
    console.log('\nCar Park Details:');
    console.log(`  Site Name: ${clientData.car_park_site_name}`);
    console.log(`  Type: ${clientData.car_park_type}`);
    console.log(`  Total Bays: ${clientData.no_of_parking_bay}`);
    console.log(`  Entry Points: ${clientData.no_of_entry} | Exit Points: ${clientData.no_of_exit}`);
    console.log(`  Zones: ${clientData.no_of_zone} | Validators: ${clientData.no_of_validator}`);
    console.log('\nAuthorized Personnel:');
    console.log(`  Office PIC: ${clientData.authorized_pic_office_name}`);
    console.log(`    Contact: ${clientData.authorized_pic_office_contact}`);
    console.log(`  Site PIC: ${clientData.authorized_pic_site_name}`);
    console.log(`    Contact: ${clientData.authorized_pic_site_contact}`);
    console.log('\nContact Information:');
    console.log(`  Email: ${clientData.authorized_email}`);
    console.log(`  CC Email: ${clientData.authorized_email_cc}`);
    console.log('\nBank Details:');
    console.log(`  Bank: ${clientData.bank_name}`);
    console.log(`  Account Name:  ${clientData.bank_account_name}`);
    console.log(`  Account No:    ${clientData.bank_account_number}`);
    console.log('\nForm Status:');
    console.log(`  ✅ Primary & Active Bank Account: Checked`);
    console.log(`  ✅ Declaration: Checked`);
    console.log(`  ✅ Commercial Model: ${clientData.commercial_model}`);
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('Next Steps:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('1. Login as admin at http://localhost:3000');
    console.log('2. Go to Admin Dashboard');
    console.log('3. View the newly created client');
    console.log('4. Download the Onboarding PDF to verify all data');
    console.log('\nOr login as the new client:');
    console.log(`   Username: ${clientId}`);
    console.log(`   Password: ${tempPassword}`);
    console.log('   Access the client portal at http://localhost:3000/client/due-diligence');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Check if server is running first
makeRequest('/')
  .then(() => {
    console.log('✅ Server is running. Starting test...\n');
    runTest();
  })
  .catch(err => {
    console.error('❌ Error: Server is not running!');
    console.error('   Please start the server first with: npm start');
    console.error('   Then run this test again with: node tests/add-new-client-filled.js');
    process.exit(1);
  });
