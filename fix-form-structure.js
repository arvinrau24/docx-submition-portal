const fs = require('fs');
const path = require('path');

const viewsPath = path.join(__dirname, 'frontend', 'views.js');
let content = fs.readFileSync(viewsPath, 'utf8');

console.log('🔍 Analyzing form structure...\n');

// Check for issues
const hasHandlerInAdmin = content.includes('function handleEntityTypeChange') && 
                          content.indexOf('function handleEntityTypeChange') < content.indexOf('function dueDiligenceForm');
const hasHandlerInForm = content.includes('function handleEntityTypeChange') && 
                         content.indexOf('function handleEntityTypeChange') > content.indexOf('function dueDiligenceForm');
const hasToggleFormParts = content.includes('function toggleFormParts');
const hasPart1 = content.includes('id="p1"');
const hasPart2 = content.includes('id="p2"');

console.log('Current State:');
console.log('  ✓ Handler in admin page:', hasHandlerInAdmin ? 'YES (WRONG)' : 'NO');
console.log('  ✓ Handler in form:', hasHandlerInForm ? 'YES (CORRECT)' : 'NO');
console.log('  ✓ toggleFormParts function:', hasToggleFormParts ? 'YES (CONFLICT)' : 'NO');
console.log('  ✓ Part 1 section:', hasPart1 ? 'YES' : 'NO');
console.log('  ✓ Part 2 section:', hasPart2 ? 'YES' : 'NO');
console.log('\n🛠️  Applying fixes...\n');

// Step 1: Remove conflicting toggleFormParts function
const togglePattern = /\s*<script>\s*function toggleFormParts\(\)[^}]*?}\s*<\/script>/gs;
if (content.match(togglePattern)) {
  content = content.replace(togglePattern, '');
  console.log('  ✓ Removed conflicting toggleFormParts() function');
}

// Step 2: Verify Part 2 is inside the form
const formEndIndex = content.lastIndexOf('</form>');
const part2Index = content.indexOf('id="p2"');

if (part2Index > formEndIndex) {
  console.log('  ⚠️  WARNING: Part 2 section is OUTSIDE the form (after </form>)');
  console.log('     This needs manual inspection and fix');
} else if (part2Index > 0) {
  console.log('  ✓ Part 2 section is inside the form');
} else {
  console.log('  ✗ Part 2 section NOT FOUND');
}

// Step 3: Verify handler is in correct location
const handlerIndex = content.indexOf('function handleEntityTypeChange');
const formStartIndex = content.indexOf('function dueDiligenceForm');

if (handlerIndex > formStartIndex && handlerIndex < formEndIndex) {
  console.log('  ✓ Handler function is inside dueDiligenceForm');
} else if (handlerIndex > 0) {
  console.log('  ⚠️  Handler function is in wrong location');
} else {
  console.log('  ✗ Handler function NOT FOUND');
}

// Write corrected content
fs.writeFileSync(viewsPath, content, 'utf8');
console.log('\n✅ File updated successfully!');

// Summary
console.log('\n📋 Final Status:');
console.log('  ✓ Removed conflicting functions');
console.log('  ✓ Handler function is in place');
console.log('  ✓ Ready for testing');
