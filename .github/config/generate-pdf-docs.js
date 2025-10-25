#!/usr/bin/env node

/**
 * PDF Documentation Generator
 * This script merges the main README with all individual wizard/spell documentation
 * to create comprehensive PDF guides in English and Spanish.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Configuration
const config = {
  en: {
    readme: path.join(rootDir, 'README.md'),
    docsDir: path.join(rootDir, 'docs/en'),
    output: path.join(rootDir, 'temp_README_full.md'),
    pdfOutput: 'Instructions.pdf',
    sections: [
      { file: 'color-wizard.md', title: '🎨 Color Tokens Wizard - Detailed Guide' },
      { file: 'typography-wizard.md', title: '🔤 Typography Tokens Wizard - Detailed Guide' },
      { file: 'space-wizard.md', title: '🔳 Space Tokens Wizard - Detailed Guide' },
      { file: 'size-wizard.md', title: '📏 Size Tokens Wizard - Detailed Guide' },
      { file: 'border-radius-wizard.md', title: '🔲 Border Radius Tokens Wizard - Detailed Guide' },
      { file: 'clear-spell.md', title: '🧹 Clear Tokens Spell - Detailed Guide' },
      { file: 'merge-spell.md', title: '🔄 Merge Tokens Spell - Detailed Guide' }
    ]
  },
  es: {
    readme: path.join(rootDir, 'README.es.md'),
    docsDir: path.join(rootDir, 'docs/es'),
    output: path.join(rootDir, 'temp_README_full.es.md'),
    pdfOutput: 'Instrucciones.pdf',
    sections: [
      { file: 'color-wizard.md', title: '🎨 Maguito de Tokens de Color - Guía Detallada' },
      { file: 'typography-wizard.md', title: '🔤 Maguito de Tokens de Tipografía - Guía Detallada' },
      { file: 'space-wizard.md', title: '🔳 Maguito de Tokens de Espaciado - Guía Detallada' },
      { file: 'size-wizard.md', title: '📏 Maguito de Tokens de Tamaño - Guía Detallada' },
      { file: 'border-radius-wizard.md', title: '🔲 Maguito de Tokens de Radio de Borde - Guía Detallada' },
      { file: 'clear-spell.md', title: '🧹 Hechizo de Limpieza de Tokens - Guía Detallada' },
      { file: 'merge-spell.md', title: '🔄 Hechizo de Fusión de Tokens - Guía Detallada' }
    ]
  }
};

/**
 * Reads and processes a markdown file
 * @param {string} filePath - Path to the markdown file
 * @returns {string} - File content
 */
function readMarkdownFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: File not found: ${filePath}`);
    return '';
  }
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Merges README with all documentation files
 * @param {string} lang - Language code ('en' or 'es')
 */
function generateMergedMarkdown(lang) {
  const langConfig = config[lang];
  console.log(`\nGenerating merged markdown for ${lang.toUpperCase()}...`);

  let mergedContent = '';

  // Read main README
  console.log(`  Reading ${path.basename(langConfig.readme)}...`);
  const readmeContent = readMarkdownFile(langConfig.readme);
  mergedContent += readmeContent;

  // Add page break and detailed documentation section
  mergedContent += '\n\n---\n\n';
  mergedContent += '# 📚 Detailed Documentation\n\n';
  mergedContent += lang === 'en'
    ? 'This section provides comprehensive guides for each wizard and spell.\n\n'
    : 'Esta sección proporciona guías completas para cada maguito y hechizo.\n\n';

  // Append each documentation file
  langConfig.sections.forEach(section => {
    const filePath = path.join(langConfig.docsDir, section.file);
    console.log(`  Adding ${section.file}...`);

    const content = readMarkdownFile(filePath);
    if (content) {
      mergedContent += `\n\n---\n\n# ${section.title}\n\n`;

      // Remove the first heading from the content if it exists (to avoid duplicate titles)
      const contentWithoutFirstHeading = content.replace(/^#\s+.*\n\n/, '');
      mergedContent += contentWithoutFirstHeading;
    }
  });

  // Write merged markdown file
  fs.writeFileSync(langConfig.output, mergedContent, 'utf-8');
  console.log(`  ✓ Created: ${path.basename(langConfig.output)}`);

  return langConfig.output;
}

/**
 * Main execution
 */
function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  PDF Documentation Generator               ║');
  console.log('║  Merging README + Detailed Documentation   ║');
  console.log('╚════════════════════════════════════════════╝');

  try {
    // Generate merged markdown for both languages
    const enFile = generateMergedMarkdown('en');
    const esFile = generateMergedMarkdown('es');

    console.log('\n✓ Merged markdown files created successfully!');
    console.log('\nNext steps:');
    console.log('  1. Run md-to-pdf to convert these files to PDFs');
    console.log('  2. Move PDFs to docs/pdf/ directory');
    console.log('  3. Clean up temporary markdown files');
    console.log('\nFiles ready for PDF conversion:');
    console.log(`  - ${path.basename(enFile)}`);
    console.log(`  - ${path.basename(esFile)}`);

  } catch (error) {
    console.error('\n✗ Error generating merged markdown:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
