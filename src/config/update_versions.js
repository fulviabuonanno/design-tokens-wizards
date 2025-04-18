import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'));

// Extract versions from npm scripts
const getVersionFromScript = (script) => {
  const match = script.match(/--version=(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
};

const versions = {
  color: getVersionFromScript(packageJson.scripts.color),
  size: getVersionFromScript(packageJson.scripts.size),
  space: getVersionFromScript(packageJson.scripts.space),
  radii: getVersionFromScript(packageJson.scripts.radii),
  typo: getVersionFromScript(packageJson.scripts.typo),
  clear: getVersionFromScript(packageJson.scripts.clear),
  merge: getVersionFromScript(packageJson.scripts.merge)
};

// Read README.md
const readmePath = path.join(__dirname, '..', '..', 'README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// Function to determine version change type
const getVersionEmoji = (oldVersion, newVersion) => {
  if (!oldVersion) return '🔥'; // New feature
  const [oldMajor, oldMinor, oldPatch] = oldVersion.split('.').map(Number);
  const [newMajor, newMinor, newPatch] = newVersion.split('.').map(Number);
  
  if (oldMajor !== newMajor) return '🆙'; // Major update
  if (oldMinor !== newMinor) return '🔥'; // New feature
  if (oldPatch !== newPatch) return '✅'; // Minor update
  
  return ''; // No change
};

// Update versions in the tables in the correct order
readmeContent = readmeContent.replace(
  /\| 🟡 \*\*COLOR WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
  (match, oldVersion) => {
    const emoji = getVersionEmoji(oldVersion, versions.color);
    return `| 🟡 **COLOR WIZ**         | \`color-wiz.js\` | \`npm run color\` | Generate and manage color tokens         | ${versions.color}${emoji ? ' ' + emoji : ''}`;
  }
);
readmeContent = readmeContent.replace(
  /\| 🔴 \*\*TYPOGRAPHY WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
  (match, oldVersion) => {
    const emoji = getVersionEmoji(oldVersion, versions.typo);
    return `| 🔴 **TYPOGRAPHY WIZ**    | \`typo_wiz.js\`  | \`npm run typo\`  | Generate and manage typography tokens    | ${versions.typo}${emoji ? ' ' + emoji : ''}`;
  }
);
readmeContent = readmeContent.replace(
  /\| 🟣 \*\*SPACE WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
  (match, oldVersion) => {
    const emoji = getVersionEmoji(oldVersion, versions.space);
    return `| 🟣 **SPACE WIZ**         | \`space_wiz.js\` | \`npm run space\` | Generate and manage spacing tokens       | ${versions.space}${emoji ? ' ' + emoji : ''}`;
  }
);
readmeContent = readmeContent.replace(
  /\| 🔵 \*\*SIZE WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
  (match, oldVersion) => {
    const emoji = getVersionEmoji(oldVersion, versions.size);
    return `| 🔵 **SIZE WIZ**          | \`size_wiz.js\`  | \`npm run size\`  | Generate and manage size tokens          | ${versions.size}${emoji ? ' ' + emoji : ''}`;
  }
);
readmeContent = readmeContent.replace(
  /\| 🟢 \*\*BORDER RADIUS WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
  (match, oldVersion) => {
    const emoji = getVersionEmoji(oldVersion, versions.radii);
    return `| 🟢 **BORDER RADIUS WIZ** | \`radii_wiz.js\` | \`npm run radii\` | Generate and manage border radius tokens | ${versions.radii}${emoji ? ' ' + emoji : ''}`;
  }
);

// Update spell versions
readmeContent = readmeContent.replace(
  /\| \*\*MERGE SPELL\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
  (match, oldVersion) => {
    const emoji = getVersionEmoji(oldVersion, versions.merge);
    return `| **MERGE SPELL** | \`merge_spell.js\` | \`npm run merge\` | Combine all token files into a single unified file     | ${versions.merge}${emoji ? ' ' + emoji : ''}`;
  }
);
readmeContent = readmeContent.replace(
  /\| \*\*CLEAR SPELL\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
  (match, oldVersion) => {
    const emoji = getVersionEmoji(oldVersion, versions.clear);
    return `| **CLEAR SPELL** | \`clear_spell.js\` | \`npm run clear\` | Remove all generated output files in one swift command | ${versions.clear}${emoji ? ' ' + emoji : ''}`;
  }
);

// Update version sections (without emojis)
readmeContent = readmeContent.replace(
  /### 🎨 \*\*Color Tokens Wizard\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
  `### 🎨 **Color Tokens Wizard** ✨\n\nVersion ${versions.color}`
);
readmeContent = readmeContent.replace(
  /### 📏 \*\*Size Tokens Wizard\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
  `### 📏 **Size Tokens Wizard** ✨\n\nVersion ${versions.size}`
);
readmeContent = readmeContent.replace(
  /### 🔳 \*\*Space Tokens Wizard\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
  `### 🔳 **Space Tokens Wizard** ✨\n\nVersion ${versions.space}`
);
readmeContent = readmeContent.replace(
  /### ⭕️ \*\*Border Radius Tokens Wizard\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
  `### ⭕️ **Border Radius Tokens Wizard** ✨\n\nVersion ${versions.radii}`
);
readmeContent = readmeContent.replace(
  /### 🔤 Typography Tokens Wizard ✨\n\nVersion \d+\.\d+\.\d+/,
  `### 🔤 Typography Tokens Wizard ✨\n\nVersion ${versions.typo}`
);
readmeContent = readmeContent.replace(
  /### 🧹 \*\*Clear Spell\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
  `### 🧹 **Clear Spell** ✨\n\nVersion ${versions.clear}`
);
readmeContent = readmeContent.replace(
  /### 🪄 \*\*Merge Spell\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
  `### 🪄 **Merge Spell** ✨\n\nVersion ${versions.merge}`
);

// Write updated README.md
fs.writeFileSync(readmePath, readmeContent);

console.log('✅ README.md version numbers have been updated successfully!'); 