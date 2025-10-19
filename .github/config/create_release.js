import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import Table from 'cli-table3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get version from command line argument
const versionArg = process.argv.find(arg => arg.startsWith("--version="));
const version = versionArg ? versionArg.split("=")[1] : "1.0.0";

console.log(chalk.bold.whiteBright.bgGray(`Create Release Script - Version ${version}`));

// Paths - Updated for .github/config location
const projectRoot = path.join(__dirname, '..', '..');
const packageJsonPath = path.join(projectRoot, 'package.json');
const releaseNotesPath = path.join(projectRoot, 'RELEASE_NOTES.md');

/**
 * Displays a loading message with progressing dots.
 */
const showLoader = (message, duration) => {
  process.stdout.write(message);
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      process.stdout.write('.');
    }, 500);
    setTimeout(() => {
      clearInterval(interval);
      process.stdout.write('\n');
      resolve();
    }, duration);
  });
};

/**
 * Read package.json and extract version information
 */
const readPackageJson = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson;
  } catch (error) {
    console.error(chalk.red('❌ Error reading package.json:'), error.message);
    process.exit(1);
  }
};

/**
 * Get current date in YYYY-MM-DD format
 */
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Determine release type based on version change
 */
const getReleaseType = (oldVersion, newVersion) => {
  const oldParts = oldVersion.split('.').map(Number);
  const newParts = newVersion.split('.').map(Number);
  
  if (newParts[0] > oldParts[0]) return 'MAJOR';
  if (newParts[1] > oldParts[1]) return 'MINOR';
  if (newParts[2] > oldParts[2]) return 'PATCH';
  return 'PATCH';
};

/**
 * Generate component versions table
 */
const generateComponentVersions = (packageJson) => {
  const scriptVersions = packageJson.scriptVersions || {};
  const components = [
    { name: '🎨 Color Wizard', key: 'color', version: scriptVersions.color || '1.0.0' },
    { name: '🔤 Typography Wizard', key: 'typo', version: scriptVersions.typo || '1.0.0' },
    { name: '🔳 Space Wizard', key: 'space', version: scriptVersions.space || '1.0.0' },
    { name: '📏 Size Wizard', key: 'size', version: scriptVersions.size || '1.0.0' },
    { name: '🔲 Border Radius Wizard', key: 'radii', version: scriptVersions.radii || '1.0.0' },
    { name: '🔄 Merge Spell', key: 'merge', version: scriptVersions.merge || '1.0.0' },
    { name: '🧹 Clear Spell', key: 'clear', version: scriptVersions.clear || '1.0.0' }
  ];

  return components;
};

/**
 * Generate release notes content
 */
const generateReleaseNotes = (packageJson, newVersion) => {
  const currentVersion = packageJson.version;
  const releaseType = getReleaseType(currentVersion, newVersion);
  const releaseDate = getCurrentDate();
  const components = generateComponentVersions(packageJson);

  const componentTable = components.map(comp => 
    `| ${comp.name} | ${comp.version} | patch |`
  ).join('\n');

  const releaseNotes = `# 🎉 Release Notes - Design Tokens Wizards v${newVersion}

**Release Date:** ${releaseDate}  
**Release Type:** ${releaseType}  
**Previous Version:** ${currentVersion}

## 📦 **Component Versions**

| Component               | Version | Type  |
| ----------------------- | ------- | ----- |
${componentTable}

## 📋 **Change Summary**

✨ **New features** added • 🔧 **Improvements** made • 📚 **Documentation** updates • 🧹 **Cleanup** tasks completed

## 🎯 **Key Highlights**

### 🔧 **Token Structure Improvements**

- **Enhanced consistency** across all wizards
- **Improved token format** standardization
- **Better compatibility** with design systems

### 🔮 **Enhanced Functionality**

- **Improved user experience** across all wizards
- **Better error handling** and validation
- **Optimized performance** for token generation

## 🛠️ **Technical Improvements**

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
- [ ] Git tag created: v${newVersion}
- [ ] GitHub release created

## 🔗 **Git Information**

- **Release type**: ${releaseType.toLowerCase()}
- **Tag to create**: v${newVersion}
`;

  return releaseNotes;
};

/**
 * Update package.json version
 */
const updatePackageVersion = (packageJson, newVersion) => {
  packageJson.version = newVersion;
  
  try {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Error updating package.json:'), error.message);
    return false;
  }
};

/**
 * Write release notes to file
 */
const writeReleaseNotes = (content) => {
  try {
    fs.writeFileSync(releaseNotesPath, content);
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Error writing release notes:'), error.message);
    return false;
  }
};

/**
 * Display release summary
 */
const displayReleaseSummary = (packageJson, newVersion, components) => {
  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🎉 RELEASE SUMMARY"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  const summaryTable = new Table({
    head: [chalk.bold.yellow('Component'), chalk.bold.yellow('Version'), chalk.bold.yellow('Type')],
    colWidths: [25, 15, 10]
  });

  components.forEach(comp => {
    summaryTable.push([comp.name, comp.version, 'patch']);
  });

  console.log(summaryTable.toString());

  console.log(chalk.bold.green(`\n✅ Release v${newVersion} prepared successfully!`));
  console.log(chalk.whiteBright(`📄 Release notes: ${path.relative(process.cwd(), releaseNotesPath)}`));
  console.log(chalk.whiteBright(`📦 Package version updated: ${packageJson.version}`));
  
  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🚀 NEXT STEPS"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
  
  console.log(chalk.whiteBright("1. Review the generated release notes"));
  console.log(chalk.whiteBright("2. Test all wizards to ensure they work correctly"));
  console.log(chalk.whiteBright("3. Commit your changes:"));
  console.log(chalk.cyan(`   git add .`));
  console.log(chalk.cyan(`   git commit -m "chore: prepare release v${newVersion}"`));
  console.log(chalk.whiteBright("4. Create a git tag:"));
  console.log(chalk.cyan(`   git tag v${newVersion}`));
  console.log(chalk.whiteBright("5. Push to GitHub:"));
  console.log(chalk.cyan(`   git push origin main --tags`));
  console.log(chalk.whiteBright("6. Create a GitHub release using the generated notes"));
};

/**
 * Main function
 */
const main = async () => {
  try {
    console.log(chalk.bold.cyan("🧙‍♂️ Design Tokens Wizards - Release Creator"));
    console.log(chalk.gray("==============================================\n"));

    // Read current package.json
    const packageJson = readPackageJson();
    const currentVersion = packageJson.version;
    
    console.log(chalk.whiteBright(`📦 Current version: ${currentVersion}`));
    console.log(chalk.whiteBright(`🎯 Target version: ${version}\n`));

    await showLoader(chalk.bold.yellow("🔄 Preparing release"), 2000);

    // Generate release notes
    const releaseNotes = generateReleaseNotes(packageJson, version);
    
    // Update package.json version
    const versionUpdated = updatePackageVersion(packageJson, version);
    if (!versionUpdated) {
      process.exit(1);
    }

    // Write release notes
    const notesWritten = writeReleaseNotes(releaseNotes);
    if (!notesWritten) {
      process.exit(1);
    }

    await showLoader(chalk.bold.green("✅ Finalizing release"), 1500);

    // Display summary
    const components = generateComponentVersions(packageJson);
    displayReleaseSummary(packageJson, version, components);

  } catch (error) {
    console.error(chalk.red('❌ Error creating release:'), error.message);
    process.exit(1);
  }
};

// Run the script
main(); 