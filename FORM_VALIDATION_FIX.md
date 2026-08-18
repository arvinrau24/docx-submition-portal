# Form Validation Fix - "Invalid form control is not focusable" Error

## Problem Description

When users selected **Part 1: Enterprise/Partnership/Company/Individual** and tried to save or submit the form, they encountered a browser console error:

```
An invalid form control with name='entity_office_bearers_type' is not focusable.
```

### Root Cause

The issue occurred because:

1. The `entity_office_bearers_type` radio buttons are in **Part 2** (Other Entity section)
2. These fields have the `required` attribute
3. When Part 1 is selected, Part 2 is hidden with `display: none`
4. HTML5 validation cannot focus on required fields that are hidden
5. Browser throws the "not focusable" error and prevents form submission

## Solution Implemented (Option A)

We implemented a dynamic required field management system that:

1. **Hides both Part 1 and Part 2 by default** until user makes a selection
2. **Dynamically manages `required` attributes** based on which section is visible
3. **Prevents validation errors** on hidden form fields

### Changes Made to `frontend/views.js`

#### 1. Updated Display Logic (Lines 737-740)

**Before:**
```javascript
const showPart1 = d.entity_type_selection !== 'part2' && !submitted;
const showPart2 = d.entity_type_selection === 'part2' && !submitted;
const showBoth = submitted;
```

**After:**
```javascript
// Only show parts if explicitly selected (or if form is already submitted)
const showPart1 = d.entity_type_selection === 'part1';
const showPart2 = d.entity_type_selection === 'part2';
const showBoth = submitted;
```

This ensures neither part shows until user explicitly selects one.

#### 2. Reformatted Radio Button Selection (Lines 803-817)

Broke down the previously single long line into properly formatted HTML for better readability and maintainability.

#### 3. Updated Radio Button Handlers (Lines 808 & 812)

**Before:**
```html
onchange="document.getElementById('p1').style.display='block';document.getElementById('p2').style.display='none';"
```

**After:**
```html
onchange="handleEntityTypeChange('part1')"
```

#### 4. Added JavaScript Function (Lines 819-857)

Created `handleEntityTypeChange()` function that:

- **Shows selected section**, hides the other
- **Removes `required` attribute** from all fields in hidden section
- **Restores `required` attribute** to fields in visible section
- **Stores original required state** using `data-part1-required` and `data-part2-required` attributes

```javascript
function handleEntityTypeChange(selectedType) {
  const part1 = document.getElementById('p1');
  const part2 = document.getElementById('p2');
  
  if (selectedType === 'part1') {
    part1.style.display = 'block';
    part2.style.display = 'none';
    
    // Enable required fields in Part 1
    part1.querySelectorAll('input[data-part1-required], textarea[data-part1-required], select[data-part1-required]')
      .forEach(function(field) {
        field.required = true;
      });
    
    // Disable required fields in Part 2
    part2.querySelectorAll('input[required], textarea[required], select[required]')
      .forEach(function(field) {
        field.required = false;
        field.setAttribute('data-part2-required', 'true');
      });
  } else if (selectedType === 'part2') {
    // Similar logic for Part 2
    part1.style.display = 'none';
    part2.style.display = 'block';
    
    part1.querySelectorAll('input[required], textarea[required], select[required]')
      .forEach(function(field) {
        field.required = false;
        field.setAttribute('data-part1-required', 'true');
      });
    
    part2.querySelectorAll('input[data-part2-required], textarea[data-part2-required], select[data-part2-required]')
      .forEach(function(field) {
        field.required = true;
      });
  }
}
```

## Benefits of This Solution

1. ✅ **Fixes the validation error** - Hidden fields are no longer required
2. ✅ **No forms shown initially** - Cleaner UX until user makes selection
3. ✅ **Proper client-side validation** - Only validates visible fields
4. ✅ **Maintains required field integrity** - Re-enables required when section is shown
5. ✅ **Works with save draft and submit** - No more console errors
6. ✅ **Future-proof** - Automatically handles all required fields in both sections

## Testing Steps

1. Navigate to http://localhost:3000
2. Login with client credentials
3. Go to Due Diligence Form
4. **Initially**: Both Part 1 and Part 2 sections are hidden
5. **Select Part 1**: Only Part 1 form fields appear
6. Try to save/submit: Only Part 1 fields are validated
7. **Select Part 2**: Part 1 hides, Part 2 appears
8. Try to save/submit: Only Part 2 fields are validated
9. **No console errors** should appear

## Technical Details

- **Browser compatibility**: Works with all modern browsers that support `querySelectorAll()` and `forEach()`
- **Performance**: Minimal overhead - only runs when radio button changes
- **Maintainability**: Centralized logic in one function
- **Scalability**: Automatically handles new required fields added to either section

## Date Fixed
2026-08-13

## Files Modified
- `frontend/views.js` (Lines 737-857)
