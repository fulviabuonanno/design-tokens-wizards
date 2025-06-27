import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'));

// Get versions from scriptVersions
const versions = {
  color: packageJson.scriptVersions.color,
  typo: packageJson.scriptVersions.typo,
  space: packageJson.scriptVersions.space,
  size: packageJson.scriptVersions.size,    
  radii: packageJson.scriptVersions.radii,
  clear: packageJson.scriptVersions.clear,
  merge: packageJson.scriptVersions.merge
};

// Validate versions
Object.entries(versions).forEach(([key, version]) => {
  if (!version) {
    console.error(`❌ Error: Could not find version for ${key} in scriptVersions`);
    process.exit(1);
  }
});

console.log('📦 Using versions from scriptVersions:', versions);

// Read README.md
const readmePath = path.join(__dirname, '..', '..', 'README.md');
const readmeEsPath = path.join(__dirname, '..', '..', 'README.es.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');
let readmeEsContent = fs.readFileSync(readmeEsPath, 'utf8');

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

// Function to update versions in a content string
function updateVersionsInContent(content) {
  // Update versions in the tables in the correct order
  content = content.replace(
    /\| 🟡 \*\*COLOR WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
    (match, oldVersion) => {
      const emoji = getVersionEmoji(oldVersion, versions.color);
      return `| 🟡 **COLOR WIZ**         | \`color-wiz.js\` | \`npm run color\` | ${content.includes('Genera y gestiona') ? 'Genera y gestiona tokens de color' : 'Generate and manage color tokens'}         | ${versions.color}${emoji ? ' ' + emoji : ''}`;
    }
  );
  content = content.replace(
    /\| 🔴 \*\*TYPOGRAPHY WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
    (match, oldVersion) => {
      const emoji = getVersionEmoji(oldVersion, versions.typo);
      return `| 🔴 **TYPOGRAPHY WIZ**    | \`typo_wiz.js\`  | \`npm run typo\`  | ${content.includes('Genera y gestiona') ? 'Genera y gestiona tokens de tipografía' : 'Generate and manage typography tokens'}    | ${versions.typo}${emoji ? ' ' + emoji : ''}`;
    }
  );
  content = content.replace(
    /\| 🟣 \*\*SPACE WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
    (match, oldVersion) => {
      const emoji = getVersionEmoji(oldVersion, versions.space);
      return `| 🟣 **SPACE WIZ**         | \`space_wiz.js\` | \`npm run space\` | ${content.includes('Genera y gestiona') ? 'Genera y gestiona tokens de espaciado' : 'Generate and manage spacing tokens'}       | ${versions.space}${emoji ? ' ' + emoji : ''}`;
    }
  );
  content = content.replace(
    /\| 🔵 \*\*SIZE WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
    (match, oldVersion) => {
      const emoji = getVersionEmoji(oldVersion, versions.size);
      return `| 🔵 **SIZE WIZ**          | \`size_wiz.js\`  | \`npm run size\`  | ${content.includes('Genera y gestiona') ? 'Genera y gestiona tokens de tamaño' : 'Generate and manage size tokens'}          | ${versions.size}${emoji ? ' ' + emoji : ''}`;
    }
  );
  content = content.replace(
    /\| 🟢 \*\*BORDER RADIUS WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
    (match, oldVersion) => {
      const emoji = getVersionEmoji(oldVersion, versions.radii);
      return `| 🟢 **BORDER RADIUS WIZ** | \`radii_wiz.js\` | \`npm run radii\` | ${content.includes('Genera y gestiona') ? 'Genera y gestiona tokens de radio' : 'Generate and manage border radius tokens'} | ${versions.radii}${emoji ? ' ' + emoji : ''}`;
    }
  );

  // Update spell versions
  content = content.replace(
    /\| \*\*MERGE SPELL\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
    (match, oldVersion) => {
      const emoji = getVersionEmoji(oldVersion, versions.merge);
      return `| **MERGE SPELL** | \`merge_spell.js\` | \`npm run merge\` | ${content.includes('Combina todos') ? 'Combina todos los archivos de tokens en uno solo' : 'Combine all token files into a single unified file'}     | ${versions.merge}${emoji ? ' ' + emoji : ''}`;
    }
  );
  content = content.replace(
    /\| \*\*CLEAR SPELL\*\*.*?\| (\d+\.\d+\.\d+)(?: 🔥|🆙|✅)?/,
    (match, oldVersion) => {
      const emoji = getVersionEmoji(oldVersion, versions.clear);
      return `| **CLEAR SPELL** | \`clear_spell.js\` | \`npm run clear\` | ${content.includes('Elimina todos') ? 'Elimina todos los archivos generados de una vez' : 'Remove all generated output files in one swift command'} | ${versions.clear}${emoji ? ' ' + emoji : ''}`;
    }
  );

  // Update version sections with proper formatting
  content = content.replace(
    /## 🎨 \*\*Color Tokens Wizard\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
    `## 🎨 **Color Tokens Wizard** ✨\n\nVersion ${versions.color}`
  );
  content = content.replace(
    /### 📏 \*\*Size Tokens Wizard\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
    `### 📏 **Size Tokens Wizard** ✨\n\nVersion ${versions.size}`
  );
  content = content.replace(
    /### 🔳 \*\*Space Tokens Wizard\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
    `### 🔳 **Space Tokens Wizard** ✨\n\nVersion ${versions.space}`
  );
  content = content.replace(
    /### ⭕️ \*\*Border Radius Tokens Wizard\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
    `### ⭕️ **Border Radius Tokens Wizard** ✨\n\nVersion ${versions.radii}`
  );
  content = content.replace(
    /### 🔤 Typography Tokens Wizard ✨\n\nVersion \d+\.\d+\.\d+/,
    `### 🔤 Typography Tokens Wizard ✨\n\nVersion ${versions.typo}`
  );
  content = content.replace(
    /### 🧹 \*\*Clear Spell\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
    `### 🧹 **Clear Spell** ✨\n\nVersion ${versions.clear}`
  );
  content = content.replace(
    /### 🪄 \*\*Merge Spell\*\* ✨\n\nVersion \d+\.\d+\.\d+/,
    `### 🪄 **Merge Spell** ✨\n\nVersion ${versions.merge}`
  );

  // Additional check for any remaining version mentions in the content
  content = content.replace(
    /Version \d+\.\d+\.\d+(?!\s*\|)/g,
    (match) => {
      const version = match.split(' ')[1];
      const key = Object.entries(versions).find(([_, v]) => v === version)?.[0];
      if (key) return match;
      return `Version ${versions.size}`; // Default to size version if no match found
    }
  );

  return content;
}

// Update both README files
readmeContent = updateVersionsInContent(readmeContent);
readmeEsContent = updateVersionsInContent(readmeEsContent);

// Write updated README files
fs.writeFileSync(readmePath, readmeContent);
fs.writeFileSync(readmeEsPath, readmeEsContent);

console.log('✅ README.md and README.es.md version numbers have been updated successfully!'); 