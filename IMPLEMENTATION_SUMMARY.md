# PDF Template Filling Implementation Summary

## Current Status

Your PDFs (`TNGSB Due Diligence Form.pdf` and `Customer Onboarding Form 01.pdf`) are **flat/static PDFs** (not fillable forms with AcroForm fields). This means we need to overlay text at specific coordinates.

## What Has Been Done

### ✅ Created Core Files

1. **`backend/pdf-filler.js`** - PDF filling engine that overlays text/images onto static PDFs
2. **`backend/template-defs.js`** - Template registry with coordinate mappings for each field
3. **`backend/server.js`** - Added imports for the PDF filler and template definitions
4. **`scripts/inspect-pdf-fields.js`** - Tool to inspect PDF form fields (confirmed your PDFs are flat)

### ⚠️ Coordinate Mappings Are Estimates

The coordinates in `backend/template-defs.js` are **placeholder estimates**. To fill your actual PDFs correctly, you need to:

1. Open each PDF and identify where each field should be placed
2. Measure the X/Y coordinates (PDF coordinate system: 0,0 = bottom-left)
3. Update `backend/template-defs.js` with the actual coordinates

**Tools to find coordinates:**
- Adobe Acrobat Pro (shows coordinates on cursor)
- Online PDF coordinate finder
- Trial-and-error: adjust coordinates, generate PDF, check placement, repeat

## What Still Needs to Be Done

### 1. Replace DOCX Generators with PDF Fillers

In `backend/server.js`, replace these two functions:

**OLD (lines 46-165):**
```javascript
async function generateOnboardingDocx(client, onboarding) {
  // ... generates DOCX from scratch using docx library
}
```

**NEW:**
```javascript
async function generateOnboardingPdf(client, onboarding) {
  const template = getTemplate('onboarding');
  const data = expandMultiValueFields(onboarding, template.fields);
  const signatures = {};
  
  // If signature exists in data
  if (data._signature) {
    signatures['declaration_signature'] = data._signature;
  }
  
  const pdfBuffer = await fillPdfTemplate(
    template.file,
    template.fields,
    data,
    { signatures }
  );
  
  return pdfBuffer;
}
```

**OLD (lines 167-296):**
```javascript
async function generateDueDiligenceDocx(client, data) {
  // ... generates DOCX from scratch
}
```

**NEW:**
```javascript
async function generateDueDiligencePdf(client, data) {
  const template = getTemplate('due_diligence');
  const formData = expandMultiValueFields(data, template.fields);
  const signatures = {};
  
  // Extract signature from form data
  if (formData.declaration_signature && formData.declaration_signature.startsWith('data:image')) {
    signatures['declaration_signature'] = formData.declaration_signature;
  }
  
  const pdfBuffer = await fillPdfTemplate(
    template.file,
    template.fields,
    formData,
    { signatures }
  );
  
  return pdfBuffer;
}
```

### 2. Update Download Routes

Find these routes and update them to use PDF instead of DOCX:

**Route: `/admin/due-diligence/:id/download`** (line ~1072)
```javascript
// Change:
const buffer = await generateDueDiligenceDocx(client, data);
res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
res.setHeader('Content-Disposition', `attachment; filename="${safeName}_Due_Diligence.docx"`);

// To:
const buffer = await generateDueDiligencePdf(client, data);
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', `attachment; filename="${safeName}_Due_Diligence.pdf"`);
```

**Route: `/admin/client/:id/due-diligence/download`** (line ~1096)
```javascript
// Same change as above
```

**Route: `/admin/client/:id/download-onboarding-form`** (line ~890)
```javascript
// Change:
buffer = await generateOnboardingDocx(client, onboarding);
// Save as .docx, download as .docx

// To:
buffer = await generateOnboardingPdf(client, onboarding);
// Save as .pdf, download as .pdf
```

**Route: `POST /admin/add-client`** (line ~737, where onboarding doc is generated)
```javascript
// Change:
const buffer = await generateOnboardingDocx({ company_name: sanitizedCompanyName }, onboarding);
const filename = `${clientId}_onboarding.docx`;

// To:
const buffer = await generateOnboardingPdf({ company_name: sanitizedCompanyName }, onboarding);
const filename = `${clientId}_onboarding.pdf`;
```

### 3. Add Signature Pad to Client Form

In `frontend/views.js`, around line 948 (Declaration section), replace the signature text input with a canvas-based signature pad:

```javascript
// OLD:
<input type="text" name="declaration_signature" value="${val('declaration_signature')}" required>

// NEW:
<div>
  <canvas id="signaturePad" width="400" height="150" style="border: 1px solid #ccc; cursor: crosshair;"></canvas>
  <br>
  <button type="button" onclick="clearSignature()">Clear Signature</button>
  <input type="hidden" id="signatureData" name="declaration_signature" value="${val('declaration_signature')}">
</div>
<script>
const canvas = document.getElementById('signaturePad');
const ctx = canvas.getContext('2d');
const signatureInput = document.getElementById('signatureData');
let isDrawing = false;

canvas.addEventListener('mousedown', () => isDrawing = true);
canvas.addEventListener('mouseup', () => {
  isDrawing = false;
  ctx.beginPath();
  signatureInput.value = canvas.toDataURL('image/png');
});
canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#000';
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  signatureInput.value = '';
}
</script>
```

### 4. Update Button Labels

In `frontend/views.js`:
- Line 576: Change "Download DOCX" → "Download Filled PDF"
- Line 1043: Change "Download DOCX" → "Download Filled PDF"

## Testing Strategy

### Phase 1: Test with Sample Data
1. Create a test script that generates a filled PDF with known data
2. Open the PDF and check if text appears in the right places
3. Adjust coordinates in `template-defs.js` as needed

### Phase 2: Test End-to-End
1. Login as admin
2. Create a test client
3. Login as client
4. Fill the due diligence form (including signature)
5. Submit the form
6. Login as admin
7. Download the filled PDF
8. Verify all data is correctly placed

### Phase 3: Coordinate Fine-Tuning
- For each field that's misaligned:
  - Note the current position
  - Calculate the offset needed
  - Update `template-defs.js`
  - Regenerate and test

## Quick Test Script

See `scripts/test-pdf-fill.js` for a standalone test that fills your PDF with sample data.

## Known Limitations

- **Coordinate system:** PDF coordinates are (0,0) = bottom-left, which is different from most graphics systems
- **Font sizing:** Text may overflow if too long; adjust `maxWidth` in field definitions
- **Multi-page forms:** Currently assumes single-page; for multi-page, specify `page: 1`, `page: 2`, etc.
- **Checkboxes:** Rendered as ☑ character; position carefully to align with printed boxes

## Next Steps

1. Run `scripts/test-pdf-fill.js` to generate a sample filled PDF
2. Open it and note which fields are misaligned
3. Adjust coordinates in `backend/template-defs.js`
4. Repeat until accurate
5. Update server.js routes (search for "generateDueDiligenceDocx" and "generateOnboardingDocx")
6. Add signature pad to frontend
7. Test end-to-end with real user flow