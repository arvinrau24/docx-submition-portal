const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * Extract coordinates from TNG Due Diligence Form PDF
 * This helps identify where to place text for coordinate-based filling
 */
async function extractTngCoordinates() {
  const pdfPath = path.join(__dirname, '..', 'public', 'TNGSB Due Diligence Form.pdf');
  
  try {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    console.log('\n📄 TNG Due Diligence Form - PDF Analysis');
    console.log(`Total Pages: ${pdfDoc.getPages().length}`);
    console.log('\nPage Dimensions:');
    
    pdfDoc.getPages().forEach((page, index) => {
      const { width, height } = page.getSize();
      console.log(`  Page ${index}: ${width}pt x ${height}pt`);
    });
    
    console.log('\n✅ PDF loaded successfully!');
    console.log('\n📝 Form Structure Notes:');
    console.log('  - Use coordinates to identify field positions');
    console.log('  - Coordinate system: (0,0) = bottom-left');
    console.log('  - X increases rightward, Y increases upward');
    console.log('  - Typical A4 page: ~595pt wide x ~842pt high');
    console.log('\n💡 For each field, estimate:');
    console.log('  - X position (0 to ~595)');
    console.log('  - Y position (0 to ~842)');
    console.log('  - Field size (font size, typically 8-12pt)');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

extractTngCoordinates();
