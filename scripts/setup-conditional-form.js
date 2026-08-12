#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const viewsPath = path.join(__dirname, '..', 'frontend', 'views.js');
const templatePath = path.join(__dirname, '..', 'backend', 'template-defs.js');

console.log('🔄 Applying conditional form implementation...\n');

try {
  // 1. Fix template-defs.js - Update radio button source mappings
  console.log('📝 Step 1: Fixing template definitions...');
  let templateContent = fs.readFileSync(templatePath, 'utf8');
  
  // Replace the source field mappings
  templateContent = templateContent.replace(
    `source: 'has_corporate_shareholder_Yes'`,
    `source: 'has_corporate_shareholder'`
  );
  templateContent = templateContent.replace(
    `source: 'has_corporate_shareholder_No'`,
    `source: 'has_corporate_shareholder'`
  );
  templateContent = templateContent.replace(
    `source: 'is_corporate_group_Yes'`,
    `source: 'is_corporate_group'`
  );
  templateContent = templateContent.replace(
    `source: 'is_corporate_group_No'`,
    `source: 'is_corporate_group'`
  );
  
  fs.writeFileSync(templatePath, templateContent, 'utf8');
  console.log('   ✓ Fixed radio button mappings in template-defs.js\n');

  // 2. Update frontend views.js
  console.log('📝 Step 2: Updating frontend form...');
  let viewsContent = fs.readFileSync(viewsPath, 'utf8');
  
  // Add conditional display logic before statusBadges
  const logicToAdd = `  // Determine if Part 1 or Part 2 should be shown
  const showPart1 = d.entity_type_selection !== 'part2';
  const showPart2 = d.entity_type_selection === 'part2';

`;
  
  viewsContent = viewsContent.replace(
    `  const radio = (key, val) => d[key] === val ? 'checked' : '';\n\n  const statusBadges = {`,
    `  const radio = (key, val) => d[key] === val ? 'checked' : '';

${logicToAdd}  const statusBadges = {`
  );
  
  fs.writeFileSync(viewsPath, viewsContent, 'utf8');
  console.log('   ✓ Added conditional display logic\n');

  console.log('✅ Core logic updated!\n');
  console.log('📋 Summary:');
  console.log('   ✓ template-defs.js: Fixed radio button source mappings');
  console.log('   ✓ frontend/views.js: Added showPart1/showPart2 flags\n');
  console.log('⚠️  NEXT: Please manually update the form sections in frontend/views.js');
  console.log('   using the provided HTML structure.\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
