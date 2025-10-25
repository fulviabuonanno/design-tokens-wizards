# Changelog

All notable changes to the Design Tokens Wizards project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Note:** This project uses independent versioning. The package version tracks the overall toolkit infrastructure, while each wizard maintains its own semantic version. See the version table below for individual wizard versions.

<!--
## [Unreleased]

This section is reserved for documenting changes that are staged for an upcoming release.
Currently, there are no unreleased changes since all recent updates have been published with v2.11.0 of the Color Wizard and toolkit v2.0.0.
You can add future changes here as development continues.
-->

## [2.0.0] - 2025-10-24

### Updated Wizards

- 🎨 Color Wizard updated to v2.11.0

#### 🎨 Color Wizard (v2.11.0)

**Added:**

- **Batch Mode Enhancement:** Two convenient ways to add multiple colors at once
  - **Bulk Entry Mode:** Paste multiple HEX codes in a single input
    - Supports comma (`,`) and semicolon (`;`) separators
    - Works with or without `#` symbol (e.g., `#FF5733, 3498DB; 2ECC71`)
    - Validates all HEX codes before proceeding
    - Prompts for individual color names after bulk entry
  - **Individual Entry Mode:** Add colors one at a time with immediate feedback
    - Enter HEX code and name for each color
    - Option to add more colors after each entry
    - Real-time color preview for each addition
- New STEP 4: Batch mode selection screen
- Enhanced STEP 5: Dynamic color input based on selected mode
- Improved preview display for batch mode with summary view
- Duplicate name detection across batch entries

**Changed:**

- Reorganized wizard flow for better clarity
- All colors in a batch now share the same scale settings
- Updated output messages with batch processing progress

**Technical:**

- Modified `src/wizards/color_wiz.js` - Core batch mode implementation
- Updated `package.json` - Version bump to 2.11.0
- Updated `README.md` and `README.es.md` - Documentation for batch mode

**Note:** This version maintains full backward compatibility. Single color workflow remains unchanged, and batch mode is opt-in.

---

## How to Update

To use the latest version:

```bash
# Pull the latest changes
git pull origin master

# Or download the latest release
# https://github.com/fulviabuonanno/design-tokens-wizards/releases

# Install dependencies (if needed)
npm install

# Run any wizard
npm run color  # Color Wizard
npm run typo   # Typography Wizard
npm run space  # Space Wizard
npm run size   # Size Wizard
npm run radii  # Border Radius Wizard
npm run merge  # Merge Spell
npm run clear  # Clear Spell
```

## Design Tokens Wizards Versions

Track individual Wizards versions:

| Wizard / Spell          | Version | Last Updated |
| ----------------------- | ------- | ------------ |
| 🎨 Color Wizard         | 2.11.0 ![Color Wizard](https://img.shields.io/badge/Color%20Wiz-v2.11.0-yellow) | 2025-10-24   |
| 🔤 Typography Wizard    | 1.2.3 ![Typography Wizard](https://img.shields.io/badge/Typography%20Wiz-v1.2.3-red)   | -            |
| 🔳 Space Wizard         | 1.7.2 ![Space Wizard](https://img.shields.io/badge/Space%20Wiz-v1.7.2-blueviolet) | -            |
| 📏 Size Wizard          | 1.7.2 ![Size Wizard](https://img.shields.io/badge/Size%20Wiz-v1.7.2-blue)   | -            |
| 🔲 Border Radius Wizard | 1.7.2 ![Border Radius Wizard](https://img.shields.io/badge/Border%20Radius%20Wiz-v1.7.2-green) | -            |
| 🔄 Merge Spell          | 1.3.3 ![Merge Spell](https://img.shields.io/badge/Merge%20Spell-v1.3.3-orange) | -            |
| 🧹 Clear Spell          | 1.2.2 ![Clear Spell](https://img.shields.io/badge/Clear%20Spell-v1.2.2-lightgrey) | -            |

## Feedback

We welcome your feedback! Please:

- Visit our [website](https://www.designtokenswizards.com)
- Fill out our [feedback form](https://tally.so/r/m6V6Po/)
- [Open an issue](https://github.com/fulviabuonanno/design-tokens-wizards/issues) on GitHub

---

**Legend:**

- 🎨 Color Wizard
- 🔤 Typography Wizard
- 🔳 Space Wizard
- 📏 Size Wizard
- 🔲 Border Radius Wizard
- 🔄 Merge Spell
- 🧹 Clear Spell
