#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const viewsPath = path.join(__dirname, '..', 'frontend', 'views.js');
console.log('🔄 Completing conditional form implementation...\n');

try {
  let content = fs.readFileSync(viewsPath, 'utf8');
  
  // Step 1: Add Part 2 section before Declaration
  const stampDataMarker = `<input type="hidden" id="stampData" name="company_stamp" value="\${val('company_stamp')}">
           </div></div>

            <div class="section-divider"><span class="section-counter">D</span>Declaration</div>`;

  const part2Section = `<input type="hidden" id="stampData" name="company_stamp" value="\${val('company_stamp')}">
           </div></div>

           </div>

           <div id="p2" style="display: \${showPart2 ? 'block' : 'none'};">
           <div class="section-divider"><span class="section-counter">1A</span>Entity Information (Government/Club/Societies/Schools/Universities/Embassy)</div>
           <div class="form-grid-full"><div class="form-group"><label class="required">Entity Name</label><input type="text" name="entity_name_part2" value="\${val('entity_name_part2')}" \${readOnly} required></div></div>
           <div class="form-grid-2"><div class="form-group"><label>Entity Registration No</label><input type="text" name="entity_reg_no_part2" value="\${val('entity_reg_no_part2')}" \${readOnly}></div><div class="form-group"><label>Entity Type</label><input type="text" name="entity_type_part2" value="\${val('entity_type_part2')}" \${readOnly}></div></div>
           <div class="form-grid-2"><div class="form-group"><label class="required">Registered Address</label><textarea name="entity_address_part2" rows="2" \${readOnly} required>\${val('entity_address_part2')}</textarea></div><div class="form-group"><label class="required">Contact Number</label><input type="tel" name="entity_contact_part2" value="\${val('entity_contact_part2')}" \${readOnly} required></div></div>
           <div class="form-grid-full"><div class="form-group"><label class="required">Email Address</label><input type="email" name="entity_email_part2" value="\${val('entity_email_part2')}" \${readOnly} required></div></div>
           </div>

            <div class="section-divider"><span class="section-counter">D</span>Declaration</div>`;

  if (content.includes(stampDataMarker)) {
    content = content.replace(stampDataMarker, part2Section);
    console.log('✓ Step 1: Added Part 2 section');
  }

  // Step 2: Add toggleFormParts function after closing form tag
  const formEndMarker = `        </form>
         </div>`;

  const toggleFunction = `        </form>
         <script>
           function toggleFormParts() {
             const part1 = document.getElementById('p1');
             const part2 = document.getElementById('p2');
             const part1Radio = document.getElementById('ep1');
             if (part1Radio && part1Radio.checked) {
               if (part1) part1.style.display = 'block';
               if (part2) part2.style.display = 'none';
             } else {
               if (part1) part1.style.display = 'none';
               if (part2) part2.style.display = 'block';
             }
           }
         </script>
         </div>`;

  if (content.includes(formEndMarker)) {
    content = content.replace(formEndMarker, toggleFunction);
    console.log('✓ Step 2: Added toggleFormParts function');
  }

  fs.writeFileSync(viewsPath, content, 'utf8');
  console.log('\n✅ Conditional form implementation COMPLETE!\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
