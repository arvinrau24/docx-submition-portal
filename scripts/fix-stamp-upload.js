const fs = require('fs');
const path = require('path');

const viewsPath = path.join(__dirname, '..', 'frontend', 'views.js');
let content = fs.readFileSync(viewsPath, 'utf8');

console.log('🔧 Fixing company stamp upload...\n');

// Fix 1: Upload handler
const old1 = "previewContainer.appendChild(img);";
const new1 = "previewContainer.innerHTML = '<p>Uploaded:</p><div><img src=\"' + data.stampData + '\" style=\"max-width:200px;max-height:150px;border-radius:4px;display:block;margin-bottom:8px;\"><button type=\"button\" onclick=\"deleteStamp()\" class=\"btn btn-secondary btn-sm\">Delete</button></div>';}const uploadSection=document.getElementById('stamp-upload-section');if(uploadSection)uploadSection.style.display='none';";

content = content.replace(old1, new1);

// Fix 2: Add delete function before signature code
const insertPos = content.indexOf('// Canvas Signature Pad Implementation');
const deleteFunc = `
              function deleteStamp() {
                if (confirm('Delete stamp?')) {
                  document.getElementById('stampData').value = '';
                  document.getElementById('stamp-preview-container').innerHTML = '';
                  const up = document.getElementById('stamp-upload-section');
                  if (up) { up.style.display = 'flex'; document.getElementById('stamp-file-input').value = ''; }
                }
              }

              `;

content = content.substring(0, insertPos) + deleteFunc + content.substring(insertPos);

fs.writeFileSync(viewsPath, content, 'utf8');
console.log('✅ Fixed! Restart server.\n');
