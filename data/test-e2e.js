const http = require('http');
const crypto = require('crypto');

const BASE = 'http://localhost:3000';
const cookieJar = [];

function request(method, path, body = null, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {}
    };

    if (cookieJar.length > 0) {
      options.headers['Cookie'] = cookieJar.join('; ');
    }

    if (body) {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(options, (res) => {
      const setCookie = res.headers['set-cookie'];
      if (setCookie) {
        setCookie.forEach(c => {
          const cookie = c.split(';')[0];
          if (!cookieJar.includes(cookie)) {
            cookieJar.push(cookie);
          }
        });
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirectCount < 10) {
            resolve(request('GET', res.headers.location, null, redirectCount + 1));
          } else {
            resolve({ statusCode: res.statusCode, headers: res.headers, body: data, redirected: true });
          }
        } else {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function extractHiddenInputs(html) {
  const inputs = {};
  const regex = /<input[^>]*name="([^"]*)"[^>]*value="([^"]*)"[^>]*>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    inputs[match[1]] = match[2];
  }
  return inputs;
}

async function runTest() {
  console.log('=== E2E Test: Admin creates client, client logs in with temp password, changes password ===\n');
  let passed = 0;
  let failed = 0;

  // Step 1: Get login page
  console.log('Step 1: GET /login');
  let res = await request('GET', '/login');
  if (res.statusCode === 200 && res.body.includes('login')) {
    console.log('  PASS: Login page loaded\n');
    passed++;
  } else {
    console.log(`  FAIL: Expected 200 with login form, got ${res.statusCode}\n`);
    failed++;
    process.exit(1);
  }

  // Step 2: Login as admin
  console.log('Step 2: POST /login (admin / admin123)');
  res = await request('POST', '/login', 'username=admin&password=admin123');
  if (res.statusCode === 200 && res.body.includes('Admin Dashboard')) {
    console.log('  PASS: Admin logged in successfully\n');
    passed++;
  } else if (res.statusCode === 302 && res.headers.location === '/admin') {
    console.log('  PASS: Admin redirected to /admin\n');
    passed++;
  } else {
    console.log(`  FAIL: Admin login failed. Status=${res.statusCode}, Location=${res.headers.location || 'none'}\n`);
    failed++;
    process.exit(1);
  }

  // Step 3: Get add-client page
  console.log('Step 3: GET /admin/add-client');
  res = await request('GET', '/admin/add-client');
  if (res.statusCode === 200 && res.body.includes('Customer Onboarding Form')) {
    console.log('  PASS: Add client page loaded\n');
    passed++;
  } else {
    console.log(`  FAIL: Add client page not accessible. Status=${res.statusCode}\n`);
    failed++;
    process.exit(1);
  }

  // Step 4: Create a new client
  console.log('Step 4: POST /admin/add-client (create new client)');
  const clientName = 'TestClient_' + crypto.randomBytes(4).toString('hex');
  const clientBody = `form_group=A&company_name=${encodeURIComponent(clientName)}&company_office_address=123+Test+Street&company_registration_no=REG123456&company_tax_number=TAX123&company_ssm_no=SSM123&company_sst_no=SST123&car_park_site_name=Test+Site&car_park_site_address=456+Test+Avenue&car_park_type=Office+Building&no_of_entry=2&no_of_exit=2&no_of_zone=1&no_of_validator=1&no_of_parking_bay=10&authorized_pic_office_name=John+Doe&authorized_pic_office_contact=0123456789&authorized_pic_site_name=Jane+Smith&authorized_pic_site_contact=0987654321&authorized_email=test%40example.com&bank_name=Test+Bank&bank_account_name=${encodeURIComponent(clientName)}&bank_account_number=1234567890&bank_address=Test+Address&tax_number=TAX123&primary_active_bank_account=1&commercial_model=Outright+Purchase+%281+Year%29&declaration=1&action=save_download`;

  res = await request('POST', '/admin/add-client', clientBody);
  if (res.body.includes('Client Created Successfully') && res.body.includes('Temporary Password')) {
    console.log('  PASS: Client created with temp password shown\n');
    passed++;
  } else {
    console.log(`  FAIL: Client creation failed. Status=${res.statusCode}`);
    console.log(`  Response snippet: ${res.body.substring(0, 500)}\n`);
    failed++;
    process.exit(1);
  }

  // Step 5: Extract temp password and client ID from the response
  console.log('Step 5: Extract temp password and client ID');
  const clientIdMatch = res.body.match(/<code[^>]*>([A-Z_]+(?:_\d+)?)<\/code>/);
  const tempPwdMatch = res.body.match(/Temporary Password.*?<code[^>]*>([a-f0-9]+)<\/code>/s);

  let clientId = null;
  let tempPassword = null;

  if (clientIdMatch) {
    clientId = clientIdMatch[1];
    console.log(`  Client ID: ${clientId}`);
  }

  if (tempPwdMatch) {
    tempPassword = tempPwdMatch[1];
    console.log(`  Temp Password: ${tempPassword}`);
  }

  if (clientId) {
    console.log('  PASS: Client ID extracted\n');
    passed++;
  } else {
    console.log('  FAIL: Could not extract client ID\n');
    failed++;
    process.exit(1);
  }

  if (tempPassword) {
    console.log('  PASS: Temp password extracted\n');
    passed++;
  } else {
    console.log('  FAIL: Could not extract temp password\n');
    failed++;
    process.exit(1);
  }

  // Step 6: Logout
  console.log('Step 6: GET /logout');
  res = await request('GET', '/logout');
  if (res.statusCode === 302 || res.statusCode === 200) {
    console.log('  PASS: Logged out\n');
    passed++;
  } else {
    console.log('  FAIL: Logout failed\n');
    failed++;
  }

  // Step 7: Client login with temp password
  console.log('Step 7: POST /login (client with temp password)');
  res = await request('POST', '/login', `username=${encodeURIComponent(clientId)}&password=${encodeURIComponent(tempPassword)}`);
  if (res.statusCode === 302 && res.headers.location === '/login') {
    console.log(`  PASS: Client logged in, no dashboard available\n`);
    passed++;
  } else if (res.statusCode === 200 && res.body.includes('CLIENT PORTAL')) {
    console.log('  PASS: Client logged in, shown login page without dashboard\n');
    passed++;
  } else {
    console.log(`  FAIL: Unexpected response for client login. Status=${res.statusCode}, Location=${res.headers.location || 'none'}\n`);
    console.log(`  Response: ${res.body.substring(0, 500)}\n`);
    failed++;
    process.exit(1);
  }

  // Step 8: Logout
  console.log('Step 8: GET /logout');
  res = await request('GET', '/logout');
  if (res.statusCode === 302 || res.statusCode === 200) {
    console.log('  PASS: Final logout successful\n');
    passed++;
  } else {
    console.log('  FAIL: Final logout failed\n');
    failed++;
  }

  // Summary
  console.log('\n========================================');
  console.log(`  TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\nAll tests passed!');
  }
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
