#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const viewsPath = path.join(__dirname, '..', 'frontend', 'views.js');
console.log('🔄 Updating form with conditional entity type selection...\n');

try {
  let content = fs.readFileSync(viewsPath, 'utf8');
  
  // Step 1: Find and replace the form opening
  const formPattern = /<form method="POST" action="\$\{formAction\}" class="form-light">\s*<div class="section-divider"><span class="section-counter">1A/;
  
  if (formPattern.test(content)) {
    // Add entity type selection
    content = content.replace(
      /<form method="POST" action="\$\{formAction\}" class="form-light">\s*<div class="section-divider"><span class="section-counter">1A/,
      `<form method="POST" action="\${formAction}" class="form-light">
           \${!submitted ? \`
           <div class="section-divider"><span class="section-counter">0</span>Entity Type Selection</div>
           <div class="form-grid-full" style="background: rgba(76, 175, 80, 0.05); padding: 20px; border-radius: 8px; border: 2px solid rgba(76, 175, 80, 0.3); margin-bottom: 20px;"><div class="form-group"><label class="required">Which type of entity are you?</label><div class="radio-checkbox-group"><div class="radio-checkbox-item"><input type="radio" id="ep1" name="entity_type_selection" value="part1" \${radio('entity_type_selection', 'part1')} required onchange="document.getElementById('p1').style.display='block';document.getElementById('p2').style.display='none';"><label><strong>Part 1: Enterprise/Partnership/Company/Individual</strong></label></div><div class="radio-checkbox-item"><input type="radio" id="ep2" name="entity_type_selection" value="part2" \${radio('entity_type_selection', 'part2')} required onchange="document.getElementById('p1').style.display='none';document.getElementById('p2').style.display='block';"><label><strong>Part 2: Other Entity (Government/Club/Societies/School/University/Embassy)</strong></label></div></div></div></div>
           \` : ''}
           <div id="p1" style="display: \${showPart1 ? 'block' : 'none'};">
           <div class="section-divider"><span class="section-counter">1A`
    );
    console.log('✓ Added entity type selection\n');
  }

  // Step 2: Remove business relationship section
  const businessRelRegex = /<div class="form-grid-full"><div class="form-group"><label class="required">Type of Business Relationship:[\s\S]*?<div class="form-grid-full"><div class="form-group"><label class="required">Purpose of business relationship[\s\S]*?<\/textarea><\/div><\/div>/;
  
  if (businessRelRegex.test(content)) {
    content = content.replace(businessRelRegex, '');
    console.log('✓ Removed "Type of Business Relationship" section\n');
  }

  // Step 3: Close part1 and add part2 before Declaration
  const declPattern = /\n\s*<div class="section-divider"><span class="section-counter">2<\/span>Declaration & Signature<\/div>/;
  
  if (declPattern.test(content)) {
    content = content.replace(
      declPattern,
      `\n           </div>

           <div id="p2" style="display: \${showPart2 ? 'block' : 'none'};">
           <div class="section-divider"><span class="section-counter">1A</span>Entity Information (Government/Club/Societies/Schools/Universities/Embassy)</div>
           <div class="form-grid-full"><div class="form-group"><label class="required">Entity Name</label><input type="text" name="entity_name_part2" value="\${val('entity_name_part2')}" \${readOnly} required></div></div>
           <div class="form-grid-2"><div class="form-group"><label>Entity Registration No</label><input type="text" name="entity_reg_no_part2" value="\${val('entity_reg_no_part2')}" \${readOnly}></div><div class="form-group"><label>Entity Type</label><input type="text" name="entity_type_part2" value="\${val('entity_type_part2')}" \${readOnly}></div></div>
           <div class="form-grid-2"><div class="form-group"><label class="required">Registered Address</label><textarea name="entity_address_part2" rows="2" \${readOnly} required>\${val('entity_address_part2')}</textarea></div><div class="form-group"><label class="required">Contact Number</label><input type="tel" name="entity_contact_part2" value="\${val('entity_contact_part2')}" \${readOnly} required></div></div>
           <div class="form-grid-full"><div class="form-group"><label class="required">Email Address</label><input type="email" name="entity_email_part2" value="\${val('entity_email_part2')}" \${readOnly} required></div></div>
           </div>

           <div class="section-divider"><span class="section-counter">2</span>Declaration & Signature</div>`
    );
    console.log('✓ Added Part 2 section and closed Part 1\n');
  }

  fs.writeFileSync(viewsPath, content, 'utf8');
  console.log('✅ Form successfully updated!\n');
  console.log('📋 Changes applied:');
  console.log('   ✓ Entity type selection (Part 1 / Part 2)');
  console.log('   ✓ Removed "Type of Business Relationship"');
  console.log('   ✓ Conditional Part 1 and Part 2 sections');
  console.log('   ✓ Part 2 fields for other entity types\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
