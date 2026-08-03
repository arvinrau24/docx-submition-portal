/**
 * Basic test for Due Diligence Form Routes
 * Run this after starting the server with: node tests/test-due-diligence.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path, method = 'GET', data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Due Diligence Form Routes...\n');

  try {
    // Test 1: Check if server is running
    console.log('✓ Test 1: Server health check');
    const health = await makeRequest('/');
    if (health.statusCode === 302 || health.statusCode === 200) {
      console.log('  ✅ Server is running\n');
    } else {
      throw new Error('Server not responding correctly');
    }

    // Test 2: Check login page loads
    console.log('✓ Test 2: Login page');
    const login = await makeRequest('/login');
    if (login.statusCode === 200 && login.body.includes('Welcome to the AD Client Portal')) {
      console.log('  ✅ Login page loads correctly\n');
    } else {
      throw new Error('Login page not loading');
    }

    // Test 3: Check client due diligence route exists (should redirect to login)
    console.log('✓ Test 3: Client due diligence route');
    const clientDueDil = await makeRequest('/client/due-diligence');
    if (clientDueDil.statusCode === 302) {
      console.log('  ✅ Route exists and redirects unauthenticated users\n');
    } else {
      throw new Error('Client due diligence route not working');
    }

    // Test 4: Check admin due diligence route exists (should redirect to login)
    console.log('✓ Test 4: Admin due diligence route');
    const adminDueDil = await makeRequest('/admin/due-diligence');
    if (adminDueDil.statusCode === 302) {
      console.log('  ✅ Route exists and redirects unauthenticated users\n');
    } else {
      throw new Error('Admin due diligence route not working');
    }

    console.log('✅ All basic route tests passed!\n');
    console.log('📝 Manual Testing Required:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Login with: admin / admin123');
    console.log('   3. Create a test client from Admin Dashboard');
    console.log('   4. Login as the client and fill the Due Diligence Form');
    console.log('   5. Submit the form and verify it appears in Admin > Due Diligence');
    console.log('   6. Download the form as DOCX and verify formatting\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
