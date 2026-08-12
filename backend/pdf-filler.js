const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');
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
      // Draw a white rectangle over any printed placeholder text (e.g. the
      // "SN00000" watermark in the header) before overlaying the real value.
      if (mapping.whiteout) {
        const { x: wx, y: wy, width, height } = mapping.whiteout;
        page.drawRectangle({
          x: wx,
          y: wy,
          width,
          height,
          color: rgb(1, 1, 1),
          borderColor: rgb(1, 1, 1),
          borderWidth: 0,
        });
      }

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
      } else if (type === 'circle') {
        // Draw a circle around selected radio option (for Office Bearers A/B)
        const expectedValue = fieldOptions.checkedWhen;
        const values = Array.isArray(value) ? value.map(String) : [String(value)];
        const checked = expectedValue !== undefined
          ? values.includes(String(expectedValue))
          : value === true || value === 'true' || value === '1' || value === 'on';
        if (checked) {
          const radius = fieldOptions.radius || 10; // Default radius 10pt
          page.drawCircle({
            x,
            y,
            size: radius,
            borderColor: color,
            borderWidth: 1.5,
          });
        }
       } else if (type === 'text' || type === 'textarea') {
         // Draw text
         const text = String(value);
         
         // Calculate approximate characters per line based on font size and maxWidth
         // For Helvetica, ~2 characters per 10 points of width at 9pt font
         const charsPerLine = Math.floor((maxWidth / size) * 1.8);
         
         // Handle multiline text - split by newlines or when text exceeds maxWidth
         let linesToDraw = [];
         
         if (type === 'textarea' || text.includes('\n')) {
           // Already contains newlines, split by them
           linesToDraw = text.split('\n');
         } else if (charsPerLine > 0 && text.length > charsPerLine) {
           // Text is too long for one line, wrap it
           let remaining = text;
           while (remaining.length > 0) {
             linesToDraw.push(remaining.substring(0, charsPerLine));
             remaining = remaining.substring(charsPerLine);
           }
         } else {
           // Short text, single line
           linesToDraw = [text];
         }
         
         // Draw all lines
         let currentY = y;
         linesToDraw.forEach((line, index) => {
           if (line.trim()) {
             page.drawText(line, { x, y: currentY, size, font: pdfFont, color, maxWidth });
           }
           currentY -= size + 2; // Move to next line
         });
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

/**
 * Fill a DOCX template by creating a formatted document with data
 * @param {Object} fieldMappings - Field definitions with coordinates { fieldName: { x, y, size, page, ... } }
 * @param {Object} data - Data to fill (field name -> value mapping)
 * @param {Object} options - Options for filling
 * @returns {Promise<Buffer>} - Filled DOCX as buffer
 */
async function fillDocxTemplate(fieldMappings, data, options = {}) {
  const {
    signatures = {},
    defaultSize = 10,
  } = options;

  // Build table rows from field mappings
  const rows = [];
  
  // Add header row
  rows.push(
    new TableRow({
      cells: [
        new TableCell({
          children: [new Paragraph({ text: 'Field Name', bold: true })],
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Value', bold: true })],
          width: { size: 70, type: WidthType.PERCENTAGE },
        }),
      ],
    })
  );

  // Add data rows
  for (const [fieldName, mapping] of Object.entries(fieldMappings)) {
    const value = data[mapping.source || fieldName];
    
    if (value === undefined || value === null || value === '') continue;

    const displayValue = String(value);
    const fieldLabel = fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    rows.push(
      new TableRow({
        cells: [
          new TableCell({
            children: [new Paragraph({ text: fieldLabel })],
            width: { size: 30, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ text: displayValue })],
            width: { size: 70, type: WidthType.PERCENTAGE },
          }),
        ],
      })
    );
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Form Submission',
            bold: true,
            size: 28,
          }),
          new Paragraph({ text: '' }),
          new Table({
            rows: rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

module.exports = {
  fillPdfTemplate,
  fillDocxTemplate,
  expandMultiValueFields
};
