const fs = require('fs');

const viewsPath = './frontend/views.js';
let content = fs.readFileSync(viewsPath, 'utf8');

console.log('🔧 Removing misplaced Part 2 from password change function...\n');

// Remove the entire misplaced Part 2 section from password change function
const part2RemovalPattern = /\s*<div id="p2"[\s\S]*?<\/script>\s*<\/form>/;
const matches = content.match(part2RemovalPattern);

if (matches) {
  console.log('Found misplaced Part 2 section, removing...');
  content = content.replace(part2RemovalPattern, '\n            </form>');
  console.log('✓ Removed misplaced Part 2');
} else {
  console.log('⚠️  Could not find pattern - trying alternative approach...');
  // More aggressive pattern
  const lines = content.split('\n');
  const newLines = [];
  let skip = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<div id="p2"') && lines[i].includes('showPart2')) {
      console.log(`Found Part 2 at line ${i + 1}, removing...`);
      skip = true;
      continue;
    }
    
    if (skip && lines[i].includes('</script>')) {
      skip = false;
      // Skip this script block too
      if (lines[i].includes('else {')) {
        continue;
      }
    }
    
    if (!skip) {
      newLines.push(lines[i]);
    }
  }
  
  content = newLines.join('\n');
  console.log('✓ Removed using line-by-line approach');
}

// Now insert Part 2 in the correct location (dueDiligenceForm)
console.log('\nInserting Part 2 into due diligence form...\n');

const insertionPoint = '            </script>\n\n            <input type="hidden" name="_submitted"';
const part2HTML = `            </script>

            <div id="p2" style="display: \${showPart2 ? 'block' : 'none'};">
            <div class="section-divider"><span class="section-counter">1A</span>Entity Information (Government/Club/Societies/Schools/Universities/Embassy)</div>
            <div class="form-grid-full"><div class="form-group"><label class="required">Entity Name</label><input type="text" name="entity_name_part2" value="\${val('entity_name_part2')}" \${readOnly} required></div></div>
            <div class="form-grid-2"><div class="form-group"><label>Entity Registration No</label><input type="text" name="entity_reg_no_part2" value="\${val('entity_reg_no_part2')}" \${readOnly}></div><div class="form-group"><label>Entity Type</label><input type="text" name="entity_type_part2" value="\${val('entity_type_part2')}" \${readOnly}></div></div>
            <div class="form-grid-2"><div class="form-group"><label class="required">Registered Address</label><textarea name="entity_address_part2" rows="2" \${readOnly} required>\${val('entity_address_part2')}</textarea></div><div class="form-group"><label class="required">Contact Number</label><input type="tel" name="entity_contact_part2" value="\${val('entity_contact_part2')}" \${readOnly} required></div></div>
            <div class="form-grid-full"><div class="form-group"><label class="required">Email Address</label><input type="email" name="entity_email_part2" value="\${val('entity_email_part2')}" \${readOnly} required></div></div>
            </div>

            <input type="hidden" name="_submitted"`;

if (content.includes(insertionPoint)) {
  content = content.replace(insertionPoint, part2HTML);
  console.log('✓ Part 2 inserted into due diligence form');
} else {
  console.log('⚠️  Insertion point not found');
}

// Save the file
fs.writeFileSync(viewsPath, content, 'utf8');

// Verify
console.log('\n📋 Verification:');
const p1Count = (content.match(/id="p1"/g) || []).length;
const p2Count = (content.match(/id="p2"/g) || []).length;
const handlerCount = (content.match(/function handleEntityTypeChange/g) || []).length;

console.log(`   Part 1 sections: ${p1Count}`);
console.log(`   Part 2 sections: ${p2Count}`);
console.log(`   Handler functions: ${handlerCount}`);

if (p1Count === 1 && p2Count === 1 && handlerCount === 1) {
  console.log('\n✅ SUCCESS! Form structure is now correct.');
} else {
  console.log('\n⚠️  Structure may still have issues.');
}
