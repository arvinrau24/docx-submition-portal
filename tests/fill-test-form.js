/**
 * Test Script: Fill Due Diligence Form for ACCESS_DIGITAL Test Client
 * This script automates filling the due diligence form with test data
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
  console.log('🧪 Automated Due Diligence Form Test\n');
  console.log('This script will:');
  console.log('1. Login as admin');
  console.log('2. Create ACCESS_DIGITAL test client');
  console.log('3. Login as the client');
  console.log('4. Fill and submit the due diligence form\n');
  console.log('Starting...\n');

  try {
    // Step 1: Login as admin
    console.log('📝 Step 1: Logging in as admin...');
    await makeRequest('/login', 'POST', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✅ Admin login successful\n');

    // Step 2: Create test client
    console.log('📝 Step 2: Creating ACCESS_DIGITAL test client...');
    const clientData = {
      form_group: 'A',
      company_name: 'Access Digital Sdn Bhd',
      company_office_address: 'Level 15, Menara Prestige\nJalan Pinang, 50450 Kuala Lumpur\nMalaysia',
      company_registration_no: '202001012345',
      company_tax_number: 'C1234567890',
      company_ssm_no: 'SSM202001012345',
      company_sst_no: 'SST123456789',
      car_park_site_name: 'Menara Prestige Car Park',
      car_park_site_address: 'Level B1-B3, Menara Prestige\nJalan Pinang, 50450 Kuala Lumpur',
      car_park_type: 'Commercial Building (Mall)',
      no_of_entry: '3',
      no_of_exit: '3',
      no_of_zone: '5',
      no_of_validator: '2',
      no_of_parking_bay: '250',
      authorized_pic_office_name: 'Ahmad bin Abdullah',
      authorized_pic_office_contact: '+60123456789',
      authorized_pic_site_name: 'Siti Nurhaliza',
      authorized_pic_site_contact: '+60198765432',
      authorized_email: 'admin@accessdigital.com.my',
      authorized_email_cc: 'finance@accessdigital.com.my',
      bank_name: 'Maybank Berhad',
      bank_account_name: 'Access Digital Sdn Bhd',
      bank_account_number: '1234567890123',
      bank_address: 'Maybank Tower, Jalan Tun Perak, 50050 Kuala Lumpur',
      tax_number: 'C1234567890',
      primary_active_bank_account: '1',
      commercial_model: 'Lease-to-Own (3-5 years)',
      declaration: '1',
      action: 'save'
    };

    const createResponse = await makeRequest('/admin/add-client', 'POST', clientData, sessionCookie);
    
    // Extract client ID from response
    const clientIdMatch = createResponse.body.match(/Client ID:<\/strong>\s*<code[^>]*>([^<]+)<\/code>/);
    const passwordMatch = createResponse.body.match(/Temporary Password:<\/strong>\s*<code[^>]*>([^<]+)<\/code>/);
    
    if (!clientIdMatch || !passwordMatch) {
      console.error('❌ Failed to extract client credentials from response');
      console.log('Response body:', createResponse.body.substring(0, 500));
      return;
    }

    const clientId = clientIdMatch[1].trim();
    const tempPassword = passwordMatch[1].trim();
    
    console.log(`✅ Client created successfully`);
    console.log(`   Client ID: ${clientId}`);
    console.log(`   Password: ${tempPassword}\n`);

    // Step 3: Logout admin and login as client
    console.log('📝 Step 3: Logging out admin...');
    await makeRequest('/logout', 'GET', null, sessionCookie);
    console.log('✅ Admin logged out\n');

    console.log('📝 Step 4: Logging in as client...');
    await makeRequest('/login', 'POST', {
      username: clientId,
      password: tempPassword
    });
    console.log('✅ Client login successful\n');

    // Step 5: Fill due diligence form
    console.log('📝 Step 5: Filling due diligence form with comprehensive test data...');
    const dueDiligenceData = {
      // Part 1A: Company Details
      date_of_application: '2026-07-31',
      business_relationship_type: 'TNG Cashless Parking Provider',
      purpose_of_relationship: 'To provide cashless parking solutions and payment gateway services for car park management',
      company_name: 'Access Digital Sdn Bhd',
      old_reg_no: 'ROC-2020-001234',
      new_reg_no: '202001012345',
      tin_no: 'C1234567890',
      sst_reg_no: 'SST123456789',
      date_of_incorporation: '2020-01-15',
      country_of_incorporation: 'Malaysia',
      contact_number: '+60123456789',
      registered_address: 'Level 15, Menara Prestige, Jalan Pinang, 50450 Kuala Lumpur, Malaysia',
      business_address: 'Level 15, Menara Prestige, Jalan Pinang, 50450 Kuala Lumpur, Malaysia',
      nature_of_business: 'Digital payment solutions, parking management systems, and technology services',
      business_email: 'corporate@accessdigital.com.my',
      contact_email: 'contact@accessdigital.com.my',

      // Part 1B: Company Structure
      has_corporate_shareholder: 'Yes',
      corporate_shareholder_details: 'Digital Solutions Holdings Sdn Bhd (70% shareholding), Technology Ventures Capital (30% shareholding)',
      is_corporate_group: 'Yes',
      group_structure_details: 'Part of Digital Solutions Holdings Group which includes:\n- Access Digital Sdn Bhd (Operating Company)\n- Digital Solutions Holdings Sdn Bhd (Parent Company)\n- Tech Innovation Labs Sdn Bhd (Sister Company)',

      // Part 1D: Source of Funds
      source_of_fund: 'Capital injection',
      source_of_fund_others: 'Venture capital funding from Technology Ventures Capital',

      // Part 2A: Other Entity (Optional - filling for completeness)
      entity_name: 'Access Digital Technology Services',
      entity_reg_no: 'EN202001012345',
      entity_tin: 'TIN987654321',
      entity_sst: 'SST987654321',
      entity_date_registration: '2020-01-15',
      entity_country_registration: 'Malaysia',
      entity_contact_no: '+60123456789',
      entity_registered_address: 'Level 15, Menara Prestige, Jalan Pinang, 50450 Kuala Lumpur, Malaysia',
      entity_email: 'entity@accessdigital.com.my',
      entity_contact_email: 'entity.contact@accessdigital.com.my',
      entity_activity_type: 'Technology services and digital payment solutions',
      entity_office_bearers: 'CEO: Datuk Ahmad bin Abdullah\nCFO: Datin Siti Nurhaliza\nCTO: En. Muhammad Hafiz',

      // Declaration
      declaration_signature: 'Ahmad bin Abdullah',
      declaration_name: 'Ahmad bin Abdullah',
      declaration_designation: 'Chief Executive Officer',
      declaration_date: '2026-07-31',

      // Action: save as draft first
      action: 'save',
      _submitted: '0'
    };

    await makeRequest('/client/due-diligence', 'POST', dueDiligenceData, sessionCookie);
    console.log('✅ Due diligence form saved as draft\n');

    // Step 6: Submit the form
    console.log('📝 Step 6: Submitting the form...');
    dueDiligenceData.action = 'submit';
    dueDiligenceData._submitted = '1';
    await makeRequest('/client/due-diligence', 'POST', dueDiligenceData, sessionCookie);
    console.log('✅ Due diligence form submitted successfully\n');

    console.log('🎉 Test Complete!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Test Summary:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Client Created: ${clientId}`);
    console.log(`✅ Client Password: ${tempPassword}`);
    console.log('✅ Due Diligence Form: Filled and Submitted');
    console.log('\nNext Steps:');
    console.log('1. Login as admin at http://localhost:3000');
    console.log('2. Navigate to "Due Diligence" menu');
    console.log('3. View the submitted form');
    console.log('4. Download as DOCX to verify formatting');
    console.log('\nOr login as client:');
    console.log(`   Username: ${clientId}`);
    console.log(`   Password: ${tempPassword}`);
    console.log('   View your submitted form at /client/due-diligence');
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
    console.error('   Please start the server first with: node backend/server.js');
    console.error('   Then run this test again.');
    process.exit(1);
  });
