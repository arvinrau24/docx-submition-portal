const fs = require('fs');

const viewsPath = './frontend/views.js';
let content = fs.readFileSync(viewsPath, 'utf8');

console.log('🔧 Final Form Structure Fix\n');

// Strategy: Find line 1315 (</script>) and insert Part 2 after it

const lines = content.split('\n');
const insertAtLine = 1315; // After </script>

// Create Part 2 HTML
const part2Lines = [
  '            <div id="p2" style="display: ${showPart2 ? \'block\' : \'none\'};">',
  '            <div class="section-divider"><span class="section-counter">1A</span>Entity Information (Government/Club/Societies/Schools/Universities/Embassy)</div>',
  '            <div class="form-grid-full"><div class="form-group"><label class="required">Entity Name</label><input type="text" name="entity_name_part2" value="${val(\'entity_name_part2\')}" ${readOnly} required></div></div>',
  '            <div class="form-grid-2"><div class="form-group"><label>Entity Registration No</label><input type="text" name="entity_reg_no_part2" value="${val(\'entity_reg_no_part2\')}" ${readOnly}></div><div class="form-group"><label>Entity Type</label><input type="text" name="entity_type_part2" value="${val(\'entity_type_part2\')}" ${readOnly}></div></div>',
  '            <div class="form-grid-2"><div class="form-group"><label class="required">Registered Address</label><textarea name="entity_address_part2" rows="2" ${readOnly} required>${val(\'entity_address_part2\')}</textarea></div><div class="form-group"><label class="required">Contact Number</label><input type="tel" name="entity_contact_part2" value="${val(\'entity_contact_part2\')}" ${readOnly} required></div></div>',
  '            <div class="form-grid-full"><div class="form-group"><label class="required">Email Address</label><input type="email" name="entity_email_part2" value="${val(\'entity_email_part2\')}" ${readOnly} required></div></div>',
  '            </div>',
  ''
];

// Insert Part 2 after the closing script tag
const newLines = [...lines.slice(0, insertAtLine), '', ...part2Lines, ...lines.slice(insertAtLine)];

content = newLines.join('\n');

fs.writeFileSync(viewsPath, content, 'utf8');

console.log('✅ Part 2 inserted into due diligence form');

// Verify
const p1Count = (content.match(/id="p1"/g) || []).length;
const p2Count = (content.match(/id="p2"/g) || []).length;

console.log(`\nVerification:`);
console.log(`  Part 1: ${p1Count} ✓`);
console.log(`  Part 2: ${p2Count} ✓`);

if (p1Count === 1 && p2Count === 1) {
  console.log('\n✅ Form structure is CORRECT!');
} else {
  console.log('\n⚠️ Still has issues');
}
