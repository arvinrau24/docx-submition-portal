const fs = require('fs');
const viewsPath = './frontend/views.js';
let content = fs.readFileSync(viewsPath, 'utf8');

console.log('🔧 Fixing Due Diligence Form\n');

// Remove misplaced Part 2 from password change function
const lines = content.split('\n');
let newLines = [];
let inBadSection = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect start of misplaced Part 2
  if (line.includes('</div>') && lines[i+1]?.includes('<div id="p2"')) {
    inBadSection = true;
    newLines.push(line); // Keep the closing div
    continue;
  }
  
  // Skip until we find the closing password form
  if (inBadSection) {
    if (line.includes('</form>') && line.includes('Change Password')) {
      inBadSection = false;
      newLines.push('        </form>');
      continue;
    }
    continue;
  }
  
  newLines.push(line);
}

content = newLines.join('\n');

// Find dueDiligenceForm close marker and insert Part 2 there
const searchStr = '            </script>\n\n            <input type="hidden"';
const insertStr = `            </script>

            <div id="p2" style="display: \${showPart2 ? 'block' : 'none'};">
            <div class="section-divider"><span class="section-counter">1A</span>Entity Information (Government/Club/Societies/Schools/Universities/Embassy)</div>
            <div class="form-grid-full"><div class="form-group"><label class="required">Entity Name</label><input type="text" name="entity_name_part2" value="\${val('entity_name_part2')}" \${readOnly} required></div></div>
            <div class="form-grid-2"><div class="form-group"><label>Entity Registration No</label><input type="text" name="entity_reg_no_part2" value="\${val('entity_reg_no_part2')}" \${readOnly}></div><div class="form-group"><label>Entity Type</label><input type="text" name="entity_type_part2" value="\${val('entity_type_part2')}" \${readOnly}></div></div>
            <div class="form-grid-2"><div class="form-group"><label class="required">Registered Address</label><textarea name="entity_address_part2" rows="2" \${readOnly} required>\${val('entity_address_part2')}</textarea></div><div class="form-group"><label class="required">Contact Number</label><input type="tel" name="entity_contact_part2" value="\${val('entity_contact_part2')}" \${readOnly} required></div></div>
            <div class="form-grid-full"><div class="form-group"><label class="required">Email Address</label><input type="email" name="entity_email_part2" value="\${val('entity_email_part2')}" \${readOnly} required></div></div>
            </div>

            <input type="hidden"`;

if (content.includes(searchStr)) {
  content = content.replace(searchStr, insertStr);
  console.log('✓ Inserted Part 2 into due diligence form');
}

fs.writeFileSync(viewsPath, content, 'utf8');
console.log('✓ File updated');
