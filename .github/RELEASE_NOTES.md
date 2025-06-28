# 🎉 Release Notes - Design Tokens Wizards v1.5.0

**Release Date:** 2025-06-28  
**Release Type:** MINOR  
**Previous Version:** mvp

## 📦 **Component Versions**

| Component               | Version | Type  |
| ----------------------- | ------- | ----- |
| 🎨 Color Wizard         | 2.8.2   | patch |
| 🔤 Typography Wizard    | 1.2.2   | patch |
| 🔳 Space Wizard         | 1.7.1   | patch |
| 📏 Size Wizard          | 1.7.1   | patch |
| 🔲 Border Radius Wizard | 1.7.1   | patch |
| 🔄 Merge Spell          | 1.3.1   | patch |
| 🧹 Clear Spell          | 1.2.2   | patch |

## 📋 **Change Summary**

✨ **6 new features** added • 🔧 **3 improvements** made • 📚 **3 documentation** updates • 🧹 **5 cleanup** tasks completed
**Total changes since mvp**: 20 commits

## 🎯 **Key Highlights**

### 🔧 **Token Structure Improvements**

- **Complete refactoring** of all wizards to use consistent `$value` and `$type` properties
- **Standardization** of JSON token format across all generators
- **Enhanced compatibility** with W3C

### 🔮 **Enhanced Merge Functionality**

- **New CSS merge functionality**: CSS files now combine into a single `:root` block
- **Automatic consolidation** of CSS variables from multiple files
- **Optimized** merge process for better performance
- **Name Case** including function to enable naming case convention

## 🛠️ **Technical Improvements**

### 🧹 **Cleanup and Optimization**

- **Removed unnecessary unit conversion** in size, spacing, and border radius wizards
- **Code simplification** for better maintainability
- **Removal** of obsolete configuration files

### 📝 **User Experience**

- **Enhanced prompts** in all wizards with improved clarity
- **Updated welcome messages** that are more informative
- **Consistency** in user interface across all wizards

## 📚 **Documentation**

### 📖 **Updated READMEs**

- **Updated versions** in all documentation tables
- **New emoji legend**: ✨ Patch // 🌟 Minor Change // ✅ Major Change
- **Improved clarity** and organization of documentation
- **Synchronization** between English and Spanish READMEs

### 🔧 **Maintenance Scripts**

- **Enhanced version update script** with optimizations
- **Automation** of documentation update process
- **Improved version management** in package.json

## 🚀 **Compatibility**

This version maintains **full backward compatibility** while introducing significant improvements in:

- **More consistent token structure**
- **Enhanced user experience**
- **Optimized performance**
- **Code maintainability**

---

**Thank you for using Design Tokens Wizards! 🧙‍♂️✨**

---

## 📋 **Release Checklist**

- [ ] All wizards tested and working
- [ ] Documentation updated
- [ ] Version numbers synchronized
- [ ] Release notes generated
- [ ] Git tag created: v1.5.0
- [ ] GitHub release created

## 🔗 **Git Information**

- **Total commits since mvp**: 20
- **Release type**: minor
- **Tag to create**: v1.5.0
