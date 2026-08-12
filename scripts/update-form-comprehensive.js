#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const viewsPath = path.join(__dirname, '..', 'frontend', 'views.js');
console.log('🔄 Comprehensive form update...\n');

try {
  let content = fs.readFileSync(viewsPath, 'utf8');
  let updated = false;

  // Step 1: Add entity type selection before section 1A
  const oldStart = `        <form method="POST" action="\${formAction}" class="form-light">
           <div class="section-divider"><span class="section-counter">1A</span>Company Details`;

  const newStart = `        <form method="POST" action="\${formAction}" class="form-light">
           \${!submitted ? \`
           <div class="section-divider"><span class="section-counter">0</span>Entity Type Selection</div>
           <div class="form-grid-full" style="background: rgba(76, 175, 80, 0.05); padding: 20px; border-radius: 8px; border: 2px solid rgba(76, 175, 80, 0.3); margin-bottom: 20px;"><div class="form-group"><label class="required">Which type of entity are you?</label><div class="radio-checkbox-group"><div class="radio-checkbox-item"><input type="radio" id="ep1" name="entity_type_selection" value="part1" \${radio('entity_type_selection', 'part1')} required onchange="document.getElementById('p1').style.display='block';document.getElementById('p2').style.display='none';"><label><strong>Part 1: Enterprise/Partnership/Company/Individual</strong></label></div><div class="radio-checkbox-item"><input type="radio" id="ep2" name="entity_type_selection" value="part2" \${radio('entity_type_selection', 'part2')} required onchange="document.getElementById('p1').style.display='none';document.getElementById('p2').style.display='block';"><label><strong>Part 2: Other Entity (Government/Club/Societies/School/University/Embassy)</strong></label></div></div></div></div>
           \` : ''}
           <div id="p1" style="display: \${showPart1 ? 'block' : 'none'};">
           <div class="section-divider"><span class="section-counter">1A</span>Company Details`;

  if (content.includes(oldStart)) {
    content = content.replace(oldStart, newStart);
    console.log('✓ Step 1: Added entity type selection');
    updated = true;
  }

  // Step 2: Remove "Type of Business Relationship" section
  const businessRelSection = `

           <div class="form-grid-full"><div class="form-group"><label class="required">Type of Business Relationship: Please tick (✓) whichever applicable</label><div class="radio-checkbox-group">
             \${['Corporate Customer', 'Government', 'Merchant', 'Business Partner', 'Service Provider', 'Vendor', 'TNG Cashless Parking Provider'].map(opt => \`
               <div class="radio-checkbox-item"><input type="checkbox" name="business_relationship_type" value="\${opt}" \${chk('business_relationship_type', opt)} \${readOnly}><label>\${opt}</label></div>
             \`).join('')}
           </div></div></div>
           <div class="form-grid-full"><div class="form-group"><label class="required">Purpose of business relationship</label><textarea name="purpose_of_relationship" rows="2" \${readOnly} required>\${val('purpose_of_relationship')}</textarea></div></div>`;

  if (content.includes(businessRelSection)) {
    content = content.replace(businessRelSection, '');
    console.log('✓ Step 2: Removed "Type of Business Relationship" section');
    updated = true;
  }

  // Step 3: Close part1 and add part2 before Declaration section
  const declSection = `           <div class="section-divider"><span class="section-counter">2</span>Declaration & Signature</div>`;
  const beforeDecl = `           </div>

           <div id="p2" style="display: \${showPart2 ? 'block' : 'none'};">
           <div class="section-divider"><span class="section-counter">1A</span>Entity Information (Government/Club/Societies/Schools/Universities/Embassy)</div>
           <div class="form-grid-full"><div class="form-group"><label class="required">Entity Name</label><input type="text" name="entity_name_part2" value="\${val('entity_name_part2')}" \${readOnly} required></div></div>
           <div class="form-grid-2"><div class="form-group"><label>Entity Registration No</label><input type="text" name="entity_reg_no_part2" value="\${val('entity_reg_no_part2')}" \${readOnly}></div><div class="form-group"><label>Entity Type</label><input type="text" name="entity_type_part2" value="\${val('entity_type_part2')}" \${readOnly}></div></div>
           <div class="form-grid-2"><div class="form-group"><label class="required">Registered Address</label><textarea name="entity_address_part2" rows="2" \${readOnly} required>\${val('entity_address_part2')}</textarea></div><div class="form-group"><label class="required">Contact Number</label><input type="tel" name="entity_contact_part2" value="\${val('entity_contact_part2')}" \${readOnly} required></div></div>
           <div class="form-grid-full"><div class="form-group"><label class="required">Email Address</label><input type="email" name="entity_email_part2" value="\${val('entity_email_part2')}" \${readOnly} required></div></div>
           </div>

           \${declSection}`;

  if (content.includes(declSection)) {
    content = content.replace(declSection, beforeDecl.replace(/\${declSection}/, declSection));
    console.log('✓ Step 3: Added Part 2 section and closed Part 1');
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(viewsPath, content, 'utf8');
    console.log('\n✅ Frontend form updated successfully!\n');
    console.log('📋 Changes applied:');
    console.log('   ✓ Added entity type selection (Part 1 / Part 2)');
    console.log('   ✓ Removed "Type of Business Relationship" section');
    console.log('   ✓ Made Part 1 and Part 2 conditional');
    console.log('   ✓ Added Part 2 fields for other entity types\n');
  } else {
    console.log('⚠️  No changes made - markers not found');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
