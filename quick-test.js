const http = require('http');
const querystring = require('querystring');

console.log('🧪 Testing Due Diligence Form Structure\n');
console.log('=' .repeat(70));

// First, let's just check if the server is responding
const req = http.get('http://localhost:3000/client/due-diligence', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('\n✅ Server responded with status:', res.statusCode);
    
    if (res.statusCode === 302 || res.statusCode === 301) {
      console.log('   Redirected to login (expected for unauthenticated requests)');
    }
    
    if (res.statusCode === 200) {
      console.log('   ✓ Authenticated access successful\n');
      
      // Check for critical elements
      const checks = [
        { name: 'Part 1 section (#p1)', pattern: 'id="p1"' },
        { name: 'Part 2 section (#p2)', pattern: 'id="p2"' },
        { name: 'Entity type radios', pattern: 'entity_type_selection' },
        { name: 'Handler function', pattern: 'function handleEntityTypeChange' },
        { name: 'Part 1 fields', pattern: 'company_name' },
        { name: 'Part 2 fields', pattern: 'entity_name_part2' }
      ];
      
      checks.forEach(check => {
        const found = data.includes(check.pattern);
        console.log(`   ${found ? '✓' : '✗'} ${check.name}`);
      });
    }
  });
}).on('error', (err) => {
  console.error('✗ Connection error:', err.message);
});
