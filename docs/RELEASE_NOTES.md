# 🎉 Release Notes - Design Tokens Wizards v2.0.0

**Release Date:** 2025-10-19
**Release Type:** MAJOR
**Previous Version:** 1.5.1

## 📦 **Component Versions**

| Component               | Version | Type  |
| ----------------------- | ------- | ----- |
| 🎨 Color Wizard         | 2.9.0   | major |
| 🔤 Typography Wizard    | 1.2.3   | patch |
| 🔳 Space Wizard         | 1.7.2   | patch |
| 📏 Size Wizard          | 1.7.2   | patch |
| 🔲 Border Radius Wizard | 1.7.2   | patch |
| 🌑 Shadow Wizard        | 1.0.0   | major |
| 🌈 Gradient Wizard      | 1.0.0   | major |
| 🔄 Merge Spell          | 1.4.0   | minor |
| 🧹 Clear Spell          | 1.3.0   | minor |

## 📋 **Change Summary**

✨ **New features** added • 🔧 **Improvements** made • 📚 **Documentation** updates • 🧹 **Cleanup** tasks completed

### 📊 **Changes Overview**

This release includes significant additions and improvements:

- **14 files changed**: ~2,454 insertions(+), 57 deletions(-)
- **5 new automation scripts** added to `.github/config/`
- **2 new wizards** added (Shadow & Gradient)
- **2 new dependencies** added (`ora` for better CLI feedback)
- **All wizards updated** for consistency and improved functionality
- **Both spells enhanced** to support shadow and gradient tokens

## 🎯 **Key Highlights**

### ✨ **New Features**

#### 🌑 **Shadow Tokens Wizard (v1.0.0)**
A comprehensive wizard for generating and managing shadow design tokens with:
- **Multiple presets**: Material Design shadows, soft shadows, and custom configurations
- **Full control**: Customize offset, blur, spread, and color values
- **Multiple formats**: Export to JSON, CSS, and SCSS
- **Accessibility-focused**: Create consistent, accessible shadow systems
- **Usage**: `npm run shadow`

#### 🌈 **Gradient Tokens Wizard (v1.0.0)**
Professional gradient token generation supporting:
- **Multiple gradient types**: Linear, radial, and conic gradients
- **Flexible configuration**: Full control over colors, directions, and stops
- **Export formats**: JSON, CSS, and SCSS outputs
- **Usage**: `npm run gradient`

### 🔧 **Enhanced Spell System**

#### 🧹 **Clear Spell (v1.3.0)**
- Enhanced to support clearing shadow token files
- Enhanced to support clearing gradient token files
- Improved user prompts and feedback
- Better error handling and file validation

#### 🔄 **Merge Spell (v1.4.0)**
- Updated to handle shadow tokens when merging design token files
- Updated to handle gradient tokens when merging design token files
- Improved merge logic for better token consolidation
- Enhanced compatibility with all token types

### 🔧 **Dependency Updates**

- **Added `ora@9.0.0`**: Enhanced loading spinners and CLI feedback for better user experience
- Updated package-lock.json with latest dependency resolutions
- Improved overall package stability and performance

### 📚 **Documentation Updates**

- **Comprehensive Shadow Wizard documentation** with visual assets and examples
- **Gradient Wizard documentation** with usage instructions
- Updated `README.md` (English) with new wizard information and usage examples
- Updated `README.es.md` (Spanish) with new wizard information and usage examples
- Enhanced documentation structure and clarity across all files
- Added visual preview for Shadow Wizard (`src/assets/shadow_wiz.png`)

### 🗂️ **Project Organization**

- **New automation scripts** in `.github/config/` for release management and versioning
- **Enhanced .gitignore** to better handle temporary files and build artifacts
- **Better project structure** with improved file organization
- **Standardized paths** across all wizards and spells

### 🛠️ **Technical Improvements**

- **Enhanced code consistency** across all wizards and spells
- **Improved error handling** in Clear and Merge spells
- **Better user feedback** with ora loading spinners
- **Streamlined workflows** for release management
- **Added automation scripts** in `.github/config/`:
  - `create_release.js`: Automated release notes generation
  - `update_versions.js`: Version management across components
  - `generate_dependencies.js`: Dependency analysis and documentation
  - `pdf-config.json` & `pdf-styles.css`: PDF generation configuration for documentation

### 🧹 **Cleanup and Optimization**

- **Code simplification** for better maintainability across all wizards
- **Enhanced documentation** with clearer examples and usage instructions
- **Improved .gitignore** to properly exclude temporary and system files
- **Removed obsolete files** from version control (CONTRIBUTING.md, FUNDING.yml, README.es.md from root)

### 📝 **User Experience Enhancements**

- **Better visual feedback** with ora loading spinners during token generation
- **Enhanced prompts** in Clear and Merge spells
- **Clearer success messages** when tokens are generated
- **Consistent interface** across all wizards and spells
- **Improved error messages** for better troubleshooting

## 📁 **New Files Added**

This release adds several new files to enhance automation and functionality:

### 🤖 **Automation Scripts**
- `.github/config/create_release.js` - Automated release notes generation
- `.github/config/update_versions.js` - Component version synchronization
- `.github/config/generate_dependencies.js` - Dependency management and analysis

### 🎨 **New Wizards**
- `src/wizards/gradient_wiz.js` - Gradient tokens wizard (~267 lines)
- `src/wizards/shadow_wiz.js` - Shadow tokens wizard (~948 lines)
- `src/assets/shadow_wiz.png` - Visual documentation for Shadow Wizard

### 📄 **Configuration Files**
- `.github/config/pdf-config.json` - PDF generation configuration
- `.github/config/pdf-styles.css` - Custom styles for PDF exports

## 📚 **Documentation**

### 📖 **Updated Documentation**

- **README.md**: Updated with Shadow and Gradient wizard documentation
- **README.es.md**: Spanish translation updated with new wizards
- **Shadow Wizard**: Complete documentation with visual assets and usage examples
- **Gradient Wizard**: Comprehensive guide with configuration options
- **Enhanced examples** across all wizard documentation
- **Clearer usage instructions** for all commands

## 🚀 **Compatibility**

This version maintains **full backward compatibility** with existing wizards while adding:

- **Two new token types**: Shadow and Gradient tokens
- **Enhanced spell functionality**: Clear and Merge spells now support all token types
- **Improved user experience**: Better visual feedback and error handling
- **Extended automation**: New scripts for release management and version control

## 🔄 **Migration Guide**

If you're upgrading from a previous version:

1. **New Commands Available**:
   - `npm run shadow` - Generate shadow tokens
   - `npm run gradient` - Generate gradient tokens
2. **Enhanced Spells**: Clear and Merge spells now support shadow and gradient tokens
3. **No Breaking Changes**: All existing wizards continue to work as before
4. **Updated Documentation**: Check README.md for complete usage instructions

---

**Thank you for using Design Tokens Wizards! 🧙‍♂️✨**

---

## 📋 **Release Checklist**

- [x] All wizards tested and working
- [x] Documentation updated
- [x] Version numbers synchronized
- [x] Release notes generated
- [x] Project structure cleaned up
- [x] Output directories standardized
- [ ] Git tag created: v2.0.0
- [ ] GitHub release created

## 🔗 **Git Information**

- **Release type**: major
- **Tag to create**: v2.0.0
