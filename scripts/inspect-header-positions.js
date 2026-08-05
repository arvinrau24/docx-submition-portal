/**
 * Inspect exact text positions in the onboarding PDF header.
 * Decompresses Flate streams and parses BT/ET text operators
 * to find exact coordinates for SN and Date fields.
 */
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function extractTextPositions(pdfPath) {
  const bytes = fs.readFileSync(pdfPath);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  const pageCount = doc.getPageCount();

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    const page = doc.getPage(pageIndex);
    const pageHeight = page.getHeight();
    console.log(`\n=== Page ${pageIndex} (height=${pageHeight}) ===`);

    // Get raw content stream refs via the page node
    const pageNode = page.node;
    const contentRefs = pageNode.Contents();
    const refs = Array.isArray(contentRefs) ? contentRefs : [contentRefs];

    for (const ref of refs) {
      if (!ref) continue;
      const raw = ref.contents || ref.getContents?.() || null;
      if (!raw) continue;
      
      let content = '';
      try {
        // Streams are FlateDecode compressed (start with 0x78 0x9C zlib header)
        content = zlib.inflateSync(Buffer.from(raw)).toString('utf8');
      } catch (e) {
        console.log('  [Could not decompress stream:', e.message, ']');
        continue;
      }

      parseContentStream(content, pageHeight, pageIndex);
    }
  }
}

function parseContentStream(content, pageHeight, pageIndex) {
  // Track text state
  let inText = false;
  let x = 0, y = 0, fontSize = 0;
  
  // Tokenize respecting parentheses for strings
  const tokens = [];
  let current = '';
  let inParen = false;
  let depth = 0;
  
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inParen) {
      current += ch;
      if (ch === '\\') { current += content[++i] || ''; continue; }
      if (ch === '(') depth++;
      if (ch === ')') { depth--; if (depth === 0) { inParen = false; } }
      if (ch === ')' && depth === 0) {
        // The closing paren already included
      }
      continue;
    }
    if (ch === '(') { inParen = true; depth = 1; current += ch; continue; }
    if (/\s/.test(ch)) {
      if (current) { tokens.push(current); current = ''; }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    if (token === 'BT') { inText = true; x = 0; y = 0; fontSize = 0; continue; }
    if (token === 'ET') { inText = false; continue; }
    if (!inText) continue;

    if (token === 'Tm' && i >= 6) {
      const tx = parseFloat(tokens[i-2]);
      const ty = parseFloat(tokens[i-1]);
      x = tx;
      y = ty;
      continue;
    }
    if (token === 'Td' && i >= 2) {
      const tx = parseFloat(tokens[i-2]);
      const ty = parseFloat(tokens[i-1]);
      x += tx;
      y += ty;
      continue;
    }
    if (token === 'TD' && i >= 2) {
      const tx = parseFloat(tokens[i-2]);
      const ty = parseFloat(tokens[i-1]);
      x += tx;
      y += ty - fontSize;
      continue;
    }
    if (token === 'Tf' && i >= 2) {
      fontSize = parseFloat(tokens[i-1]);
      continue;
    }
    if (token === 'Tj' && i >= 1) {
      const m = tokens[i-1].match(/^\((.*)\)$/s);
      if (m) {
        const text = m[1].replace(/\\([()\\])/g, '$1');
        // yTop = pageHeight - y (baseline approx)
        const yTop = pageHeight - y;
        if (yTop < 130) {
          console.log(`  [yTop=${yTop.toFixed(1)}][xLeft=${x.toFixed(1)}][size=${fontSize}] "${text}"`);
        }
      }
      continue;
    }
    if (token === 'TJ' && i >= 1) {
      const m = tokens[i-1].match(/^\[(.*)\]$/s);
      if (m) {
        const parts = m[1].match(/\([^)]*\)/g) || [];
        const text = parts.map(p => p.replace(/^\((.*)\)$/, '$1').replace(/\\([()\\])/g, '$1')).join('');
        const yTop = pageHeight - y;
        if (yTop < 130) {
          console.log(`  [yTop=${yTop.toFixed(1)}][xLeft=${x.toFixed(1)}][size=${fontSize}] "${text}"`);
        }
      }
      continue;
    }
  }
}

const projectRoot = path.join(__dirname, '..');
extractTextPositions(path.join(projectRoot, 'public', 'Customer Onboarding Form 01.pdf'))
  .then(() => console.log('\nDone.'))
  .catch(err => { console.error('Error:', err); process.exit(1); });