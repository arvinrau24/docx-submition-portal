/**
 * Test Script: Coordinate Verification Test
 * Creates a test client with ALL fields filled and ALL checkboxes checked
 * Purpose: Verify all PDF field coordinates are correct and properly positioned
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
  console.log('🧪 COORDINATE VERIFICATION TEST\n');
  console.log('This test creates a client with:');
  console.log('✅ ALL fields filled with test data');
  console.log('✅ ALL checkboxes checked');
  console.log('✅ Complete data to verify PDF field positioning\n');
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

    // Step 2: Submit Add Client Form with ALL data filled
    console.log('📝 Step 2: Submitting form with ALL fields filled and ALL checkboxes checked...');
    
    const clientData = {
      // Form Group Selection
      form_group: 'A',
      
      // ========== SECTION 1: COMPANY INFORMATION ==========
      company_name: 'Coordinate Test Company Sdn Bhd',
      company_office_address: 'Level 20, Test Tower\nJalan Test Road\n50200 Kuala Lumpur, Malaysia',
      company_registration_no: 'SSM1234567890AB',
      company_tax_number: 'CT9876543210',
      company_ssm_no: 'SSM202301012345',
      company_sst_no: 'SST1234567890',
      
      // ========== SECTION 2: CAR PARK SITE INFORMATION ==========
      car_park_site_name: 'Test Car Park Complex',
      car_park_site_address: 'Basement B1-B10\nTest Avenue\n50200 Kuala Lumpur',
      car_park_type: 'Commercial Building (Mall)',
      
      // ========== SECTION 3: CAR PARK CAPACITY ==========
      no_of_entry: '5',
      no_of_exit: '5',
      no_of_zone: '10',
      no_of_validator: '15',
      no_of_parking_bay: '1000',
      
      // ========== SECTION 4: AUTHORIZED PERSON IN CHARGE (OFFICE) ==========
      authorized_pic_office_name: 'Encik Muhammad Test bin Abdullah',
      authorized_pic_office_contact: '+601-2-3456-7890',
      
      // ========== SECTION 5: AUTHORIZED PERSON IN CHARGE (SITE) ==========
      authorized_pic_site_name: 'Puan Siti Test Binti Mohamed',
      authorized_pic_site_contact: '+601-9-8765-4321',
      
      // ========== SECTION 6: AUTHORIZED EMAIL ==========
      authorized_email: 'test.coordinator@coordinatetest.com.my',
      authorized_email_cc: 'test.finance@coordinatetest.com.my',
      
      // ========== SECTION 7: BANK DETAILS ==========
      bank_name: 'Public Bank Berhad (PB)',
      bank_account_name: ' Coordinate Test Company Account',
      bank_account_number: '3123456789012345',
      bank_address: 'Public Bank Tower\nJalan Raja Laut\n50350 Kuala Lumpur, Malaysia',
      tax_number: 'CT9876543210',
      
      // ========== ALL CHECKBOXES CHECKED ==========
      // ✅ Primary & Active Bank Account - CHECKED
      primary_active_bank_account: '1',
      
      // ========== SECTION 8: COMMERCIAL MODEL ==========
      // Selecting "Lease-to-Own (3-5 years)" will check that checkbox
      commercial_model: 'Lease-to-Own (3-5 years)',
      
      // ✅ Declaration - CHECKED
      declaration: '1',
      
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
      return;
    }

    const clientId = clientIdMatch[1].trim();
    const tempPassword = passwordMatch[1].trim();
    
    console.log('✅ Client created successfully\n');

    // Step 3: Display all filled data for verification
    console.log('🎉 Test Complete!\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ COORDINATE VERIFICATION TEST - ALL FIELDS FILLED');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log('📋 CLIENT CREATION INFO:');
    console.log(`  Client ID: ${clientId}`);
    console.log(`  Password: ${tempPassword}\n`);
    
    console.log('📋 FORM GROUP:');
    console.log(`  Group: ${clientData.form_group}\n`);
    
    console.log('📋 SECTION 1 - COMPANY INFORMATION:');
    console.log(`  Company Name: ${clientData.company_name}`);
    console.log(`  Office Address: ${clientData.company_office_address.replace(/\n/g, ' | ')}`);
    console.log(`  Registration No: ${clientData.company_registration_no}`);
    console.log(`  Tax Number: ${clientData.company_tax_number}`);
    console.log(`  SSM No: ${clientData.company_ssm_no}`);
    console.log(`  SST No: ${clientData.company_sst_no}\n`);
    
    console.log('📋 SECTION 2 - CAR PARK SITE INFORMATION:');
    console.log(`  Site Name: ${clientData.car_park_site_name}`);
    console.log(`  Site Address: ${clientData.car_park_site_address.replace(/\n/g, ' | ')}`);
    console.log(`  Type: ${clientData.car_park_type}\n`);
    
    console.log('📋 SECTION 3 - CAR PARK CAPACITY:');
    console.log(`  Entry Points: ${clientData.no_of_entry}`);
    console.log(`  Exit Points: ${clientData.no_of_exit}`);
    console.log(`  Zones: ${clientData.no_of_zone}`);
    console.log(`  Validators: ${clientData.no_of_validator}`);
    console.log(`  Parking Bays: ${clientData.no_of_parking_bay}\n`);
    
    console.log('📋 SECTION 4 - AUTHORIZED PERSON (OFFICE):');
    console.log(`  Name: ${clientData.authorized_pic_office_name}`);
    console.log(`  Contact: ${clientData.authorized_pic_office_contact}\n`);
    
    console.log('📋 SECTION 5 - AUTHORIZED PERSON (SITE):');
    console.log(`  Name: ${clientData.authorized_pic_site_name}`);
    console.log(`  Contact: ${clientData.authorized_pic_site_contact}\n`);
    
    console.log('📋 SECTION 6 - AUTHORIZED EMAIL:');
    console.log(`  Email: ${clientData.authorized_email}`);
    console.log(`  CC Email: ${clientData.authorized_email_cc}\n`);
    
    console.log('📋 SECTION 7 - BANK DETAILS:');
    console.log(`  Bank: ${clientData.bank_name}`);
    console.log(`  Account Name: ${clientData.bank_account_name}`);
    console.log(`  Account No: ${clientData.bank_account_number}`);
    console.log(`  Bank Address: ${clientData.bank_address.replace(/\n/g, ' | ')}`);
    console.log(`  Tax Number: ${clientData.tax_number}\n`);
    
    console.log('📋 CHECKBOXES STATUS:');
    console.log(`  ✅ Primary & Active Bank Account: CHECKED (value: 1)`);
    console.log(`  ✅ Commercial Model: ${clientData.commercial_model} (checkbox will be checked)`);
    console.log(`  ✅ Declaration: CHECKED (value: 1)\n`);
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 COORDINATE VERIFICATION INSTRUCTIONS:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('1. Login as admin at http://localhost:3000');
    console.log(`   Username: admin`);
    console.log(`   Password: admin123\n`);
    console.log('2. Go to Admin Dashboard');
    console.log('3. Find client: ' + clientId);
    console.log('4. Download the Onboarding PDF');
    console.log('5. Check all fields are positioned correctly:');
    console.log('   ✓ All text is within field boxes');
    console.log('   ✓ Bank Account Name has leading space indent');
    console.log('   ✓ No text overlaps with field labels');
    console.log('   ✓ All checkboxes are marked with X');
    console.log('   ✓ Multi-line fields wrap properly\n');
    console.log('Or download via: /admin/client/' + clientId.split('_')[0].toLowerCase() + '/download-onboarding-form');
    console.log('═══════════════════════════════════════════════════════════════\n');

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
    console.error('   Then run this test again with: node tests/coordinate-verification-test.js');
    process.exit(1);
  });
