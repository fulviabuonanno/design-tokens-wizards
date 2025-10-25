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

// For demo: force oldVersion for all wizards to a lower value
const forcedOldVersions = {
  color: '2.8.1',
  typo: '1.2.1',
  space: '1.7.0',
  size: '1.7.0',
  radii: '1.7.0',
  clear: '1.2.1',
  merge: '1.3.0'
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
  if (!oldVersion) return '✨'; // New feature
  const [oldMajor, oldMinor, oldPatch] = oldVersion.split('.').map(Number);
  const [newMajor, newMinor, newPatch] = newVersion.split('.').map(Number);
  
  if (oldMajor !== newMajor) return '✅'; // Major update
  if (oldMinor !== newMinor) return '🌟'; // New feature
  if (oldPatch !== newPatch) return '✨'; // Minor update
  
  return ''; // No change
};

// Function to update versions in a content string
function updateVersionsInContent(content) {
  // Update versions in the tables in the correct order
  content = content.replace(
    /\| 🟡 \*\*COLOR WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: ✨|🌟|✅|🆙|🔥)?/,
    (match, oldVersion) => {
      const emoji = getVersionEmoji(forcedOldVersions.color, versions.color);
      return `| 🟡 **COLOR WIZ**         | \`color-wiz.js\` | \`npm run color\` | ${content.includes('Genera y gestiona') ? 'Genera y gestiona tokens de color' : 'Generate and manage color tokens'}         | ${versions.color}${emoji ? ' ' + emoji : ''}`;
    }
  );
  content = content.replace(
    /\| 🔴 \*\*TYPOGRAPHY WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: ✨|🌟|✅|🆙|🔥)?/,
    (match, oldVersion) => {
      const emoji = getVersionEmoji(forcedOldVersions.typo || oldVersion, versions.typo);
      return `| 🔴 **TYPOGRAPHY WIZ**    | \`typo_wiz.js\`  | \`npm run typo\`  | ${content.includes('Genera y gestiona') ? 'Genera y gestiona tokens de tipografía' : 'Generate and manage typography tokens'}    | ${versions.typo}${emoji ? ' ' + emoji : ''}`;
    }
  );
  content = content.replace(
    /\| 🟣 \*\*SPACE WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: ✨|🌟|✅|🆙|🔥)?/,
    (match, oldVersion) => {
      const emoji = getVersionEmoji(forcedOldVersions.space || oldVersion, versions.space);
      return `| 🟣 **SPACE WIZ**         | \`space_wiz.js\` | \`npm run space\` | ${content.includes('Genera y gestiona') ? 'Genera y gestiona tokens de espaciado' : 'Generate and manage spacing tokens'}       | ${versions.space}${emoji ? ' ' + emoji : ''}`;
    }
  );
  content = content.replace(
    /\| 🔵 \*\*SIZE WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: ✨|🌟|✅|🆙|🔥)?/,
    (match, oldVersion) => {
      const emoji = getVersionEmoji(forcedOldVersions.size || oldVersion, versions.size);
      return `| 🔵 **SIZE WIZ**          | \`size_wiz.js\`  | \`npm run size\`  | ${content.includes('Genera y gestiona') ? 'Genera y gestiona tokens de tamaño' : 'Generate and manage size tokens'}          | ${versions.size}${emoji ? ' ' + emoji : ''}`;
    }
  );
  content = content.replace(
    /\| 🟢 \*\*BORDER RADIUS WIZ\*\*.*?\| (\d+\.\d+\.\d+)(?: ✨|🌟|✅|🆙|🔥)?/,
    (match, oldVersion) => {
      const emoji = getVersionEmoji(forcedOldVersions.radii || oldVersion, versions.radii);
      return `| 🟢 **BORDER RADIUS WIZ** | \`radii_wiz.js\` | \`npm run radii\` | ${content.includes('Genera y gestiona') ? 'Genera y gestiona tokens de radio' : 'Generate and manage border radius tokens'} | ${versions.radii}${emoji ? ' ' + emoji : ''}`;
    }
  );

  // Update spell versions in tables
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
    /## 🎨 \*\*Color Tokens Wizard\*\*\n\nVersion \d+\.\d+\.\d+/,
    `## 🎨 **Color Tokens Wizard**\n\nVersion ${versions.color}`
  );
  content = content.replace(
    /## 📏 \*\*Size Tokens Wizard\*\*\n\nVersion \d+\.\d+\.\d+/,
    `## 📏 **Size Tokens Wizard**\n\nVersion ${versions.size}`
  );
  content = content.replace(
    /## 🔳 \*\*Space Tokens Wizard\*\*\n\nVersion \d+\.\d+\.\d+/,
    `## 🔳 **Space Tokens Wizard**\n\nVersion ${versions.space}`
  );
  content = content.replace(
    /## 🔲 \*\*Border Radius Tokens Wizard\*\*\n\nVersion \d+\.\d+\.\d+/,
    `## 🔲 **Border Radius Tokens Wizard**\n\nVersion ${versions.radii}`
  );
  content = content.replace(
    /## 🔤 \*\*Typography Tokens Wizard\*\*\n\nVersion \d+\.\d+\.\d+/,
    `## 🔤 **Typography Tokens Wizard**\n\nVersion ${versions.typo}`
  );
  content = content.replace(
    /## 🧹 \*\*Clear Tokens Spell\*\*\n\nVersion \d+\.\d+\.\d+/,
    `## 🧹 **Clear Tokens Spell**\n\nVersion ${versions.clear}`
  );
  content = content.replace(
    /### 🔄 \*\*Merge Tokens Spell\*\*\n\nVersion \d+\.\d+\.\d+/,
    `### 🔄 **Merge Tokens Spell**\n\nVersion ${versions.merge}`
  );

  // Update Spanish version sections
  content = content.replace(
    /## 🎨 \*\*Maguito de Tokens de Color\*\*\n\nVersión \d+\.\d+\.\d+/,
    `## 🎨 **Maguito de Tokens de Color**\n\nVersión ${versions.color}`
  );
  content = content.replace(
    /## 📏 \*\*Maguito de Tokens de Tamaño\*\*\n\nVersión \d+\.\d+\.\d+/,
    `## 📏 **Maguito de Tokens de Tamaño**\n\nVersión ${versions.size}`
  );
  content = content.replace(
    /## 🔳 \*\*Maguito de Tokens de Espaciado\*\*\n\nVersión \d+\.\d+\.\d+/,
    `## 🔳 **Maguito de Tokens de Espaciado**\n\nVersión ${versions.space}`
  );
  content = content.replace(
    /## 🔲 \*\*Maguito de Tokens de Radio de Borde\*\*\n\nVersión \d+\.\d+\.\d+/,
    `## 🔲 **Maguito de Tokens de Radio de Borde**\n\nVersión ${versions.radii}`
  );
  content = content.replace(
    /## 🔤 \*\*Maguito de Tokens de Tipografía\*\*\n\nVersión \d+\.\d+\.\d+/,
    `## 🔤 **Maguito de Tokens de Tipografía**\n\nVersión ${versions.typo}`
  );
  content = content.replace(
    /## 🧹 \*\*Hechizo de Limpieza de Tokens\*\*\n\nVersión \d+\.\d+\.\d+/,
    `## 🧹 **Hechizo de Limpieza de Tokens**\n\nVersión ${versions.clear}`
  );
  content = content.replace(
    /## 🔄 \*\*Hechizo de Fusión de Tokens\*\*\n\nVersión \d+\.\d+\.\d+/,
    `## 🔄 **Hechizo de Fusión de Tokens**\n\nVersión ${versions.merge}`
  );

  // Update legends to use correct emojis
  content = content.replace(
    /Legend:\s*\n✅ Patch \/\/ 🔥 Minor Change \/\/ 🆙 Major Change/,
    'Legend:\n✨ Patch // 🌟 Minor Change // ✅ Major Change'
  );
  content = content.replace(
    /Leyenda:\s*\n✨ Parche \/\/ 🌟 Cambio Menor \/\/ ✅ Cambio Mayor/,
    'Leyenda:\n✨ Parche // 🌟 Cambio Menor // ✅ Cambio Mayor'
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

// Generate and update badges
console.log('\n🎨 Generating version badges...');

// Color mapping for each wizard (matching the emoji colors)
const colorMap = {
  color: 'yellow',
  typo: 'red',
  space: 'blueviolet',
  size: 'blue',
  radii: 'green',
  merge: 'orange',
  clear: 'lightgrey'
};

// Generate shield.io badge URL
function generateBadge(name, version, color) {
  return `https://img.shields.io/badge/${encodeURIComponent(name)}-v${version}-${color}`;
}

// Generate badges markdown
const badges = {
  color: `![Color Wizard](${generateBadge('Color Wiz', versions.color, colorMap.color)})`,
  typo: `![Typography Wizard](${generateBadge('Typography Wiz', versions.typo, colorMap.typo)})`,
  space: `![Space Wizard](${generateBadge('Space Wiz', versions.space, colorMap.space)})`,
  size: `![Size Wizard](${generateBadge('Size Wiz', versions.size, colorMap.size)})`,
  radii: `![Border Radius Wizard](${generateBadge('Border Radius Wiz', versions.radii, colorMap.radii)})`,
  merge: `![Merge Spell](${generateBadge('Merge Spell', versions.merge, colorMap.merge)})`,
  clear: `![Clear Spell](${generateBadge('Clear Spell', versions.clear, colorMap.clear)})`
};

// Function to update README with badges
function updateReadmeWithBadges(content, isSpanish = false) {
  // Update badges in wizards table
  if (isSpanish) {
    content = content.replace(
      /(\| 🟡 \*\*COLOR WIZ\*\*\s+\| `color-wiz\.js`\s+\| `npm run color`\s+\| Genera y gestiona tokens de color\s+(?:\| [^|]+ )?\|) !\[Color Wizard\]\([^)]+\) \|/,
      `$1 ${badges.color} |`
    );
    content = content.replace(
      /(\| 🔴 \*\*TYPOGRAPHY WIZ\*\*\s+\| `typo_wiz\.js`\s+\| `npm run typo`\s+\| Genera y gestiona tokens de tipografía\s+(?:\| [^|]+ )?\|) !\[Typography Wizard\]\([^)]+\) \|/,
      `$1 ${badges.typo} |`
    );
    content = content.replace(
      /(\| 🟣 \*\*SPACE WIZ\*\*\s+\| `space_wiz\.js`\s+\| `npm run space`\s+\| Genera y gestiona tokens de espaciado\s+(?:\| [^|]+ )?\|) !\[Space Wizard\]\([^)]+\) \|/,
      `$1 ${badges.space} |`
    );
    content = content.replace(
      /(\| 🔵 \*\*SIZE WIZ\*\*\s+\| `size_wiz\.js`\s+\| `npm run size`\s+\| Genera y gestiona tokens de tamaño\s+(?:\| [^|]+ )?\|) !\[Size Wizard\]\([^)]+\) \|/,
      `$1 ${badges.size} |`
    );
    content = content.replace(
      /(\| 🟢 \*\*BORDER RADIUS WIZ\*\*\s+\| `radii_wiz\.js`\s+\| `npm run radii`\s+\| Genera y gestiona tokens de radio\s+(?:\| [^|]+ )?\|) !\[Border Radius Wizard\]\([^)]+\) \|/,
      `$1 ${badges.radii} |`
    );
    content = content.replace(
      /(\| \*\*MERGE SPELL\*\*\s+\| `merge_spell\.js`\s+\| `npm run merge`\s+\| Combina todos los archivos de tokens en uno solo\s+(?:\| [^|]+ )?\|) !\[Merge Spell\]\([^)]+\) \|/,
      `$1 ${badges.merge} |`
    );
    content = content.replace(
      /(\| \*\*CLEAR SPELL\*\*\s+\| `clear_spell\.js`\s+\| `npm run clear`\s+\| Elimina todos los archivos generados de una vez\s+(?:\| [^|]+ )?\|) !\[Clear Spell\]\([^)]+\) \|/,
      `$1 ${badges.clear} |`
    );
  } else {
    content = content.replace(
      /(\| 🟡 \*\*COLOR WIZ\*\*\s+\| `color-wiz\.js`\s+\| `npm run color`\s+\| Generate and manage color tokens\s+(?:\| [^|]+ )?\|) !\[Color Wizard\]\([^)]+\) \|/,
      `$1 ${badges.color} |`
    );
    content = content.replace(
      /(\| 🔴 \*\*TYPOGRAPHY WIZ\*\*\s+\| `typo_wiz\.js`\s+\| `npm run typo`\s+\| Generate and manage typography tokens\s+(?:\| [^|]+ )?\|) !\[Typography Wizard\]\([^)]+\) \|/,
      `$1 ${badges.typo} |`
    );
    content = content.replace(
      /(\| 🟣 \*\*SPACE WIZ\*\*\s+\| `space_wiz\.js`\s+\| `npm run space`\s+\| Generate and manage spacing tokens\s+(?:\| [^|]+ )?\|) !\[Space Wizard\]\([^)]+\) \|/,
      `$1 ${badges.space} |`
    );
    content = content.replace(
      /(\| 🔵 \*\*SIZE WIZ\*\*\s+\| `size_wiz\.js`\s+\| `npm run size`\s+\| Generate and manage size tokens\s+(?:\| [^|]+ )?\|) !\[Size Wizard\]\([^)]+\) \|/,
      `$1 ${badges.size} |`
    );
    content = content.replace(
      /(\| 🟢 \*\*BORDER RADIUS WIZ\*\*\s+\| `radii_wiz\.js`\s+\| `npm run radii`\s+\| Generate and manage border radius tokens\s+(?:\| [^|]+ )?\|) !\[Border Radius Wizard\]\([^)]+\) \|/,
      `$1 ${badges.radii} |`
    );
    content = content.replace(
      /(\| \*\*MERGE SPELL\*\*\s+\| `merge_spell\.js`\s+\| `npm run merge`\s+\| Combine all token files into a single unified file\s+(?:\| [^|]+ )?\|) !\[Merge Spell\]\([^)]+\) \|/,
      `$1 ${badges.merge} |`
    );
    content = content.replace(
      /(\| \*\*CLEAR SPELL\*\*\s+\| `clear_spell\.js`\s+\| `npm run clear`\s+\| Remove all generated output files in one swift command\s+(?:\| [^|]+ )?\|) !\[Clear Spell\]\([^)]+\) \|/,
      `$1 ${badges.clear} |`
    );
  }

  return content;
}

// Re-read and update with badges
readmeContent = fs.readFileSync(readmePath, 'utf8');
readmeEsContent = fs.readFileSync(readmeEsPath, 'utf8');

readmeContent = updateReadmeWithBadges(readmeContent, false);
readmeEsContent = updateReadmeWithBadges(readmeEsContent, true);

// Write updated README files with badges
fs.writeFileSync(readmePath, readmeContent);
fs.writeFileSync(readmeEsPath, readmeEsContent);

console.log('✅ Version badges have been updated successfully!');

// Update documentation files with badges
console.log('\n📚 Updating documentation files with version badges...');

const docsPath = path.join(__dirname, '..', '..', 'docs');
const docFiles = {
  en: {
    'color-wizard.md': { version: versions.color, badge: badges.color, name: 'Color Tokens Wizard' },
    'typography-wizard.md': { version: versions.typo, badge: badges.typo, name: 'Typography Tokens Wizard' },
    'space-wizard.md': { version: versions.space, badge: badges.space, name: 'Space Tokens Wizard' },
    'size-wizard.md': { version: versions.size, badge: badges.size, name: 'Size Tokens Wizard' },
    'border-radius-wizard.md': { version: versions.radii, badge: badges.radii, name: 'Border Radius Tokens Wizard' },
    'merge-spell.md': { version: versions.merge, badge: badges.merge, name: 'Merge Tokens Spell' },
    'clear-spell.md': { version: versions.clear, badge: badges.clear, name: 'Clear Tokens Spell' }
  },
  es: {
    'color-wizard.md': { version: versions.color, badge: badges.color, name: 'Maguito de Tokens de Color' },
    'typography-wizard.md': { version: versions.typo, badge: badges.typo, name: 'Maguito de Tokens de Tipografía' },
    'space-wizard.md': { version: versions.space, badge: badges.space, name: 'Maguito de Tokens de Espaciado' },
    'size-wizard.md': { version: versions.size, badge: badges.size, name: 'Maguito de Tokens de Tamaño' },
    'border-radius-wizard.md': { version: versions.radii, badge: badges.radii, name: 'Maguito de Tokens de Radio de Borde' },
    'merge-spell.md': { version: versions.merge, badge: badges.merge, name: 'Hechizo de Fusión de Tokens' },
    'clear-spell.md': { version: versions.clear, badge: badges.clear, name: 'Hechizo de Limpieza de Tokens' }
  }
};

function updateDocFile(filePath, fileInfo, isSpanish = false) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const versionLabel = isSpanish ? 'Versión' : 'Version';

  // First, remove any existing badges to prevent duplicates
  content = content.replace(/!\[.*?\]\(https:\/\/img\.shields\.io\/badge\/.*?\)\n*/g, '');

  // Remove the "Version X.X.X" text line if it exists
  const versionTextRegex = new RegExp(`${versionLabel} \\d+\\.\\d+\\.\\d+\\n*`, 'g');
  content = content.replace(versionTextRegex, '');

  // Add badge after the image tag
  const titleWithImageRegex = /^(## .+\*\*\n\n<img[^>]+>\n\n)/m;
  if (titleWithImageRegex.test(content)) {
    content = content.replace(
      titleWithImageRegex,
      `$1${fileInfo.badge}\n\n`
    );
  }

  fs.writeFileSync(filePath, content);
}

// Update English docs
Object.entries(docFiles.en).forEach(([filename, fileInfo]) => {
  const filePath = path.join(docsPath, 'en', filename);
  updateDocFile(filePath, fileInfo, false);
});

// Update Spanish docs
Object.entries(docFiles.es).forEach(([filename, fileInfo]) => {
  const filePath = path.join(docsPath, 'es', filename);
  updateDocFile(filePath, fileInfo, true);
});

console.log('✅ Documentation files have been updated with version badges!');

// Update CHANGELOG.md with version badges
console.log('\n📋 Updating CHANGELOG.md with version badges...');

const changelogPath = path.join(__dirname, '..', '..', 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  let changelogContent = fs.readFileSync(changelogPath, 'utf8');

  // Update the version table with badges (3-column table: Wizard/Spell | Version | Last Updated)
  changelogContent = changelogContent.replace(
    /\| 🎨 Color Wizard\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 🎨 Color Wizard         | ${versions.color} ${badges.color} |$1|`
  );
  changelogContent = changelogContent.replace(
    /\| 🔤 Typography Wizard\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 🔤 Typography Wizard    | ${versions.typo} ${badges.typo}   |$1|`
  );
  changelogContent = changelogContent.replace(
    /\| 🔳 Space Wizard\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 🔳 Space Wizard         | ${versions.space} ${badges.space} |$1|`
  );
  changelogContent = changelogContent.replace(
    /\| 📏 Size Wizard\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 📏 Size Wizard          | ${versions.size} ${badges.size}   |$1|`
  );
  changelogContent = changelogContent.replace(
    /\| 🔲 Border Radius Wizard\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 🔲 Border Radius Wizard | ${versions.radii} ${badges.radii} |$1|`
  );
  changelogContent = changelogContent.replace(
    /\| 🔄 Merge Spell\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 🔄 Merge Spell          | ${versions.merge} ${badges.merge} |$1|`
  );
  changelogContent = changelogContent.replace(
    /\| 🧹 Clear Spell\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 🧹 Clear Spell          | ${versions.clear} ${badges.clear} |$1|`
  );

  fs.writeFileSync(changelogPath, changelogContent);
  console.log('✅ CHANGELOG.md updated with version badges!');
}

// Update RELEASE.md with version badges and current repo version
console.log('\n🎉 Updating RELEASE.md with version information...');

const releasePath = path.join(__dirname, '..', 'RELEASE.md');
if (fs.existsSync(releasePath)) {
  let releaseContent = fs.readFileSync(releasePath, 'utf8');

  // Update package version in title
  releaseContent = releaseContent.replace(
    /# 🎉 Release Notes - Design Tokens Wizards v\d+\.\d+\.\d+/,
    `# 🎉 Release Notes - Design Tokens Wizards v${packageJson.version}`
  );

  // Update the Component Versions table with badges (3-column table: Component | Version | Type)
  releaseContent = releaseContent.replace(
    /\| 🎨 Color Wizard\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 🎨 Color Wizard         | ${versions.color} ${badges.color} |$1|`
  );
  releaseContent = releaseContent.replace(
    /\| 🔤 Typography Wizard\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 🔤 Typography Wizard    | ${versions.typo} ${badges.typo}   |$1|`
  );
  releaseContent = releaseContent.replace(
    /\| 🔳 Space Wizard\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 🔳 Space Wizard         | ${versions.space} ${badges.space} |$1|`
  );
  releaseContent = releaseContent.replace(
    /\| 📏 Size Wizard\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 📏 Size Wizard          | ${versions.size} ${badges.size}   |$1|`
  );
  releaseContent = releaseContent.replace(
    /\| 🔲 Border Radius Wizard\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 🔲 Border Radius Wizard | ${versions.radii} ${badges.radii} |$1|`
  );
  releaseContent = releaseContent.replace(
    /\| 🔄 Merge Spell\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 🔄 Merge Spell          | ${versions.merge} ${badges.merge} |$1|`
  );
  releaseContent = releaseContent.replace(
    /\| 🧹 Clear Spell\s+\| [\d\.\s]+.*?\|([^|]+)\|/,
    `| 🧹 Clear Spell          | ${versions.clear} ${badges.clear} |$1|`
  );

  fs.writeFileSync(releasePath, releaseContent);
  console.log('✅ RELEASE.md updated with version information!');
}

// Update DEVELOPER_SETUP.md with version management info
console.log('\n🛠️  Updating DEVELOPER_SETUP.md...');

const devSetupPath = path.join(__dirname, '..', 'DEVELOPER_SETUP.md');
if (fs.existsSync(devSetupPath)) {
  let devSetupContent = fs.readFileSync(devSetupPath, 'utf8');

  // Update version management section
  const versionManagementSection = `## Version Management

To update version numbers across all wizards and documentation:

\`\`\`bash
npm run update
\`\`\`

This runs \`.github/config/update_versions.js\` which:
- Synchronizes version numbers from \`package.json\` scriptVersions
- Updates README files (English and Spanish) with version badges
- Updates all wizard documentation files (14 files total)
- Updates CHANGELOG.md with current versions and badges
- Updates RELEASE.md with current package and wizard versions
- Generates color-coded shields.io badges for each wizard

**Current Versions:**
- Package: v${packageJson.version}
- Color Wizard: v${versions.color}
- Typography Wizard: v${versions.typo}
- Space Wizard: v${versions.space}
- Size Wizard: v${versions.size}
- Border Radius Wizard: v${versions.radii}
- Merge Spell: v${versions.merge}
- Clear Spell: v${versions.clear}`;

  devSetupContent = devSetupContent.replace(
    /## Version Management[\s\S]*?(?=\n## |$)/,
    versionManagementSection + '\n\n'
  );

  fs.writeFileSync(devSetupPath, devSetupContent);
  console.log('✅ DEVELOPER_SETUP.md updated!');
}

console.log('\n✨ All version updates completed successfully!'); 