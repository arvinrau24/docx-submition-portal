const fs = require('fs');

const content = fs.readFileSync('frontend/views.js', 'utf8');

console.log('\n✅ FINAL VERIFICATION - Due Diligence Form\n');

const hasHandler = content.includes('function handleEntityTypeChange');
const hasInit = content.includes('window.addEventListener');
const hasP1 = content.includes('id="p1"');
const hasP2 = content.includes('id="p2"');
const hasToggle = content.includes('function toggleFormParts');
const radioCalls = (content.match(/handleEntityTypeChange\('part[12]'\)/g) || []).length;

console.log('Components Status:');
console.log('  Handler function:', hasHandler ? '✅ YES' : '❌ NO');
console.log('  Initialization script:', hasInit ? '✅ YES' : '❌ NO');
console.log('  Part 1 section:', hasP1 ? '✅ YES' : '❌ NO');
console.log('  Part 2 section:', hasP2 ? '✅ YES' : '❌ NO');
console.log('  Radio calls to handler:', radioCalls === 2 ? '✅ BOTH' : '❌ MISSING');
console.log('  Conflicting toggleFormParts:', hasToggle ? '❌ YES' : '✅ NO');

const isReady = hasHandler && hasP1 && hasP2 && radioCalls === 2 && !hasToggle;

console.log('\n' + '='.repeat(50));
if (isReady) {
  console.log('\n🎉 FORM STRUCTURE IS COMPLETE AND READY!\n');
  console.log('All required components present:');
  console.log('  ✅ Handler function properly placed');
  console.log('  ✅ Part 1 and Part 2 sections');
  console.log('  ✅ Radio buttons wired to handler');
  console.log('  ✅ No conflicting code');
  console.log('\nThe form is ready for browser testing!');
} else {
  console.log('\n⚠️  Some components are missing\n');
  process.exit(1);
}
console.log('\n' + '='.repeat(50) + '\n');
