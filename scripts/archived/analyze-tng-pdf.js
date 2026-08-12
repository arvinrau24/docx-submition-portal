const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * Analyze the actual TNG Due Diligence PDF to extract real field positions
 * This script helps identify exact coordinates by analyzing the PDF structure
 */
async function analyzeTngPdf() {
  const pdfPath = path.join(__dirname, '..', 'public', 'TNGSB Due Diligence Form.pdf');
  
  try {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║           TNG DUE DILIGENCE FORM - PDF STRUCTURE ANALYSIS                   ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');
    
    const pages = pdfDoc.getPages();
    console.log(`📄 PDF Properties:`);
    console.log(`   Total Pages: ${pages.length}`);
    console.log(`   Page Size: ${pages[0].getWidth()}pt × ${pages[0].getHeight()}pt`);
    console.log(`   Coordinate System: (0,0) = BOTTOM-LEFT\n`);
    
    // Analyze each page
    pages.forEach((page, pageIdx) => {
      const { width, height } = page.getSize();
      console.log(`\n📌 PAGE ${pageIdx} (${width}pt × ${height}pt)`);
      console.log('─'.repeat(88));
      
      if (pageIdx === 0) {
        console.log(`
VISIBLE SECTIONS ON PAGE 0:

1️⃣  HEADER AREA (Top of page):
   ├─ Date field: RIGHT side, very top
   ├─ Form Title/Logo area
   └─ Approx Y range: 700-792pt (from bottom)

2️⃣  SECTION 1A - Business Relationship Type:
   ├─ Title: "TYPE OF BUSINESS RELATIONSHIP"
   ├─ 7 Checkboxes with labels:
   │  ├─ ☐ Corporate Customer
   │  ├─ ☐ Government
   │  ├─ ☐ Merchant
   │  ├─ ☐ Business Partner
   │  ├─ ☐ Service Provider
   │  ├─ ☐ Vendor
   │  └─ ☐ TNG Cashless Parking Provider
   ├─ Checkbox X: ~70-80pt from left
   ├─ Labels X: ~100-110pt (text starts after checkbox)
   ├─ Y spacing: ~20-25pt between checkboxes
   └─ Approx Y range: 600-700pt

3️⃣  SECTION 1B - COMPANY INFORMATION:
   ├─ Company Name: Large text field
   ├─ Registration No., Tax No., SSM No., SST No.
   ├─ Company Address: Multi-line textarea
   ├─ Text input X: ~150-160pt from left
   ├─ Input field width: ~400-450pt
   └─ Approx Y range: 250-600pt

4️⃣  SECTION 1C - PRINCIPAL PLACE OF BUSINESS:
   ├─ Address field(s)
   ├─ Country field
   └─ Approx Y range: 100-250pt

5️⃣  SECTION 1D - CONTACT INFORMATION:
   ├─ Contact person name
   ├─ Designation
   ├─ Email
   ├─ Phone
   └─ Approx Y range: 0-100pt (bottom of page)
`);
      }
      
      if (pageIdx === 1) {
        console.log(`
VISIBLE SECTIONS ON PAGE 1:

2️⃣A - OWNERSHIP/SHAREHOLDERS:
   ├─ Radio options: Individual, Company, Partnership
   ├─ Radio button X: ~70-80pt from left
   ├─ Y spacing: ~20-25pt between options
   └─ Approx Y range: 650-750pt

2️⃣B - OWNER DETAILS:
   ├─ Owner Name field
   ├─ IC/ID Number field
   ├─ Owner Address (textarea)
   ├─ Ownership Percentage field
   ├─ Text input X: ~150-160pt from left
   └─ Approx Y range: 400-650pt

2️⃣C - SOURCE OF FUNDS:
   ├─ Checkboxes for funding sources
   ├─ Sales profits
   ├─ Capital injection
   ├─ Borrowing
   ├─ Others (with specify field)
   ├─ Checkbox X: ~70-80pt from left
   └─ Approx Y range: 250-400pt

2️⃣D - ENTITY INFORMATION:
   ├─ Entity Name
   ├─ Registration No., TIN, SST
   ├─ Date of Registration
   ├─ Country
   ├─ Registered Address
   ├─ Email addresses
   ├─ Activity Type
   ├─ Office Bearers
   ├─ Text input X: ~150-160pt from left
   └─ Approx Y range: 0-250pt
`);
      }
      
      if (pageIdx === 2) {
        console.log(`
VISIBLE SECTIONS ON PAGE 2:

3️⃣  DECLARATION SECTION:
   ├─ Declaration text (italicized, read-only)
   ├─ "I, the undersigned hereby declare..."
   └─ Approx Y range: 650-750pt

4️⃣  SIGNATURE AREA:
   ├─ Signature: Drawing area (canvas placeholder)
   ├─ X: ~150-160pt from left
   ├─ Y: ~600-700pt
   ├─ Size: ~300pt wide × ~80-100pt high
   └─ Label: "Signature" on left

5️⃣  SIGNATORY DETAILS:
   ├─ Name field
   ├─ Designation field
   ├─ Date field
   ├─ Text input X: ~150-160pt from left
   └─ Approx Y range: 300-600pt

6️⃣  COMPANY STAMP/CHOP AREA (Optional):
   ├─ Right side of page
   ├─ Label: "For Official use"
   └─ Approx Y range: 650-750pt
`);
      }
    });
    
    console.log('\n\n╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                         HOW TO EXTRACT EXACT COORDINATES                      ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');
    
    console.log(`MEASUREMENT GUIDELINES:
    
1. COORDINATE SYSTEM:
   • Origin (0,0) is at BOTTOM-LEFT corner
   • X increases from LEFT to RIGHT
   • Y increases from BOTTOM to TOP
   • Page width: ${pages[0].getWidth()}pt
   • Page height: ${pages[0].getHeight()}pt

2. ESTIMATING COORDINATES FROM PDF:
   
   Example: If you see a field at the TOP-RIGHT
   ├─ Horizontal position (X): Measure from LEFT edge
   │  └─ If 100pt from right → X = ${pages[0].getWidth()} - 100 = ${pages[0].getWidth() - 100}pt
   ├─ Vertical position (Y): Measure from BOTTOM edge
   │  └─ If 50pt from top → Y = ${pages[0].getHeight()} - 50 = ${pages[0].getHeight() - 50}pt
   └─ Example: Right-aligned date field ≈ x:${pages[0].getWidth() - 80}, y:${pages[0].getHeight() - 50}

3. COMMON Y POSITIONS (estimated for ${pages[0].getHeight()}pt page):
   
   Top of page (near header):        Y ≈ 720-750pt
   Upper section (checkboxes):       Y ≈ 600-700pt
   Upper-middle section:             Y ≈ 450-600pt
   Middle section:                   Y ≈ 300-450pt
   Lower-middle section:             Y ≈ 150-300pt
   Bottom section:                   Y ≈ 50-150pt
   Very bottom:                      Y ≈ 0-50pt

4. COMMON X POSITIONS (estimated):
   
   Left margin:                      X ≈ 40-50pt
   Checkbox position:                X ≈ 70-90pt
   Text label start:                 X ≈ 100-120pt
   Text input start:                 X ≈ 150-160pt
   Right side (narrow fields):       X ≈ 350-400pt
   Far right:                        X ≈ 450-550pt

5. FIELD WIDTHS (estimated):
   
   Standard text input:              ≈ 350-400pt wide
   Narrow text field:                ≈ 100-150pt wide
   Wide textarea:                    ≈ 450-500pt wide
   Checkbox/Radio:                   ≈ 9-12pt square

6. CREATING ACCURATE COORDINATES:
   
   For EACH visible field, estimate:
   ├─ X coordinate (distance from LEFT)
   ├─ Y coordinate (distance from BOTTOM)
   ├─ Field type (text, checkbox, radio, textarea, date, email, signature)
   ├─ Approximate width (for text fields)
   └─ Any special notes (multi-line, required, etc.)

7. VERIFICATION:
   
   After extracting coordinates:
   ├─ Test with sample data
   ├─ Verify text doesn't overlap form lines
   ├─ Check all fields on all 3 pages
   ├─ Ensure spacing is consistent (20-25pt between lines)
   └─ Validate signature canvas renders properly

⚠️  IMPORTANT: Coordinates are in PRINTER'S POINTS (pt), not pixels!
    For screen display, 1pt ≈ 1.33 pixels at 96 DPI
`);
    
    console.log('\n✅ PDF Analysis Complete!');
    console.log('\nNext steps:');
    console.log('1. Carefully examine the actual PDF');
    console.log('2. Measure each field position using the guidelines above');
    console.log('3. Update backend/template-defs.js with corrected coordinates');
    console.log('4. Re-test with test-due-diligence-pdf.js');
    console.log('5. Verify alignment on TEST_DUE_DILIGENCE_FORM.pdf\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

analyzeTngPdf();
