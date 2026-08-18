# Company Stamp Upload Fix - Applied Successfully ✅

**Date**: 2026-08-13  
**Issue**: `Cannot read properties of null (reading 'appendChild')` error when uploading company stamp

---

## Problem Identified

When users tried to upload a company stamp and save the draft:
1. **JavaScript Error**: Line 1211 tried to call `appendChild` on a null element
2. **No Upload Restriction**: Users could upload multiple times without deleting previous uploads
3. **Missing Delete Functionality**: No way to remove and re-upload stamps

---

## Fixes Applied

### 1. **Fixed appendChild Error**
- Added null check before accessing `stamp-preview-container`
- Element is now always present (moved outside conditional rendering)

### 2. **Single Upload Restriction**
- Upload section (`stamp-upload-section`) hides after successful upload
- Only one stamp can be active at a time

### 3. **Delete & Re-upload Functionality**
- New `deleteStamp()` function added
- Shows "Delete" button with uploaded stamp preview
- Clicking delete:
  - Clears the hidden `stampData` input
  - Removes preview
  - Shows upload section again
  - Resets file input

### 4. **Proper State Management**
- On page load, if stamp exists, upload section is hidden
- Preview shows with delete button
- When form is submitted (read-only), delete button is hidden

---

## Files Modified

✅ **frontend/views.js**
- Lines 1136-1142: Updated HTML structure (added `id="stamp-upload-section"`, moved preview outside conditional)
- Lines 1200-1215: Updated upload success handler with null checks and hide/show logic
- Added `deleteStamp()` function before signature pad code

---

## Testing Instructions

1. **Restart the server** (the Node.js application must reload the updated views.js)
   ```bash
   # Stop current server (Ctrl+C)
   cd c:\Users\User\Desktop\web_agreement_docx
   node backend/server.js
   ```

2. **Test the Upload Flow**:
   - Navigate to Due Diligence form
   - Select "Part 1: Enterprise/Partnership/Company/Individual"
   - Fill required fields
   - Upload a company stamp (PNG/JPG/PDF)
   - **Verify**: Upload section disappears, preview shows with "Delete" button
   - **Click Save Draft** - should work without errors now!

3. **Test Delete & Re-upload**:
   - Click "Delete" button on uploaded stamp
   - **Verify**: Confirmation dialog appears
   - Confirm deletion
   - **Verify**: Upload section reappears, can upload new stamp

4. **Test Page Reload**:
   - Refresh the page after uploading
   - **Verify**: Stamp preview loads automatically with delete button
   - Upload section stays hidden

---

## Related Fixes in This Session

This fix is part of a comprehensive update that also addressed:

1. ✅ **Form Validation Issue** - Fixed "invalid form control is not focusable" error
2. ✅ **Date of Application Mapping** - Added separate mapping for Part 1A
3. ✅ **Source of Funds Checkboxes** - Fixed `expandMultiValueFields` to preserve arrays
4. ✅ **Company Stamp Upload** - Fixed appendChild error + added delete functionality

---

## Next Steps

1. **Restart your server**
2. **Clear browser cache** (Ctrl+F5 or Cmd+Shift+R)
3. **Test the complete flow** from upload to PDF generation
4. **Verify in generated PDF** that stamp appears on page 3

---

**Status**: ✅ FIXED - Ready for testing
