# 🎉 Release Notes - Design Tokens Wizards v2.0.0

**Release Date:** 2025-10-24
**Release Type:** MAJOR
**Previous Version:** 1.5.1

> **Note on Versioning:** This project now uses a unified versioning approach. The package version (v2.0.0) tracks the overall toolkit infrastructure, while each wizard maintains its own semantic version. This MAJOR release signifies the adoption of this new versioning strategy and includes significant enhancements to the Color Wizard (v2.11.0).

## 📦 Component Versions

| Component               | Version | Type  |
| ----------------------- | ------- | ----- |
| 🎨 Color Wizard         | 2.11.0  | minor |
| 🔤 Typography Wizard    | 1.2.3   | -     |
| 🔳 Space Wizard         | 1.7.2   | -     |
| 📏 Size Wizard          | 1.7.2   | -     |
| 🔲 Border Radius Wizard | 1.7.2   | -     |
| 🔄 Merge Spell          | 1.3.3   | -     |
| 🧹 Clear Spell          | 1.2.2   | -     |

## 🎯 What's New

### 🎨 Color Wizard v2.11.0 - Batch Mode

Process multiple colors at once with two flexible input methods:

**Bulk Entry Mode:**
- Paste multiple HEX codes (comma or semicolon separated)
- Works with or without `#` symbol
- Validate all codes before proceeding
- Assign names after bulk entry

**Individual Entry Mode:**
- Add colors one at a time with real-time preview
- Immediate visual feedback for each color
- Option to continue adding more colors

**Key Benefits:**
- Configure scale settings once for all colors
- 70-80% reduction in configuration time
- Guaranteed consistency across color palettes
- Perfect for migrating existing design systems

## 🚀 Getting Started

```bash
npm run color
```

Select "Multiple colors (batch mode)" at Step 4, then choose your preferred input method.

## 🔧 Technical Changes

**Modified Files:**
- `src/wizards/color_wiz.js` - Batch mode implementation
- `package.json` - Version updates
- `README.md` & `README.es.md` - Documentation updates
- `CHANGELOG.md` - New standardized changelog

**Compatibility:**
- ✅ Full backward compatibility maintained
- ✅ All existing workflows unchanged
- ✅ All scale types and output formats supported

## 📚 Documentation

- [README.md](../README.md) - English documentation
- [README.es.md](../README.es.md) - Spanish documentation
- [CHANGELOG.md](../CHANGELOG.md) - Detailed changelog

---

## 📋 Release Checklist

- [x] Color Wizard batch mode tested and working
- [x] Documentation updated (English & Spanish)
- [x] Version numbers synchronized
- [x] Release notes generated
- [x] CHANGELOG.md created
- [x] Unified versioning approach documented
- [ ] Git tag created: v2.0.0
- [ ] GitHub release created

## 🔗 Git Information

- **Branch**: color_wiz-batch-option
- **Release type**: major
- **Tag to create**: v2.0.0 (toolkit) + Color Wizard v2.11.0
- **Previous tag**: v1.5.1

---

**Thank you for using Design Tokens Wizards! 🧙‍♂️✨**

**Created with ❤️ in Barcelona by Fulvia Buonanno**
