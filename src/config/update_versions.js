import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'));
const scriptVersions = packageJson.scriptVersions;

// Read README.md
const readmePath = path.join(__dirname, '..', '..', 'README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// Update versions in the tables
readmeContent = readmeContent.replace(
  /\| 🟡 \*\*COLOR WIZ\*\*.*?\| (\d+\.\d+\.\d+)/,
  `| 🟡 **COLOR WIZ**         | \`color-wiz.js\` | \`npm run color\` | Generate and manage color tokens         | ${scriptVersions.color}`
);
readmeContent = readmeContent.replace(
  /\| 🔵 \*\*SIZE WIZ\*\*.*?\| (\d+\.\d+\.\d+)/,
  `| 🔵 **SIZE WIZ**          | \`size_wiz.js\`  | \`npm run size\`  | Generate and manage size tokens          | ${scriptVersions.size}`
);
readmeContent = readmeContent.replace(
  /\| 🟣 \*\*SPACE WIZ\*\*.*?\| (\d+\.\d+\.\d+)/,
  `| 🟣 **SPACE WIZ**         | \`space_wiz.js\` | \`npm run space\` | Generate and manage spacing tokens       | ${scriptVersions.space}`
);
readmeContent = readmeContent.replace(
  /\| 🟢 \*\*BORDER RADIUS WIZ\*\*.*?\| (\d+\.\d+\.\d+)/,
  `| 🟢 **BORDER RADIUS WIZ** | \`radii_wiz.js\` | \`npm run radii\` | Generate and manage border radius tokens | ${scriptVersions.radii}`
);
readmeContent = readmeContent.replace(
  /\| 🔴 \*\*TYPOGRAPHY WIZ\*\*.*?\| (\d+\.\d+\.\d+)/,
  `| 🔴 **TYPOGRAPHY WIZ**    | \`typo_wiz.js\`  | \`npm run typo\`  | Generate and manage typography tokens    | ${scriptVersions.typo} 🔥`
);

// Update spell versions
readmeContent = readmeContent.replace(
  /\| \*\*MERGE SPELL\*\*.*?\| (\d+\.\d+\.\d+)/,
  `| **MERGE SPELL** | \`merge_spell.js\` | \`npm run merge\` | Combine all token files into a single unified file     | ${scriptVersions.merge} 🆙`
);
readmeContent = readmeContent.replace(
  /\| \*\*CLEAR SPELL\*\*.*?\| (\d+\.\d+\.\d+)/,
  `| **CLEAR SPELL** | \`clear_spell.js\` | \`npm run clear\` | Remove all generated output files in one swift command | ${scriptVersions.clear} 🆙`
);

// Update version sections
readmeContent = readmeContent.replace(
  /### 🎨 \*\*Color Tokens Wizard\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
  `### 🎨 **Color Tokens Wizard** ✨\n\nVersion ${scriptVersions.color}`
);
readmeContent = readmeContent.replace(
  /### 📏 \*\*Size Tokens Wizard\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
  `### 📏 **Size Tokens Wizard** ✨\n\nVersion ${scriptVersions.size}`
);
readmeContent = readmeContent.replace(
  /### 🔳 \*\*Space Tokens Wizard\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
  `### 🔳 **Space Tokens Wizard** ✨\n\nVersion ${scriptVersions.space}`
);
readmeContent = readmeContent.replace(
  /### ⭕️ \*\*Border Radius Tokens Wizard\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
  `### ⭕️ **Border Radius Tokens Wizard** ✨\n\nVersion ${scriptVersions.radii}`
);
readmeContent = readmeContent.replace(
  /### 🔤 Typography Tokens Wizard ✨\n\nVersion \d+\.\d+\.\d+/,
  `### 🔤 Typography Tokens Wizard ✨\n\nVersion ${scriptVersions.typo} 🔥`
);
readmeContent = readmeContent.replace(
  /### 🧹 \*\*Clear Spell\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
  `### 🧹 **Clear Spell** ✨\n\nVersion ${scriptVersions.clear}`
);
readmeContent = readmeContent.replace(
  /### 🪄 \*\*Merge Spell\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
  `### 🪄 **Merge Spell** ✨\n\nVersion ${scriptVersions.merge} 🆙`
);

// Write updated README.md
fs.writeFileSync(readmePath, readmeContent);

console.log('✅ README.md version numbers have been updated successfully!'); 