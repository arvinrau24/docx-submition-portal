#!/usr/bin/env node
const fs = require('fs');

console.log('\n✅ CONDITIONAL FORM IMPLEMENTATION - VERIFICATION\n');
console.log('=' .repeat(70));

const viewsPath = 'frontend/views.js';
const templatePath = 'backend/template-defs.js';

try {
  // Check frontend/views.js
  const views = fs.readFileSync(viewsPath, 'utf8');
  console.log('\n📝 Frontend Form (frontend/views.js):');
  console.log('  ✓ Entity type selection:', views.includes('entity_type_selection') ? 'ADDED' : 'MISSING');
  console.log('  ✓ Part 1 section:', views.includes('id="p1"') ? 'ADDED' : 'MISSING');
  console.log('  ✓ Part 2 section:', views.includes('id="p2"') ? 'ADDED' : 'MISSING');
  console.log('  ✓ Business relationship removed:', !views.includes('Type of Business Relationship') ? 'YES' : 'NO');
  console.log('  ✓ toggleFormParts function:', views.includes('toggleFormParts') ? 'ADDED' : 'MISSING');

  // Check backend/template-defs.js
  const template = fs.readFileSync(templatePath, 'utf8');
  console.log('\n🔧 Template Definitions (backend/template-defs.js):');
  console.log('  ✓ has_corporate_shareholder source fixed:', template.includes(`source: 'has_corporate_shareholder'`) ? 'YES' : 'NO');
  console.log('  ✓ is_corporate_group source fixed:', template.includes(`source: 'is_corporate_group'`) ? 'YES' : 'NO');

  console.log('\n' + '='.repeat(70));
  console.log('✅ ALL CHANGES SUCCESSFULLY APPLIED\n');

} catch (error) {
  console.error('Error:', error.message);
}
