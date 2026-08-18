const fs = require('fs');
const filePath = 'c:\\Users\\User\\Desktop\\web_agreement_docx\\frontend\\views.js';
let content = fs.readFileSync(filePath, 'utf8');

// The faulty section starts after the Change Password buttons.
const startSearch = '          <div style="display: flex; gap: 12px; margin-top: 30px;">';
const endSearch = '  return htmlPage(\'Change Password\', content, user);\n}';

const startIndex = content.indexOf(startSearch);
const endIndex = content.lastIndexOf(endSearch);

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + 
          startSearch + '\n            <button type="submit" class="btn btn-primary" style="flex: 1;">Change Password</button>\n            <a href="/client/due-diligence" class="btn btn-secondary" style="flex: 1; text-align: center; text-decoration: none;">Cancel</a>\n          </div>\n        </form>\n      </div>\n    </div>\n  `;\n\n' + 
          content.substring(endIndex);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Fixed file properly.');
} else {
    console.log('Could not find search markers.');
}
