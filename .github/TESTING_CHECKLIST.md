# Color Wizard Refactoring - Testing Checklist

## Test Execution Date: _______

### ✅ Pre-Test Validation
- [x] All files pass syntax check (`node --check`)
- [x] No existing output files (clean slate)
- [x] All dependencies installed

---

## Test Suite

### 🧪 Test 1: Basic Single Color Flow (Incremental Scale)
**Command:** `npm run color`

**Steps:**
1. Select: Global Colors
2. Category: Yes → primitives
3. Naming Level: Yes → color
4. Batch Mode: Single color
5. Enter HEX: `#3B82F6` (blue)
6. Enter Name: `blue`
7. Scale Type: Incremental
8. Step: 100 in 100
9. Stops Count: 10
10. Customize ranges: No (use defaults 10-90%)
11. Middle tone: No
12. Confirm: Yes
13. Add more colors: No
14. Convert to other formats: No

**Expected Results:**
- [ ] Wizard completes without errors
- [ ] File created: `output_files/tokens/json/color/color_tokens_hex.json`
- [ ] File created: `output_files/tokens/css/color/color_variables_hex.css`
- [ ] File created: `output_files/tokens/scss/color/color_variables_hex.scss`
- [ ] JSON contains: `primitives.color.blue.100` through `primitives.color.blue.1000`
- [ ] JSON contains: `primitives.color.blue.base`
- [ ] All colors are valid HEX format (uppercase)

---

### 🧪 Test 2: Batch Mode with Multiple Colors
**Command:** `npm run color`

**Steps:**
1. Select: Global Colors
2. Category: Yes → core
3. Naming Level: Yes → palette
4. Batch Mode: **Multiple colors (batch mode)**
5. Method: Enter multiple HEX codes at once
6. Enter: `#EF4444, #10B981, #F59E0B` (red, green, amber)
7. Name them: red, green, amber
8. Scale Type: Ordinal
9. Format: Padded (01, 02, 03)
10. Stops Count: 5
11. Customize ranges: No
12. Confirm: Yes
13. Add more colors: No
14. Convert: Yes → Select RGB, HSL

**Expected Results:**
- [ ] All 3 colors processed successfully
- [ ] Shows batch processing message
- [ ] JSON contains all 3 colors under `core.palette.*`
- [ ] Each color has 5 stops (01-05) + base
- [ ] RGB file created with correct format
- [ ] HSL file created with correct format
- [ ] CSS/SCSS files created for all formats

---

### 🧪 Test 3: Semantic Stops Scale
**Command:** `npm run color`

**Steps:**
1. Select: Global Colors
2. Category: No
3. Naming Level: No
4. Batch Mode: Single color
5. Enter HEX: `#8B5CF6` (purple)
6. Enter Name: `purple`
7. Scale Type: **Semantic Stops**
8. Stops Count: 6
9. Customize ranges: Yes → Min: 20%, Max: 80%
10. Middle tone: No
11. Confirm: Yes

**Expected Results:**
- [ ] Semantic labels used: darkest, darker, dark, base, light, lighter, lightest
- [ ] Correct ordering in JSON
- [ ] Custom mix percentages applied (20-80%)

---

### 🧪 Test 4: Alphabetical Scale
**Command:** `npm run color`

**Steps:**
1. Add to existing tokens (should detect existing structure)
2. Batch Mode: Single color
3. Enter HEX: `#EC4899` (pink)
4. Enter Name: `pink`
5. Scale Type: **Alphabetical**
6. Format: Uppercase (A, B, C)
7. Stops Count: 5
8. Customize ranges: No
9. Confirm: Yes

**Expected Results:**
- [ ] Detects existing structure from previous test
- [ ] Uses same category/naming structure
- [ ] Stops labeled: A, B, C, D, E + base
- [ ] Added to existing JSON file

---

### 🧪 Test 5: Multiple Additions to Same File
**Command:** `npm run color`

**Steps:**
1. Add another color with same structure
2. Add more colors: **Yes** (loop back)
3. Repeat 2-3 times with different colors
4. Finally select No to exit

**Expected Results:**
- [ ] All colors accumulated in same file
- [ ] No data loss between iterations
- [ ] Proper token structure maintained
- [ ] File formatting preserved

---

### 🧪 Test 6: Edge Cases

#### 6a. Very few stops (1 stop)
- [ ] Wizard handles 1 stop without errors
- [ ] Only base color created

#### 6b. Maximum stops (20 stops)
- [ ] Wizard handles 20 stops
- [ ] All stops generated correctly

#### 6c. Special characters in color name
- [ ] Hyphens accepted: `sky-blue`
- [ ] Dots accepted: `blue.light`
- [ ] Invalid chars rejected: `blue@test`

#### 6d. Duplicate color name
- [ ] Shows error message
- [ ] Prompts for different name

---

## Validation Checks

### File Structure
```
output_files/
├── tokens/
│   ├── json/color/
│   │   ├── color_tokens_hex.json
│   │   ├── color_tokens_rgb.json (if converted)
│   │   ├── color_tokens_hsl.json (if converted)
│   │   └── color_tokens_oklch.json (if converted)
│   ├── css/color/
│   │   ├── color_variables_hex.css
│   │   └── ... (other formats)
│   └── scss/color/
│       ├── color_variables_hex.scss
│       └── ... (other formats)
```

### JSON Format Validation
- [ ] Valid JSON syntax
- [ ] `$value` before `$type` in each token
- [ ] `$type: "color"` for all tokens
- [ ] Proper nesting based on structure chosen
- [ ] `base` value appears first in each color group

### CSS/SCSS Format Validation
- [ ] CSS uses `--variable-name` syntax
- [ ] SCSS uses `$variable-name` syntax
- [ ] All values properly formatted
- [ ] Proper ordering maintained

---

## Performance Checks
- [ ] No noticeable lag or freezing
- [ ] Color previews display correctly
- [ ] Table rendering works properly
- [ ] Memory cleaned up (caches cleared)

---

## Error Handling
- [ ] Invalid HEX shows clear error message
- [ ] Empty inputs handled gracefully
- [ ] Ctrl+C exits cleanly
- [ ] No unhandled promise rejections
- [ ] No console errors or warnings

---

## Notes / Issues Found:
_Document any bugs, unexpected behavior, or improvements needed:_

1.
2.
3.

---

## Overall Result: ⬜ PASS / ⬜ FAIL

**Tested by:** _________________
**Date:** _________________
**Version:** 2.11.0 (Refactored)
