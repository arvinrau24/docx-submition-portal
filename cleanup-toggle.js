const fs = require('fs');
const path = require('path');

const viewsPath = path.join(__dirname, 'frontend', 'views.js');
let content = fs.readFileSync(viewsPath, 'utf8');

console.log('🧹 Cleaning up remaining toggleFormParts() function...\n');

// More aggressive pattern to match the function
const patterns = [
  // Pattern 1: Exact whitespace match
  /\s*<script>\s*\n\s*function toggleFormParts\(\)[^}]*?\}\s*\n\s*<\/script>/gs,
  // Pattern 2: Flexible whitespace
  /<script>\s*function toggleFormParts\(\)[^}]*?\}\s*<\/script>/gs,
  // Pattern 3: Very flexible
  /\s*function toggleFormParts\(\)\s*\{[^}]*?\}\s*/gs,
];

let removed = false;
for (const pattern of patterns) {
  if (pattern.test(content)) {
    const before = content.length;
    content = content.replace(pattern, '');
    const after = content.length;
    if (after < before) {
      console.log(`✓ Removed toggleFormParts() function (freed ${before - after} bytes)`);
      removed = true;
      break;
    }
  }
}

if (!removed) {
  console.log('⚠️  Could not match toggleFormParts() with standard patterns');
  console.log('   Attempting manual line-based removal...');
  
  const lines = content.split('\n');
  let inToggleFunc = false;
  let functionStartLine = -1;
  const newLines = [];
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('function toggleFormParts()')) {
      inToggleFunc = true;
      functionStartLine = i;
      braceCount = 0;
      // Count opening braces on this line
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      continue; // Skip this line
    }
    
    if (inToggleFunc) {
      // Count braces to find end of function
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      
      // Also skip </script> tag
      if (line.includes('</script>')) {
        inToggleFunc = false;
        console.log(`✓ Removed toggleFormParts() function (lines ${functionStartLine + 1} to ${i + 1})`);
        continue;
      }
      
      if (braceCount <= 0 && i > functionStartLine + 1) {
        inToggleFunc = false;
        // Don't add this line (it's the closing brace)
        continue;
      }
      
      // Skip all lines inside the function
      if (inToggleFunc) continue;
    }
    
    newLines.push(line);
  }
  
  content = newLines.join('\n');
  removed = true;
}

fs.writeFileSync(viewsPath, content, 'utf8');

// Verify
const hasToggle = content.includes('function toggleFormParts');
console.log('\n✅ Verification:');
console.log(`   toggleFormParts present: ${hasToggle ? '❌ YES (still there)' : '✅ NO (successfully removed)'}`);

// Check handler is still there
const hasHandler = content.includes('function handleEntityTypeChange');
console.log(`   handleEntityTypeChange present: ${hasHandler ? '✅ YES' : '❌ NO'}`);

console.log('\n✅ Cleanup complete!');
