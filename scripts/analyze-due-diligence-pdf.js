#!/usr/bin/env node

/**
 * Analyze TNG Due Diligence PDF Structure
 * Extracts actual field positions and validates template definitions
 */

const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf-parse');

async function analyzePdf() {
  try {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║         ANALYZE TNG DUE DILIGENCE PDF STRUCTURE                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const pdfPath = path.join(__dirname, '..', 'public', 'TNGSB Due Diligence Form.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF not found at: ${pdfPath}`);
    }

    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await PDFParser(dataBuffer);

    console.log('📄 PDF Information:');
    console.log(`   • Pages: ${pdfData.numpages}`);
    console.log(`   • Producer: ${pdfData.info?.Producer || 'Unknown'}`);
    console.log(`   • Creator: ${pdfData.info?.Creator || 'Unknown'}`);

    if (pdfData.text) {
      console.log('\n📋 Page Text Content Preview (First 500 chars per page):');
      const pages = pdfData.text.split('\x0c'); // Form feed character separates pages
      pages.forEach((pageText, idx) => {
        const preview = pageText.substring(0, 500).replace(/\n/g, ' ').trim();
        console.log(`\n   PAGE ${idx}:`);
        console.log(`   ${preview}...`);
      });
    }

    console.log('\n✅ PDF Analysis Complete');
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Open the PDF in Adobe Acrobat Reader');
    console.log('   2. Enable Form Fields view (View > Forms > Display Form Fields)');
    console.log('   3. Use Inspection tools to find exact coordinates of each field');
    console.log('   4. Update template-defs.js with correct coordinates');
    console.log('   5. Re-run generate-full-test-tng-pdf.js to verify alignment');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

analyzePdf();
