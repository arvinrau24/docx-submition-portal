const { PDFDocument, StandardFonts } = require('pdf-lib');

(async () => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  console.log('Helvetica Spacebar Width Analysis:');
  console.log('====================================\n');
  
  [8, 9, 10].forEach(size => {
    const spaceWidth = font.widthOfTextAtSize(' ', size);
    const points = spaceWidth;
    const pixels = spaceWidth * 1.333; // 96 DPI conversion
    console.log(`Size ${size}pt: ${points.toFixed(2)} points = ${pixels.toFixed(2)} pixels`);
  });
  
  console.log('\n====================================');
  console.log('Current bank_account_name field:');
  console.log('  Size: 9pt');
  console.log('  Current X: 377 (moved 2px from original 375)');
  console.log('  Spacebar width at 9pt: ~2.50 points');
  console.log('\nTo move 1 full spacebar width:');
  console.log('  Add 2.5 points → X: 379 or 380');
})();
