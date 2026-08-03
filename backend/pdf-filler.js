const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * PDF Template Filler (for FLAT/NON-FILLABLE PDFs)
 * Overlays text and images onto static PDF templates at specified coordinates
 */

/**
 * Fill a flat PDF template by overlaying text at coordinates
 * @param {string} templatePath - Path to the template PDF
 * @param {Object} fieldMappings - Field definitions with coordinates { fieldName: { x, y, size, page, ... } }
 * @param {Object} data - Data to fill (field name -> value mapping)
 * @param {Object} options - Options for filling
 * @returns {Promise<Buffer>} - Filled PDF as buffer
 */
async function fillPdfTemplate(templatePath, fieldMappings, data, options = {}) {
  const {
    signatures = {}, // Signature images { fieldName: base64DataUrl }
    font = 'Helvetica',
    defaultSize = 10,
    defaultColor = rgb(0, 0, 0),
  } = options;

  // Load the PDF
  const pdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  // Embed font
  const pdfFont = await pdfDoc.embedFont(StandardFonts[font] || StandardFonts.Helvetica);

  // Process each field mapping
  for (const [fieldName, mapping] of Object.entries(fieldMappings)) {
    // A mapping may read a value from a differently named source field. This
    // is useful when one website radio/checkbox value maps to several PDF boxes.
    const value = data[mapping.source || fieldName];
    
    if (value === undefined || value === null || value === '') continue;
    
    const {
      x,
      y,
      page: pageIndex = 0,
      size = defaultSize,
      color = defaultColor,
      maxWidth = 500,
      type = 'text',
      options: fieldOptions = {}
    } = mapping;

    const page = pdfDoc.getPage(pageIndex);

    try {
      if (type === 'checkbox') {
        // Draw an X only when the source value matches this specific box.
        // Plain checkboxes retain the conventional truthy-value behavior.
        const expectedValue = fieldOptions.checkedWhen;
        const values = Array.isArray(value) ? value.map(String) : [String(value)];
        const checked = expectedValue !== undefined
          ? values.includes(String(expectedValue))
          : value === true || value === 'true' || value === '1' || value === 'on';
        if (checked) {
          // Helvetica's WinAnsi encoding does not reliably support ☑, while X
          // is universally supported and clear inside the printed checkbox.
          page.drawText('X', { x, y, size, font: pdfFont, color });
        }
      } else if (type === 'text' || type === 'textarea') {
        // Draw text
        const text = String(value);
        
        // Handle multiline text
        if (type === 'textarea' || text.includes('\n')) {
          const lines = text.split('\n');
          let currentY = y;
          lines.forEach(line => {
            if (line.trim()) {
              page.drawText(line, { x, y: currentY, size, font: pdfFont, color, maxWidth });
            }
            currentY -= size + 2; // Move to next line
          });
        } else {
          page.drawText(text, { x, y, size, font: pdfFont, color, maxWidth });
        }
      } else if (type === 'signature' && signatures[fieldName]) {
        // Draw signature image
        const imageDataUrl = signatures[fieldName];
        
        // Extract base64 data
        let base64Data = imageDataUrl;
        if (imageDataUrl.includes('base64,')) {
          base64Data = imageDataUrl.split('base64,')[1];
        }
        
        const imageBytes = Buffer.from(base64Data, 'base64');
        
        // Embed image
        let image;
        if (imageDataUrl.includes('image/png') || imageDataUrl.includes('data:image/png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (imageDataUrl.includes('image/jpeg') || imageDataUrl.includes('image/jpg')) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          image = await pdfDoc.embedPng(imageBytes);
        }

        const imgWidth = fieldOptions.width || 100;
        const imgHeight = fieldOptions.height || 40;
        
        page.drawImage(image, { x, y, width: imgWidth, height: imgHeight });
      }
    } catch (err) {
      console.warn(`Warning: Could not fill field "${fieldName}":`, err.message);
    }
  }

  // Save and return
  const filledPdfBytes = await pdfDoc.save();
  return Buffer.from(filledPdfBytes);
}

/**
 * Helper: Convert multi-value checkbox/radio array to multiple field entries
 */
function expandMultiValueFields(data, mappings) {
  const expanded = { ...data };
  
  // Handle arrays (multiple checkboxes)
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      // Convert array to comma-separated string for display
      expanded[key] = value.join(', ');
      
      // Also create individual checkbox entries if mappings exist
      value.forEach(item => {
        const checkboxKey = `${key}_${item.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        if (mappings[checkboxKey]) {
          expanded[checkboxKey] = true;
        }
      });
    }
  }
  
  return expanded;
}

module.exports = {
  fillPdfTemplate,
  expandMultiValueFields
};
