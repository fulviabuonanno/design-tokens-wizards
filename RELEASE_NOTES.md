# 🎉 Release Notes - Design Tokens Wizards v2.0.0

**Release Date:** 2025-10-11  
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
| 🔄 Merge Spell          | 1.3.2   | patch |
| 🧹 Clear Spell          | 1.2.2   | patch |

## 📋 **Change Summary**

✨ **New features** added • 🔧 **Improvements** made • 📚 **Documentation** updates • 🧹 **Cleanup** tasks completed

## 🎯 **Key Highlights**

### 🔧 **Dependency Management**

- Updated outdated npm dependencies (`chalk`, `debug`, `inquirer`, `puppeteer`).
- Installed missing `ffmpeg` package.
- Added `@builtwithjavascript/oklch-converter` dependency for OKLCH color support.
- Removed non-existent `.github/config/generate_dependencies.js` script from `package.json` to resolve installation errors.

### 📚 **Documentation Updates**

- Updated Node.js version badge in `README.md` and `README.es.md` to `^20.11.0`.
- Created missing `.github/config/pdf-config.json` file to enable `npm run pdf` script.

### 🛠️ **Technical Improvements**

### 🧹 **Cleanup and Optimization**

- **Code simplification** for better maintainability
- **Removed obsolete** configuration files
- **Enhanced documentation** and examples

### 📝 **User Experience**

- **Enhanced prompts** in all wizards
- **Updated welcome messages** for better clarity
- **Consistent interface** across all components

## 📚 **Documentation**

### 📖 **Updated Documentation**

- **Synchronized versions** across all documentation
- **Improved clarity** and organization
- **Enhanced examples** and usage guides

## 🚀 **Compatibility**

This version maintains **full backward compatibility** while introducing improvements in:

- **Token structure consistency**
- **User experience enhancements**
- **Performance optimizations**
- **Code maintainability**

---

**Thank you for using Design Tokens Wizards! 🧙‍♂️✨**

---

## 📋 **Release Checklist**

- [ ] All wizards tested and working
- [ ] Documentation updated
- [ ] Version numbers synchronized
- [ ] Release notes generated
- [ ] Git tag created: v2.0.0
- [ ] GitHub release created

## 🔗 **Git Information**

- **Release type**: major
- **Tag to create**: v2.0.0
