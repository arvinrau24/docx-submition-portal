const http = require('http');

console.log('🧪 Testing Due Diligence Form in Browser\n');
console.log('=' .repeat(70));

// Test 1: Load the form and check HTML structure
console.log('\n✅ TEST 1: Fetching Due Diligence Form HTML...');

const testUrls = [
  { url: 'http://localhost:3000/client/due-diligence', name: 'Client Due Diligence Form' }
];

testUrls.forEach(test => {
  const req = http.get(test.url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`\n📋 ${test.name}:`);
      
      // Check for critical elements
      const checks = [
        { name: 'Part 1 section (#p1)', pattern: 'id="p1"' },
        { name: 'Part 2 section (#p2)', pattern: 'id="p2"' },
        { name: 'Entity type radios', pattern: 'entity_type_selection' },
        { name: 'Part 1 radio (ep1)', pattern: 'id="ep1"' },
        { name: 'Part 2 radio (ep2)', pattern: 'id="ep2"' },
        { name: 'Handler function', pattern: 'function handleEntityTypeChange' },
        { name: 'Part 1 fields', pattern: 'name="company_name"' },
        { name: 'Part 2 fields', pattern: 'name="entity_name_part2"' },
        { name: 'Show/hide logic', pattern: 'showPart1' },
        { name: 'DOMContentLoaded init', pattern: 'DOMContentLoaded' }
      ];
      
      checks.forEach(check => {
        const found = data.includes(check.pattern);
        console.log(`   ${found ? '✓' : '✗'} ${check.name}`);
      });
      
      // Count key sections
      const p1Count = (data.match(/id="p1"/g) || []).length;
      const p2Count = (data.match(/id="p2"/g) || []).length;
      const handlerCount = (data.match(/function handleEntityTypeChange/g) || []).length;
      
      console.log(`\n   Counts:`);
      console.log(`   • Part 1 sections: ${p1Count}`);
      console.log(`   • Part 2 sections: ${p2Count}`);
      console.log(`   • Handler functions: ${handlerCount}`);
      
      if (p1Count === 1 && p2Count === 1 && handlerCount === 1) {
        console.log('\n   ✅ HTML Structure CORRECT!');
      } else {
        console.log('\n   ⚠️  Structure may have issues');
      }
    });
  }).on('error', (err) => {
    console.error(`   ✗ Error: ${err.message}`);
  });
});

console.log('\n' + '='.repeat(70));
console.log('\n📌 BROWSER TESTING INSTRUCTIONS:\n');
console.log('1. Open http://localhost:3000 in your browser');
console.log('2. Login with test credentials');
console.log('3. Navigate to Due Diligence Form');
console.log('4. TEST STEPS:');
console.log('   a) Click "Part 1: Enterprise/Partnership/Company/Individual" radio');
console.log('      → Expected: Part 1 section shows, Part 2 section hidden');
console.log('   b) Click "Part 2: Other Entity (Government/Club/Societies/...)" radio');
console.log('      → Expected: Part 1 section hidden, Part 2 section shows');
console.log('   c) Fill in visible fields only (not hidden section)');
console.log('   d) Click "Save Draft"');
console.log('   e) Reload page');
console.log('      → Expected: Same selection restored, correct section visible');
console.log('   f) Click "Submit"');
console.log('      → Expected: Only selected part data submitted\n');
console.log('5. Check browser console (F12) for any JavaScript errors\n');
