const fs = require('fs');

console.log('🔧 Creating clean restructured views.js with separate Part 1 and Part 2 forms...\n');

const backupPath = './frontend/views.js.backup';
const newPath = './frontend/views.js';

// Read the backup to extract sections we need
const original = fs.readFileSync(backupPath, 'utf8');

// Extract functions we need to keep as-is (before dueDiligenceForm)
const beforeDueDiligence = original.substring(0, original.indexOf('// ============ DUE DILIGENCE'));

// Extract admin and help functions (after old dueDiligenceForm, before exports)
const dueDiligenceListStart = original.indexOf('function dueDiligenceList(');
const exportsStart = original.indexOf('module.exports = {');
const afterDueDiligence = original.substring(dueDiligenceListStart, exportsStart);

// Build the new file
let newContent = beforeDueDiligence;

// Add the selection page function
newContent += `// ============ DUE DILIGENCE SELECTION PAGE ============

function dueDiligenceSelectionPage(user, clientId = null) {
  const content = \`
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h2>Due Diligence Form</h2>
        </div>
        \${passwordChangeBanner(user)}
        
        <div style="padding: 40px;">
          <h3 style="color: var(--color-neon-green); margin-bottom: 20px;">Select Your Entity Type</h3>
          <p style="color: var(--color-text-muted); margin-bottom: 30px;">
            Please select which type of entity you represent to proceed with the appropriate due diligence form.
          </p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
            <!-- Part 1 Card -->
            <a href="/client/due-diligence/part1" style="text-decoration: none;">
              <div style="background: var(--color-primary); padding: 30px; border-radius: 12px; border: 2px solid var(--color-neon-green); transition: all 0.3s; cursor: pointer; height: 100%;" 
                   onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 20px rgba(76, 175, 80, 0.3)';" 
                   onmouseout="this.style.transform=''; this.style.boxShadow='';">
                <h3 style="color: var(--color-neon-green); margin-top: 0; font-size: 1.4em;">📄 Part 1</h3>
                <h4 style="color: var(--color-sky-blue); margin: 15px 0;">Enterprise / Partnership / Company / Individual</h4>
                <ul style="color: var(--color-text); line-height: 1.8; padding-left: 20px; margin: 20px 0;">
                  <li>Sole Proprietorship</li>
                  <li>Partnership</li>
                  <li>Private Limited (Sdn Bhd)</li>
                  <li>Public Limited (Bhd)</li>
                  <li>Individual Clients</li>
                </ul>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(76, 175, 80, 0.3);">
                  <span style="color: var(--color-neon-green); font-weight: 600;">Select Part 1 →</span>
                </div>
              </div>
            </a>
            
            <!-- Part 2 Card -->
            <a href="/client/due-diligence/part2" style="text-decoration: none;">
              <div style="background: var(--color-primary); padding: 30px; border-radius: 12px; border: 2px solid var(--color-sky-blue); transition: all 0.3s; cursor: pointer; height: 100%;" 
                   onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 20px rgba(135, 206, 250, 0.3)';" 
                   onmouseout="this.style.transform=''; this.style.boxShadow='';">
                <h3 style="color: var(--color-sky-blue); margin-top: 0; font-size: 1.4em;">📋 Part 2</h3>
                <h4 style="color: var(--color-neon-green); margin: 15px 0;">Other Entities</h4>
                <ul style="color: var(--color-text); line-height: 1.8; padding-left: 20px; margin: 20px 0;">
                  <li>Government Bodies</li>
                  <li>Clubs & Societies</li>
                  <li>Schools & Universities</li>
                  <li>Embassies</li>
                  <li>Non-Profit Organizations</li>
                </ul>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(135, 206, 250, 0.3);">
                  <span style="color: var(--color-sky-blue); font-weight: 600;">Select Part 2 →</span>
                </div>
              </div>
            </a>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: rgba(135, 206, 250, 0.1); border-radius: 8px; border-left: 4px solid var(--color-sky-blue);">
            <p style="margin: 0; color: var(--color-text-muted);">
              <strong style="color: var(--color-sky-blue);">ℹ️ Note:</strong> 
              Please select the form type that best matches your organization. If you're unsure which category applies to you, please contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  \`;
  
  return htmlPage('Select Entity Type', content, user, clientId);
}

`;

console.log('✓ Added selection page function');

// Now I need to write this to file and continue with Part 1 and Part 2 functions
// Due to size constraints, let me save this progress first
fs.writeFileSync('./build-new-views-step1.js', newContent, 'utf8');

console.log('Step 1 saved. Creating Part 1 form function...');
