import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Table from 'cli-table3';
import puppeteer from 'puppeteer';

async function showLoader(message, duration) {
  console.log(message);
  return new Promise(resolve => setTimeout(resolve, duration));
}

const versionArg = process.argv.find(arg => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Typography Tokens Wizard - Version ${version}`));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function showAccessibilityNotes(propertyType) {
  const { showNotes } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'showNotes',
      message: '📝 Would you like to see ' + chalk.underline('accessibility guidelines') + ' for this typography property?',
      default: false
    }
  ]);

  console.log(chalk.bold.bgRedBright("\n========================================\n"));

  if (showNotes) {
    console.log(''); 
    switch (propertyType) {
      case 'fontFamily':
        console.log(chalk.bold.yellow("⚠️ ACCESSIBILITY NOTE ABOUT FONT FAMILIES:"));
        console.log(chalk.yellow("For optimal readability and :"));
        console.log(chalk.yellow("• Choose fonts with clear letterforms and good character distinction"));
        console.log(chalk.yellow("• Sans-serif fonts are generally more readable on screens"));
        console.log(chalk.yellow("• Ensure fonts support all required characters and languages"));
        console.log(chalk.yellow("• Some users may override your font choices with their system fonts"));
        console.log(chalk.yellow("• Always provide at least one system font fallback"));
        console.log(chalk.yellow("• Consider using system font stacks for better performance"));
        console.log(chalk.yellow("• Dyslexia-friendly fonts: ") + chalk.underline("OpenDyslexic, Lexia Readable, Comic Sans MS"));
        console.log(chalk.yellow("• Avoid using more than 2-3 different font families in your design"));
        break;
      
      case 'fontSize':
        console.log(chalk.bold.yellow("⚠️ ACCESSIBILITY NOTE ABOUT FONT SIZES:"));
        console.log(chalk.yellow("For optimal readability and accessibility:"));
        console.log(chalk.yellow("• Body text should ideally be at least 16px"));
        console.log(chalk.yellow("• Text smaller than 12px should be avoided in most cases"));
        console.log(chalk.yellow("• Small font sizes should only be used for supplementary content"));
        console.log(chalk.yellow("• Consider users with visual impairments when defining your scale"));
        break;
      
      case 'fontWeight':
        console.log(chalk.bold.yellow("⚠️  ACCESSIBILITY NOTE ABOUT FONT WEIGHTS:"));
        console.log(chalk.yellow("For optimal readability and accessibility:"));
        console.log(chalk.yellow("• Ensure sufficient contrast between text and background"));
        console.log(chalk.yellow("• Body text should be at least 400 (regular) weight"));
        console.log(chalk.yellow("• Avoid using font weights below 400 for main content"));
        console.log(chalk.yellow("• Headers typically benefit from weights of 600 or higher"));
        console.log(chalk.yellow("• Not all fonts support all weight values"));
        console.log(chalk.yellow("• Test font weights across different browsers and devices"));
        break;
      
      case 'letterSpacing':
        console.log(chalk.bold.yellow("⚠️  ACCESSIBILITY NOTE ABOUT LETTER SPACING:"));
        console.log(chalk.yellow("For optimal readability and accessibility:"));
        console.log(chalk.yellow("• Avoid extreme letter spacing values that could harm readability"));
        console.log(chalk.yellow("• Body text should maintain normal letter spacing (0) or very subtle adjustments"));
        console.log(chalk.yellow("• Decorative text (headings, display) can have more pronounced spacing"));
        console.log(chalk.yellow("• Users with dyslexia may struggle with increased letter spacing"));
        console.log(chalk.yellow("• Ensure sufficient contrast and clear letterforms remain visible"));
        break;
      
      case 'lineHeight':
        console.log(chalk.bold.yellow("⚠️  ACCESSIBILITY NOTE ABOUT LINE HEIGHT:"));
        console.log(chalk.yellow("For optimal readability and accessibility:"));
        console.log(chalk.yellow("• Body text should have a minimum line height of 1.5"));
        console.log(chalk.yellow("• Headings should have a minimum line height of 1.3"));
        console.log(chalk.yellow("• Line height should increase as line length increases"));
        console.log(chalk.yellow("• Users with dyslexia or visual impairments benefit from increased line spacing"));
        console.log(chalk.yellow("• Avoid line heights below 1.2 as they can reduce readability"));
        console.log(chalk.yellow("• WCAG 2.2 Success Criterion 1.4.12 requires adjustable line spacing up to 1.5"));
        break;
    }
    console.log(''); 
  }
}

async function generateAccessibilityReport(selectedProperties, tokens, outputsDir) {
  const reportsDir = path.join(outputsDir, "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const pdfPath = path.join(reportsDir, "a11y-typography-guidelines.pdf");
  
  // Read and encode the banner image
  const bannerPath = path.join(__dirname, '..', 'assets', 'banner.png');
  const bannerBase64 = fs.readFileSync(bannerPath, { encoding: 'base64' });
  
  // HTML template with CSS styling
  /*
  let styles = `
    <style>
      body {
        font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        line-height: 1.2;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      .banner {
        width: 100%;
        max-width: 800px;
        margin-bottom: 30px;
        display: block;
      }
      h1 {
        font-family: 'Instrument Sans', Arial, sans-serif;
        font-size: 24px;
        font-weight: 600;
        color: #1a1a1a;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 10px;
        margin-bottom: 30px;
      }
      h2 {
        font-family: 'Instrument Sans', Arial, sans-serif;
        font-size: 20px;
        font-weight: 500;
        color: #2c3e50;
        margin-top: 30px;
        margin-bottom: 15px;
      }
      h3 {
        font-family: 'Instrument Sans', Arial, sans-serif;
        font-size: 18px;
        font-weight: 500;
        color: #34495e;
        margin-top: 20px;
      }
      ul {
        padding-left: 20px;
        margin-bottom: 20px;
      }
      li {
        margin-bottom: 8px;
      }
      .token-value {
        font-family: monospace;
        background-color: #f5f5f5;
        padding: 2px 5px;
        border-radius: 3px;
      }
      .checklist-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      }
      .checklist-item::before {
        content: "☐";
        margin-right: 10px;
        font-size: 1.2em;
      }
      .footer {
        font-family: 'Instrument Sans', Arial, sans-serif;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
        font-size: 0.9em;
        color: #666;
        text-align: center;
      }
      .footer p {
        margin: 5px 0;
      }
      .support-section {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        margin-top: 20px;
        width: 100%;
      }
      .profile-pic {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
      }
      .support-text {
        margin: 0;
      }
      .toc {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .toc ul {
        list-style-type: none;
        padding-left: 0;
      }
      .toc ul ul {
        padding-left: 20px;
      }
      .toc a {
        color: #2c3e50;
        text-decoration: none;
        line-height: 1.8;
      }
      .toc a:hover {
        color: #0056b3;
        text-decoration: underline;
      }
      .introduction {
        background: #fff;
        padding: 20px;
        border-left: 4px solid #2c3e50;
        margin: 20px 0;
      }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  `;

  let report = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      <img src="data:image/png;base64,${bannerBase64}" class="banner" alt="Design Tokens Wizards Banner">
      <h1>Typography Accessibility Guidelines 🔠👁️</h1>
      
      <div class="introduction">
        <p>This comprehensive typography accessibility report analyzes your design tokens for WCAG 2.2 compliance and provides detailed insights about font choices, sizes, weights, and spacing. Use this report to ensure your typography choices are accessible to all users.</p>
        <p>The report includes guidelines for font families, sizes, weights, letter spacing, and line heights, along with specific recommendations for improving accessibility where needed.</p>
      </div>

      <div class="toc">
        <h2>Table of Contents</h2>
        <ul>
          <li><a href="#selected-properties">Selected Properties</a></li>
          ${selectedProperties.includes('fontFamily') ? '<li><a href="#font-family">Font Family Guidelines</a></li>' : ''}
          ${selectedProperties.includes('fontSize') ? '<li><a href="#font-size">Font Size Guidelines</a></li>' : ''}
          ${selectedProperties.includes('fontWeight') ? '<li><a href="#font-weight">Font Weight Guidelines</a></li>' : ''}
          ${selectedProperties.includes('letterSpacing') ? '<li><a href="#letter-spacing">Letter Spacing Guidelines</a></li>' : ''}
          ${selectedProperties.includes('lineHeight') ? '<li><a href="#line-height">Line Height Guidelines</a></li>' : ''}
          <li><a href="#implementation">Implementation Checklist</a></li>
        </ul>
      </div>

      <h2 id="selected-properties">Selected Properties</h2>
      <ul>
        ${selectedProperties.map(prop => `<li>${prop}</li>`).join('\n')}
      </ul>`;

  if (selectedProperties.includes('fontFamily')) {
    report += `
      <h2 id="font-family">Font Family Guidelines</h2>
      <h3>Your Font Choices</h3>
      <ul>
        ${Object.entries(tokens.fontFamily || {}).map(([name, data]) => 
          data && data.value ? `<li><strong>${name}:</strong> <span class="token-value">${data.value}</span></li>` : ''
        ).join('\n')}
      </ul>
      <h3>Accessibility Guidelines</h3>
      <ul>
        <li>Choose fonts with clear letterforms and good character distinction</li>
        <li>Sans-serif fonts are generally more readable on screens</li>
        <li>Ensure fonts support all required characters and languages</li>
        <li>Always provide at least one system font fallback</li>
        <li>Consider using system font stacks for better performance</li>
      </ul>`;
  }

  if (selectedProperties.includes('fontSize')) {
    report += `
      <h2 id="font-size">Font Size Guidelines</h2>
      <h3>Your Font Sizes</h3>
      <ul>
        ${Object.entries(tokens.fontSize || {}).map(([name, data]) => 
          data && data.value ? `<li><strong>${name}:</strong> <span class="token-value">${data.value}</span></li>` : ''
        ).join('\n')}
      </ul>
      <h3>Accessibility Guidelines</h3>
      <ul>
        <li>Body text should be at least 16px</li>
        <li>Minimum text size should be 12px</li>
        <li>Small font sizes should only be used for supplementary content</li>
        <li>Consider users with visual impairments when defining your scale</li>
      </ul>`;
  }

  if (selectedProperties.includes('fontWeight')) {
    report += `
      <h2 id="font-weight">Font Weight Guidelines</h2>
      <h3>Your Font Weights</h3>
      <ul>
        ${Object.entries(tokens.fontWeight || {}).map(([name, data]) => 
          data && data.value ? `<li><strong>${name}:</strong> <span class="token-value">${data.value}</span></li>` : ''
        ).join('\n')}
      </ul>
      <h3>Accessibility Guidelines</h3>
      <ul>
        <li>Body text should be at least 400 (regular) weight</li>
        <li>Avoid using font weights below 400 for main content</li>
        <li>Headers typically benefit from weights of 600 or higher</li>
        <li>Ensure sufficient contrast between text and background</li>
      </ul>`;
  }

  if (selectedProperties.includes('letterSpacing')) {
    report += `
      <h2 id="letter-spacing">Letter Spacing Guidelines</h2>
      <h3>Your Letter Spacing Values</h3>
      <ul>
        ${Object.entries(tokens.letterSpacing || {}).map(([name, data]) => 
          data && data.value ? `<li><strong>${name}:</strong> <span class="token-value">${data.value}</span></li>` : ''
        ).join('\n')}
      </ul>
      <h3>Accessibility Guidelines</h3>
      <ul>
        <li>Avoid extreme letter spacing values that could harm readability</li>
        <li>Body text should maintain normal letter spacing (0) or very subtle adjustments</li>
        <li>Users with dyslexia may struggle with increased letter spacing</li>
        <li>Ensure sufficient contrast and clear letterforms remain visible</li>
      </ul>`;
  }

  if (selectedProperties.includes('lineHeight')) {
    report += `
      <h2 id="line-height">Line Height Guidelines</h2>
      <h3>Your Line Heights</h3>
      <ul>
        ${Object.entries(tokens.lineHeight || {}).map(([name, data]) => 
          data && data.value ? `<li><strong>${name}:</strong> <span class="token-value">${data.value}</span></li>` : ''
        ).join('\n')}
      </ul>
      <h3>Accessibility Guidelines</h3>
      <ul>
        <li>Body text should have a minimum line height of 1.5</li>
        <li>Headings should have a minimum line height of 1.3</li>
        <li>Line height should increase as line length increases</li>
        <li>WCAG 2.2 Success Criterion 1.4.12 requires adjustable line spacing up to 1.5</li>
      </ul>`;
  }

  report += `
      <h2 id="implementation">Implementation Checklist</h2>
      <div class="checklist">
        ${selectedProperties.map(prop => {
          const checklistItem = {
            fontFamily: 'Font families are accessible and have proper fallbacks',
            fontSize: 'Font sizes meet minimum requirements (16px for body, 12px minimum)',
            fontWeight: 'Font weights are appropriate for content hierarchy',
            letterSpacing: 'Letter spacing is optimized for readability',
            lineHeight: 'Line heights meet WCAG 2.2 requirements'
          }[prop];
          return checklistItem ? `<div class="checklist-item">${checklistItem}</div>` : '';
        }).join('\n')}
        <div class="checklist-item">Typography is tested across different devices and browsers</div>
        <div class="checklist-item">Accessibility tools have been used to verify implementation</div>
        <div class="checklist-item">User testing has been conducted with diverse user groups</div>
      </div>

      <div class="footer">
        <p>Generated by Design Tokens Wizards - Typography Accessibility Guidelines</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <div class="support-section">
          <img src="data:image/png;base64,${fs.readFileSync(path.join(__dirname, '..', 'assets', 'profile_pic.png'), { encoding: 'base64' })}" alt="Profile Picture" class="profile-pic">
          <p class="support-text">Do you want to support this project? <a href="https://ko-fi.com/fbuonanno" target="_blank">Invite me a coffee ❤️☕️</a></p>
        </div>
        <p class="website-link">Discover more about Design Tokens Wizards at: <a href="https://designtokenswizards.framer.website/" target="_blank">https://designtokenswizards.framer.website/</a></p>
      </div>
    </body>
    </html>`;

  // Configure Puppeteer for better PDF output
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Enable loading of Google Fonts
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().startsWith('https://fonts.googleapis.com') || 
        request.url().startsWith('https://fonts.gstatic.com')) {
      request.continue();
    } else {
      request.continue();
    }
  });

  await page.setContent(report);
  
  // Wait for the banner image and Google Font to load
  await page.waitForSelector('img.banner');
  await page.evaluate(() => document.fonts.ready);
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: {
      top: '40px',
      right: '40px',
      bottom: '40px',
      left: '40px'
    },
    printBackground: true,
    preferCSSPageSize: true
  });
  await browser.close();
  */
}

async function typographyWiz() {
  
  console.log(chalk.bold.bgRedBright("\n========================================"));
  console.log(chalk.bold("🪄 STARTING THE TYPOGRAPHY TOKENS WIZARD'S MAGIC"));
  console.log(chalk.bold.bgRedBright("========================================\n"));

  await showLoader(chalk.bold.yellowBright("🦄 Casting the magic of tokens..."), 1500);
  console.log(
    chalk.whiteBright("\n❤️ Welcome to the Typography Tokens Wizard script! Let this wizard 🧙 guide you through \ncreating your typography tokens step by step.") +
    chalk.whiteBright("Generate your tokens and prepare them ready for using or syncing in ") +
    chalk.underline("Tokens Studio") +
    chalk.whiteBright(". \n✨ As a delightful bonus, you'll receive magical files in ") +
    chalk.underline("SCSS") +
    chalk.whiteBright(" and ") +
    chalk.underline("CSS") +
    chalk.whiteBright(" to test in your implementation!\n")
  );

  const { selectedProperties } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedProperties',
      message: 'Which typography tokens would you like to create? (Use space to select, enter to confirm):',
      choices: [
        { name: 'Font Family ', value: 'fontFamily' },
        { name: 'Font Size ', value: 'fontSize' },
        { name: 'Font Weight ', value: 'fontWeight' },
        { name: 'Letter Spacing ', value: 'letterSpacing' },
        { name: 'Line Height ', value: 'lineHeight' }
      ],
      validate: (answer) => {
        if (answer.length < 1) {
          return chalk.bold.red('🚫 Please select at least one token category to generate your typography tokens');
        }
        return true;
      }
    }
  ]);

  if (selectedProperties.length === 0) {
    console.log(chalk.bold.red("🚫 The spell cannot be cast without properties! Please try again and select at least one."));
    return typographyWiz();
  }
  
  let currentStep = 1;
  let fontFamilies = {};
  let fontNames = [];

  async function setupFontFamily() {
    let substep = 0;
    console.log(chalk.bold.bgRedBright("\n========================================"));
    console.log(chalk.bold(`🔠 STEP ${currentStep}: FONT FAMILY SETUP`));
    console.log(chalk.bold.bgRedBright("========================================\n"));
    
    await showAccessibilityNotes('fontFamily');
    
    console.log(chalk.bold.yellowBright(`🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Property Naming`));
    const { propertyName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'propertyName',
        message: 'How would you like to name your font family tokens?',
        choices: [
          { name: 'fontFamily', value: 'fontFamily' },
          { name: 'font-family', value: 'font-family' },
          { name: 'font_family', value: 'font_family' },
          { name: 'fonts', value: 'fonts' },
          { name: 'ff', value: 'ff' },
          { name: 'custom', value: 'custom' }
        ],
        default: 'fontFamily'
      }
    ]);
    
    let customPropertyName = propertyName;
    if (propertyName === 'custom') {
      const { customName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customName',
          message: 'Enter your custom token name (e.g., brandFonts, systemFonts):',
          validate: input => {
            if (input.trim() === '') return 'Please enter a valid token name';
            if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(input)) return 'Token names must start with a letter and can only contain letters, numbers, and hyphens';
            return true;
          }
        }
      ]);
      customPropertyName = customName.trim();
    }
    
    console.log(chalk.bold.yellowBright(`\n🔢 Step ${currentStep}${String.fromCharCode(65 + substep++)}: Select Nº of Fonts`));
    const { numFonts } = await inquirer.prompt([
      { 
        type: 'list', 
        name: 'numFonts', 
        message: 'How many fonts do you want to include for font family?',
        choices: ['1', '2', '3'], 
        default: '1' 
      }
    ]);
    const totalFonts = parseInt(numFonts, 10);
    
    console.log(chalk.bold.yellowBright(`\n🏷️  Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Naming Convention`));
    const { namingConvention } = await inquirer.prompt([
      { 
        type: 'list', 
        name: 'namingConvention', 
        message: 'Which naming convention for font family tokens would you like to use?',
        choices: [
          { name: 'Semantic (primary, secondary, tertiary)', value: 'semantic' },
          { name: 'Purpose-based (title, body, details)', value: 'purpose' },
          { name: 'Ordinal (font-1, font-2, font-3)', value: 'ordinal' },
          { name: 'Alphabetical (font-a, font-b, font-c)', value: 'alphabetical' },
          { name: 'Custom', value: 'custom' }
        ]
      }
    ]);

    let namingOptions = {}; 
    let fontNames = [];
    
    if (namingConvention === 'semantic') {
      const ranking = ['primary', 'secondary', 'tertiary'];
      fontNames = ranking.slice(0, totalFonts);
    } else if (namingConvention === 'purpose') {
      const fnNames = ['titles', 'body', 'details'];
      fontNames = fnNames.slice(0, totalFonts);
    } else if (namingConvention === 'ordinal') {
      const ordinalFormatAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'ordinalFormat',
          message: 'For Ordinal scale, choose the format:',
          choices: [
            { name: 'Padded (e.g., 01, 02, 03, 04)', value: 'padded' },
            { name: 'Unpadded (e.g., 1, 2, 3, 4)', value: 'unpadded' }
          ]
        }
      ]);
      namingOptions.format = ordinalFormatAnswer.ordinalFormat;
      
      for (let i = 1; i <= totalFonts; i++) {
        const numberPart = namingOptions.format === 'padded' ? i.toString().padStart(2, '0') : i.toString();
        fontNames.push(numberPart);
      }
    } else if (namingConvention === 'Alphabetical') {
      const alphabeticalCaseAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'alphabeticalCase',
          message: 'For Alphabetical scale, choose the case:',
          choices: [
            { name: 'Uppercase (A, B, C, D)', value: 'uppercase' },
            { name: 'Lowercase (a, b, c, d)', value: 'lowercase' }
          ]
        }
      ]);
      namingOptions.case = alphabeticalCaseAnswer.alphabeticalCase;
      
      const alphabets = namingOptions.case === 'uppercase' ? ['A', 'B', 'C'] : ['a', 'b', 'c'];
      fontNames = alphabets.slice(0, totalFonts);
    } else if (namingConvention === 'custom') {
      console.log(chalk.bold.yellowBright("\n📝 Enter custom names for your font families:"));
      for (let i = 1; i <= totalFonts; i++) {
        const { customName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customName',
            message: `Enter name for font family ${i}:`,
            validate: input => {
              if (input.trim() === '') return 'Please enter a valid name';
              if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(input)) return 'Names must start with a letter and can only contain letters, numbers, and hyphens';
              return true;
            }
          }
        ]);
        fontNames.push(customName.trim());
      }
    }
    
    console.log(chalk.bold.yellowBright(`\n🔠 Step ${currentStep}${String.fromCharCode(65 + substep++)}: Define Values`));
    fontFamilies = {}; 
    for (const name of fontNames) {
      console.log(chalk.gray(`\nConfiguring font family for "${name}"`));
      const { inputMethod } = await inquirer.prompt([
        { 
          type: 'list', 
          name: 'inputMethod', 
          message: `How would you like to specify the font family for "${name}"?`,
          choices: [
            { name: 'Choose from popular fonts', value: 'popular' },
            { name: 'Enter custom font', value: 'custom' },
            { name: 'Enter multiple fonts with fallbacks', value: 'multiple' }
          ]
        }
      ]);

      let fontValue = '';
      if (inputMethod === 'popular') {
        const popularFonts = [
          'Arial, sans-serif',
          'Helvetica, sans-serif',
          '"Times New Roman", serif',
          'Georgia, serif',
          '"Courier New", monospace',
          'Verdana, sans-serif',
          '"Open Sans", sans-serif',
          'Roboto, sans-serif',
          '"Segoe UI", sans-serif',
          '"SF Pro Text", sans-serif'
        ];
        const { selectedFont } = await inquirer.prompt([
          { 
            type: 'list', 
            name: 'selectedFont', 
            message: `Select a font family for "${name}":`, 
            choices: popularFonts, 
            default: popularFonts[0] 
          }
        ]);
        fontValue = selectedFont;
      } else if (inputMethod === 'custom') {
        const { customFont } = await inquirer.prompt([
          { 
            type: 'input', 
            name: 'customFont', 
            message: `Enter the font family name for "${name}" (e.g., "Montserrat"):`,  
            validate: input => input.trim() !== '' || 'Please enter a font family name'
          }
        ]);
        const { genericFamily } = await inquirer.prompt([
          {
            type: 'list',
            name: 'genericFamily',
            message: 'Select a fallback generic font family:',
            choices: ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'none'],
          }
        ]);
        fontValue = genericFamily === 'none' ? 
          `"${customFont.trim()}"` : 
          `"${customFont.trim()}", ${genericFamily}`;
      } else {
        const { multipleFonts } = await inquirer.prompt([
          {
            type: 'input',
            name: 'multipleFonts',
            message: `Enter font families with fallbacks for "${name}" (comma-separated, e.g., "Montserrat", "Helvetica Neue", sans-serif):\n`,
            validate: input => input.trim() !== '' || 'Please enter at least one font family'
          }
        ]);
        fontValue = multipleFonts;
      }
      fontFamilies[name] = { value: fontValue, type: 'fontFamilies' };
    }

    console.log(chalk.bold.yellowBright("\n📋 Font Family Settings Summary:"));
    
    const settingsTable = new Table({
      head: [chalk.bold("Setting"), chalk.bold("Option")],
      style: { head: ["red"], border: ["red"] }
    });

    settingsTable.push(
      ["Token Name", customPropertyName],
      ["Number of Fonts", totalFonts.toString()],
      ["Naming Convention", namingConvention]
    );

    console.log(settingsTable.toString());

    console.log(chalk.bold.yellowBright("\n🔤 Font Families:"));
    
    const fontTable = new Table({
      head: [chalk.bold("Token Name"), chalk.bold("Value")],
      style: { head: ["red"], border: ["red"] }
    });

    Object.entries(fontFamilies).forEach(([name, data]) => {
      fontTable.push([name, data.value]);
    });

    console.log(fontTable.toString());

    const { confirmFontFamily } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmFontFamily",
        message: "Would you like to continue with these font family settings?",
        default: true
      }
    ]);

    if (!confirmFontFamily) {
      console.log(chalk.bold.yellow("\n↺ Let's reconfigure your font family settings..."));
      return await setupFontFamily();
    }
    
    return { fontFamilies, fontNames, propertyName: customPropertyName };
  }

  async function setupFontSize() {
    let substep = 0;
    console.log(chalk.bold.bgRedBright("\n========================================"));
    console.log(chalk.bold(`🔠 STEP ${currentStep}: FONT SIZE`));
    console.log(chalk.bold.bgRedBright("========================================\n"));
    
    await showAccessibilityNotes('fontSize');
    
    let scaleInfo = {
      type: '',
      method: '',
      step: 0,
      base: 0,
      ratio: 0,
      unit: '',
      baseMultiplier: 0
    };
    
    let namingOptions = {};
    let sizeNames = [];
    let fontSizes = {};
    
    console.log(chalk.bold.yellowBright(`🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Property Naming`));
    const { propertyName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'propertyName',
        message: 'How would you like to name your font size tokens?',
        choices: [
          { name: 'fontSize', value: 'fontSize' },
          { name: 'font-size', value: 'font-size' },
          { name: 'font_size', value: 'font_size' },
          { name: 'size', value: 'size' },
          { name: 'fs', value: 'fs' },
          { name: 'custom', value: 'custom' }
        ],
        default: 'fontSize'
      }
    ]);
    
    let customPropertyName = propertyName;
    if (propertyName === 'custom') {
      const { customName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customName',
          message: 'Enter your custom token name (e.g., sizeScale, typeScale):',
          validate: input => {
            if (input.trim() === '') return 'Please enter a valid token name';
            if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(input)) return 'Token names must start with a letter and can only contain letters, numbers, and hyphens';
            return true;
          }
        }
      ]);
      customPropertyName = customName.trim();
    }

    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Naming Convention`));
    const { namingConvention } = await inquirer.prompt([
      {
        type: 'list',
        name: 'namingConvention',
        message: 'Choose a naming convention for your font size tokens:',
        choices: [
          { name: 'T-shirt sizes (e.g. xs, sm, md, lg)', value: 'tshirt' },
          { name: 'Ordinal (e.g. 1, 2, 3, 4)', value: 'ordinal' },
          { name: 'Incremental (e.g. 100, 200, 300, 400)', value: 'incremental' },
          { name: 'Alphabetical (e.g. A, B, C, D)', value: 'alphabetical' }
      
        ]
      }
    ]);

    if (namingConvention === 'ordinal') {
      const ordinalFormatAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'ordinalFormat',
          message: 'For Ordinal scale, choose the format:',
          choices: [
            { name: 'Padded (e.g., 01, 02, 03, 04)', value: 'padded' },
            { name: 'Unpadded (e.g., 1, 2, 3, 4)', value: 'unpadded' }
          ]
        }
      ]);
      namingOptions.format = ordinalFormatAnswer.ordinalFormat;
    } else if (namingConvention === 'alphabetical') {
      const alphabeticalCaseAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'alphabeticalCase',
          message: 'For Alphabetical scale, choose the case:',
          choices: [
            { name: 'Uppercase (A, B, C, D)', value: 'uppercase' },
            { name: 'Lowercase (a, b, c, d)', value: 'lowercase' }
          ]
        }
      ]);
      namingOptions.case = alphabeticalCaseAnswer.alphabeticalCase;
    } else if (namingConvention === 'incremental') {
      const incrementalStepAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'incrementalStep',
          message: 'For Incremental scale, choose the step increment:',
          choices: [
            { name: '10 in 10 (e.g., 10, 20, 30, 40)', value: 10 },
            { name: '25 in 25 (e.g., 25, 50, 75, 100)', value: 25 },
            { name: '50 in 50 (e.g., 50, 100, 150, 200)', value: 50 },
            { name: '100 in 100 (e.g., 100, 200, 300, 400)', value: 100 }
          ]
        }
      ]);
      namingOptions.increment = incrementalStepAnswer.incrementalStep;
    }

    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Scale Type`));
    console.log(chalk.yellow("Select a scale type for your font sizes. ") + chalk.underline("Recommended:") + chalk.yellow(" 4-point or 8-point grid system for consistency."));
    
    const { scaleType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scaleType',
        message: '🔢 Select the scale to use for your font sizes:',
        choices: [
          { name: '4-Point Grid System', value: '4' },
          { name: '8-Point Grid System', value: '8' },
          { name: 'Modular Scale (multiplier based)', value: 'modular' },
          { name: 'Custom Intervals', value: 'custom' },
          { name: 'Fibonacci Scale', value: 'fibonacci' },
          { name: 'More Info', value: 'info' }
        ],
        filter: (input) => input.toLowerCase()
      }
    ]);
    
    let currentScaleType = scaleType;
    if (scaleType === 'info') {
      console.log(chalk.cyan("\n📚 INFORMATION ABOUT DIFFERENT SCALES:"));
      console.log(chalk.cyan("• 4-Point Grid System: Values increase in multiples of 4 (4, 8, 12, 16, 20...)"));
      console.log(chalk.cyan("• 8-Point Grid System: Values increase in multiples of 8 (8, 16, 24, 32, 40...)"));
      console.log(chalk.cyan("• Modular Scale: Values increase by multiplying by a ratio (e.g., 16, 20, 25, 31.25...)"));
      console.log(chalk.cyan("• Custom Intervals: You define your own progression"));
      console.log(chalk.cyan("• Fibonacci Scale: Based on the Fibonacci sequence (0, 1, 1, 2, 3, 5, 8, 13, 21...)\n"));
      
      const { scaleTypeRetry } = await inquirer.prompt([
        {
          type: 'list',
          name: 'scaleTypeRetry',
          message: '🔢 Now, select the scale to use:',
          choices: [
            { name: '4-Point Grid System', value: '4' },
            { name: '8-Point Grid System', value: '8' },
            { name: 'Modular Scale (multiplier based)', value: 'modular' },
            { name: 'Custom Intervals', value: 'custom' },
            { name: 'Fibonacci Scale', value: 'fibonacci' }
          ],
          filter: (input) => input.toLowerCase()
        }
      ]);
      
      currentScaleType = scaleTypeRetry;
    }
    
    scaleInfo.type = currentScaleType;
    
    if (currentScaleType === '4') {
      
      scaleInfo.method = 'grid';
      scaleInfo.step = 4;
      scaleInfo.base = 16; 
      
      const { baseValue } = await inquirer.prompt([
        {
          type: 'input',
          name: 'baseValue',
          message: 'Enter the base size (default is 16):',
          default: '16',
          validate: input => {
            if (!/^\d*\.?\d+$/.test(input)) return 'Please enter a valid number';
            const value = parseFloat(input);
            if (value < 12) {
              return chalk.yellow('⚠️ Note: The minimum value for font size will be 12px for accessibility reasons.');
            }
            return true;
          }
        }
      ]);
      
      scaleInfo.base = parseFloat(baseValue);
      
    } else if (currentScaleType === '8') {
      
      scaleInfo.method = 'grid';
      scaleInfo.step = 8;
      scaleInfo.base = 16; 
      
      const { baseValue } = await inquirer.prompt([
        {
          type: 'input',
          name: 'baseValue',
          message: 'Enter the base size (default is 16):',
          default: '16',
          validate: input => {
            if (!/^\d*\.?\d+$/.test(input)) return 'Please enter a valid number';
            const value = parseFloat(input);
            if (value < 12) {
              return chalk.yellow('⚠️ Note: The minimum value for font size will be 12px for accessibility reasons.');
            }
            return true;
          }
        }
      ]);
      
      scaleInfo.base = parseFloat(baseValue);
      
    } else if (currentScaleType === 'modular') {
      
      scaleInfo.method = 'modular';
      
      const { baseValue } = await inquirer.prompt([
        {
          type: 'input',
          name: 'baseValue',
          message: 'Enter the base size (middle value):',
          default: '16',
          validate: input => {
            if (!/^\d*\.?\d+$/.test(input)) return 'Please enter a valid number';
            const value = parseFloat(input);
            if (value < 12) {
              return chalk.yellow('⚠️ Note: The minimum value for font size will be 12px for accessibility reasons.');
            }
            return true;
          }
        }
      ]);
      
      const { scaleRatio } = await inquirer.prompt([
        {
          type: 'list',
          name: 'scaleRatio',
          message: 'Choose a ratio for the modular scale:',
          choices: [
            { name: 'Minor Second (1.067)', value: '1.067' },
            { name: 'Major Second (1.125)', value: '1.125' },
            { name: 'Minor Third (1.2)', value: '1.2' },
            { name: 'Major Third (1.25)', value: '1.25' },
            { name: 'Perfect Fourth (1.333)', value: '1.333' },
            { name: 'Augmented Fourth (1.414)', value: '1.414' },
            { name: 'Perfect Fifth (1.5)', value: '1.5' },
            { name: 'Golden Ratio (1.618)', value: '1.618' },
            { name: 'Custom Ratio', value: 'custom' }
          ]
        }
      ]);
      
      if (scaleRatio === 'custom') {
        const { customRatio } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customRatio',
            message: 'Enter your custom ratio (e.g., 1.42):',
            default: '1.42',
            validate: input => {
              if (!/^\d*\.?\d+$/.test(input)) return 'Please enter a valid number';
              if (parseFloat(input) <= 1) return 'Ratio must be greater than 1';
              return true;
            }
          }
        ]);
        
        scaleInfo.ratio = parseFloat(customRatio);
      } else {
        scaleInfo.ratio = parseFloat(scaleRatio);
      }
      
      scaleInfo.base = parseFloat(baseValue);
      
    } else if (currentScaleType === 'custom') {
      
      scaleInfo.method = 'custom';
      
      const { baseValue } = await inquirer.prompt([
        {
          type: 'input',
          name: 'baseValue',
          message: 'Enter the base size:',
          default: '16',
          validate: input => {
            if (!/^\d*\.?\d+$/.test(input)) return 'Please enter a valid number';
            const value = parseFloat(input);
            if (value < 12) {
              return chalk.yellow('⚠️ Note: The minimum value for font size will be 12px for accessibility reasons.');
            }
            return true;
          }
        }
      ]);
      
      const { step } = await inquirer.prompt([
        {
          type: 'input',
          name: 'step',
          message: 'Enter the custom step increment:',
          default: '4',
          validate: input => {
            if (!/^\d*\.?\d+$/.test(input)) return 'Please enter a valid number';
            if (parseFloat(input) <= 0) return 'Step must be greater than 0';
            return true;
          }
        }
      ]);
      
      scaleInfo.base = parseFloat(baseValue);
      scaleInfo.step = parseFloat(step);
      
    } else if (currentScaleType === 'fibonacci') {
      
      scaleInfo.method = 'fibonacci';
      scaleInfo.sequence = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
      
      const { baseMultiplier } = await inquirer.prompt([
        {
          type: 'input',
          name: 'baseMultiplier',
          message: 'Enter the base multiplier (will multiply the Fibonacci sequence):',
          default: '1',
          validate: input => {
            if (!/^\d*\.?\d+$/.test(input)) return 'Please enter a valid number';
            if (parseFloat(input) <= 0) return 'Multiplier must be greater than 0';
            return true;
          }
        }
      ]);
      
      scaleInfo.baseMultiplier = parseFloat(baseMultiplier);
    }
    
    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Unit`));
    
    const { sizingUnit } = await inquirer.prompt([
      {
        type: 'list',
        name: 'sizingUnit',
        message: 'Choose the unit for font sizes:',
        choices: ['px', 'rem', 'em'],
        default: 'px'
      }
    ]);
    
    scaleInfo.unit = sizingUnit;
    
    const { totalSizes } = await inquirer.prompt([
      {
        type: 'input',
        name: 'totalSizes',
        message: 'How many font sizes do you want to create? (min: 1, max: 12):',
        default: '5',
        validate: (input) => {
          const num = parseInt(input.trim());
          if (isNaN(num)) return 'Please enter a valid number';
          if (num < 1) return 'You must have at least 1 font size';
          if (num > 12) return 'Maximum allowed is 12 font sizes';
          return true;
        }
      }
    ]);
    
    const numSizes = parseInt(totalSizes);
    
    if (namingConvention === 'tshirt') {
      if (numSizes === 3) {
        sizeNames = ['sm', 'md', 'lg'];
      } else if (numSizes === 5) {
        sizeNames = ['xs', 'sm', 'md', 'lg', 'xl'];
      } else if (numSizes === 7) {
        sizeNames = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      } else { 
        sizeNames = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
      }
    } else if (namingConvention === 'ordinal') {
      for (let i = 1; i <= numSizes; i++) {
        const numberPart = namingOptions.format === 'padded' ? i.toString().padStart(2, '0') : i.toString();
        sizeNames.push(numberPart);
      }
    } else if (namingConvention === 'alphabetical') {
      const alphabets = namingOptions.case === 'uppercase' ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] : 
                                                           ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
      sizeNames = alphabets.slice(0, numSizes);
    } else if (namingConvention === 'incremental') {
      for (let i = 1; i <= numSizes; i++) {
        sizeNames.push((i * namingOptions.increment).toString());
      }
    }
    
    const sizes = calculateSizes(scaleInfo, numSizes);
    
    sizeNames.forEach((name, index) => {
      
      if (index < sizes.length) {
        fontSizes[name] = { 
          value: `${sizes[index]}${scaleInfo.unit}`, 
          type: 'fontSizes' 
        };
      }
    });
    
    function convertToUnit(value, unit) {
      if (unit === 'px') {
        return value;
      } else if (unit === 'rem' || unit === 'em') {
        // Convert px to rem/em (1rem = 16px by default)
        const converted = (value / 16).toFixed(2);
        // Remove trailing zeros for whole numbers
        return converted.replace(/\.?0+$/, '');
      }
      return value;
    }

    function calculateSizes(scaleInfo, numSizes) {
      const sizes = [];
      const MIN_FONT_SIZE = 12;
      const BASE_FONT_SIZE = 16; // Standard browser default
      
      if (scaleInfo.method === 'grid') {
        const baseSize = Math.max(scaleInfo.base, MIN_FONT_SIZE);
        const step = scaleInfo.step;
        
        // Generate a scale that goes both up and down from the base size
        const halfSizes = Math.floor(numSizes / 2);
        const remainingSizes = numSizes - halfSizes;
        
        // Generate smaller sizes
        for (let i = halfSizes; i > 0; i--) {
          const size = Math.max(baseSize - (i * step), MIN_FONT_SIZE);
          sizes.push(convertToUnit(size, scaleInfo.unit));
        }
        
        // Add base size
        sizes.push(convertToUnit(baseSize, scaleInfo.unit));
        
        // Generate larger sizes
        for (let i = 1; i < remainingSizes; i++) {
          const size = baseSize + (i * step);
          sizes.push(convertToUnit(size, scaleInfo.unit));
        }
      } else if (scaleInfo.method === 'modular') {
        const baseSize = Math.max(scaleInfo.base, MIN_FONT_SIZE);
        const ratio = scaleInfo.ratio;
        
        // Generate a scale that goes both up and down from the base size
        const halfSizes = Math.floor(numSizes / 2);
        const remainingSizes = numSizes - halfSizes;
        
        // Generate smaller sizes
        for (let i = halfSizes; i > 0; i--) {
          const size = Math.max(baseSize / Math.pow(ratio, i), MIN_FONT_SIZE);
          sizes.push(convertToUnit(size, scaleInfo.unit));
        }
        
        // Add base size
        sizes.push(convertToUnit(baseSize, scaleInfo.unit));
        
        // Generate larger sizes
        for (let i = 1; i < remainingSizes; i++) {
          const size = baseSize * Math.pow(ratio, i);
          sizes.push(convertToUnit(size, scaleInfo.unit));
        }
      } else if (scaleInfo.method === 'fibonacci') {
        const sequence = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        const multiplier = Math.max(scaleInfo.baseMultiplier, MIN_FONT_SIZE / sequence[0]);
        
        // Generate a scale that goes both up and down from the base size
        const halfSizes = Math.floor(numSizes / 2);
        const remainingSizes = numSizes - halfSizes;
        
        // Generate smaller sizes
        for (let i = halfSizes; i > 0; i--) {
          const size = Math.max(sequence[i] * multiplier, MIN_FONT_SIZE);
          sizes.push(convertToUnit(size, scaleInfo.unit));
        }
        
        // Add base size
        sizes.push(convertToUnit(sequence[0] * multiplier, scaleInfo.unit));
        
        // Generate larger sizes
        for (let i = 1; i < remainingSizes; i++) {
          const size = sequence[i] * multiplier;
          sizes.push(convertToUnit(size, scaleInfo.unit));
        }
      } else {
        // Custom intervals
        const baseSize = Math.max(scaleInfo.base, MIN_FONT_SIZE);
        const step = scaleInfo.step || 4;
        
        // Generate a scale that goes both up and down from the base size
        const halfSizes = Math.floor(numSizes / 2);
        const remainingSizes = numSizes - halfSizes;
        
        // Generate smaller sizes
        for (let i = halfSizes; i > 0; i--) {
          const size = Math.max(baseSize - (i * step), MIN_FONT_SIZE);
          sizes.push(convertToUnit(size, scaleInfo.unit));
        }
        
        // Add base size
        sizes.push(convertToUnit(baseSize, scaleInfo.unit));
        
        // Generate larger sizes
        for (let i = 1; i < remainingSizes; i++) {
          const size = baseSize + (i * step);
          sizes.push(convertToUnit(size, scaleInfo.unit));
        }
      }
      
      // Ensure unique values and proper ordering
      const uniqueSizes = [...new Set(sizes)].sort((a, b) => parseFloat(a) - parseFloat(b));
      
      // If we have more values than needed, trim the array
      if (uniqueSizes.length > numSizes) {
        return uniqueSizes.slice(0, numSizes);
      }
      
      return uniqueSizes;
    }
    
    console.log(chalk.bold.yellowBright("\n📋 Font Size Settings Summary:"));
    
    // Add note about minimum font size
    console.log(chalk.yellow("\n⚠️  Note: For accessibility, the minimum font size is enforced at 12px (or its rem/em equivalent). \nIf your scale would generate a smaller value, it will be clamped to this minimum.\n"));
    
    const settingsTable = new Table({
      head: [chalk.bold("Setting"), chalk.bold("Option")],
      style: { head: ["red"], border: ["red"] }
    });

    function getDescriptiveName(setting, value) {
      if (setting === 'namingConvention') {
        if (value === 'tshirt') return 'T-shirt size';
        if (value === 'incremental') return 'Incremental';
        if (value === 'ordinal') return 'Ordinal';
        if (value === 'alphabetical') return 'Alphabetical';
        return value;
      }
      
      if (setting === 'scaleType') {
        if (value === '4') return '4-Point Grid System';
        if (value === '8') return '8-Point Grid System';
        if (value === 'modular') return 'Modular Scale';
        if (value === 'custom') return 'Custom Intervals';
        if (value === 'fibonacci') return 'Fibonacci Scale';
        return value;
      }
      
      return value;
    }

    settingsTable.push(
      ["Token Name", customPropertyName],
      ["Naming Convention", getDescriptiveName('namingConvention', namingConvention)],
      ["Scale Type", getDescriptiveName('scaleType', currentScaleType)],
      ["Number of Font Sizes", numSizes.toString()],
      ["Unit", scaleInfo.unit]
    );

    console.log(settingsTable.toString());
    
    console.log(chalk.bold.yellowBright("\n📏 Font Sizes:"));
    
    const sizeTable = new Table({
      head: [chalk.bold("Token Name"), chalk.bold("Value")],
      style: { head: ["red"], border: ["red"] }
    });

    Object.entries(fontSizes).forEach(([name, data]) => {
      sizeTable.push([name, data.value]);
    });

    console.log(sizeTable.toString());
    
    const { confirmFontSize } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmFontSize",
        message: "Would you like to continue with these font size settings?",
        default: true
      }
    ]);

    if (!confirmFontSize) {
      console.log(chalk.bold.yellow("\n↺ Let's reconfigure your font size settings..."));
      return await setupFontSize();
    }
    
    return { fontSizes, propertyName: customPropertyName };
  }

  async function setupFontWeight() {
    let substep = 0;
    console.log(chalk.bold.bgRedBright("\n========================================"));
    console.log(chalk.bold(`🔠 STEP ${currentStep}: FONT WEIGHT`));
    console.log(chalk.bold.bgRedBright("========================================\n"));
    
    await showAccessibilityNotes('fontWeight');
    
    console.log(chalk.bold.yellowBright(`🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Property Naming`));
    const { propertyName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'propertyName',
        message: 'How would you like to name your font weight tokens?',
        choices: [
          { name: 'fontWeight', value: 'fontWeight' },
          { name: 'font-weight', value: 'font-weight' },
          { name: 'font_weight', value: 'font_weight' },
          { name: 'fw', value: 'fw' },
          { name: 'custom', value: 'custom' }
        ],
        default: 'fontWeight'
      }
    ]);
    
    let customPropertyName = propertyName;
    if (propertyName === 'custom') {
      const { customName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customName',
          message: 'Enter your custom token name (e.g., weightScale, weightType):',
          validate: input => {
            if (input.trim() === '') return 'Please enter a valid token name';
            if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(input)) return 'Token names must start with a letter and can only contain letters, numbers, and hyphens';
            return true;
          }
        }
      ]);
      customPropertyName = customName.trim();
    }

    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Define Font Weight Values`));
    const { selectedWeights } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedWeights',
        message: 'Select the font weights to include in your design system:',
        choices: weightOptions.map(opt => ({
          name: `${opt.weight} - ${opt.name} (${opt.usage})`,
          value: { name: opt.name.toLowerCase().replace(' ', ''), value: opt.weight }
        })),
        validate: (answer) => {
          if (answer.length < 1) {
            return chalk.bold.red('🚫 Please select at least one font weight for your design system.');
          }
          return true;
        }
      }
    ]);

    const fontWeight = {};
    selectedWeights.forEach((weight, index) => {
      fontWeight[tokenNames[index]] = { value: weight.value, type: 'fontWeights' };
    });

    console.log(chalk.bold.yellowBright("\n📋 Font Weight Settings Summary:"));
    
    const settingsTable = new Table({
      head: [chalk.bold("Setting"), chalk.bold("Option")],
      style: { head: ["red"], border: ["red"] }
    });

    settingsTable.push(
      ["Token Name", customPropertyName],
      ["Number of Weights", selectedWeights.length.toString()]
    );

    console.log(settingsTable.toString());

    console.log(chalk.bold.yellowBright("\n📏 Font Weights:"));
    
    const weightTable = new Table({
      head: [chalk.bold("Token Name"), chalk.bold("Value")],
      style: { head: ["red"], border: ["red"] }
    });

    Object.entries(fontWeight).forEach(([name, data]) => {
      weightTable.push([name, data.value]);
    });

    console.log(weightTable.toString());

    const { confirmFontWeight } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmFontWeight",
        message: "Would you like to continue with these font weight settings?",
        default: true
      }
    ]);

    if (!confirmFontWeight) {
      console.log(chalk.bold.yellow("\n↺ Let's reconfigure your font weight settings..."));
      return await setupFontWeight();
    }
    
    return { fontWeight, propertyName: customPropertyName };
  }

  const weightOptions = [
    { weight: '100', name: 'Thin', usage: 'Lightest weight, used for very light text' },
    {weight: '200', name: 'Extra Light', usage: 'Slightly heavier than Thin, used for light text' },
    { weight: '300', name: 'Light', usage: 'Used for light text, often in body copy' },
    { weight: '400', name: 'Regular', usage: 'Normal weight, used for most text' },
    { weight: '500', name: 'Medium', usage: 'Slightly heavier than Regular, used for emphasis' },
    { weight: '600', name: 'Semi Bold', usage: 'Bold but not too heavy, used for headings' },
    { weight: '700', name: 'Bold', usage: 'Used for strong emphasis and headings' },
    { weight: '800', name: 'Extra Bold', usage: 'Heavier than Bold, used for strong emphasis' },
    { weight: '900', name: 'Black', usage: 'Heaviest weight, used for very strong emphasis' }
  ];
  const tokenNames = weightOptions.map(opt => opt.name.toLowerCase().replace(' ', ''));
  
  async function setupLetterSpacing() {
    let substep = 0;
    console.log(chalk.bold.bgRedBright("\n========================================"));
    console.log(chalk.bold(`🔠 STEP ${currentStep}: LETTER SPACING`));
    console.log(chalk.bold.bgRedBright("========================================\n"));
    
    await showAccessibilityNotes('letterSpacing');
    
    console.log(chalk.bold.yellowBright(`🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Property Naming`));
    const { propertyName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'propertyName',
        message: 'How would you like to name your letter spacing tokens?',
        choices: [
          { name: 'letterSpacing', value: 'letterSpacing' },
          { name: 'letter-spacing', value: 'letter-spacing' },
          { name: 'letter_spacing', value: 'letter_spacing' },
          { name: 'tracking', value: 'tracking' },
          { name: 'ls', value: 'ls' },
          { name: 'custom', value: 'custom' }
        ],
        default: 'letterSpacing'
      }
    ]);
    
    let customPropertyName = propertyName;
    if (propertyName === 'custom') {
      const { customName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customName',
          message: 'Enter your custom token name (e.g., spacingScale, spacingType):',
          validate: input => {
            if (input.trim() === '') return 'Please enter a valid token name';
            if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(input)) return 'Token names must start with a letter and can only contain letters, numbers, and hyphens';
            return true;
          }
        }
      ]);
      customPropertyName = customName.trim();
    }

    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Naming Convention`));
    const { namingConvention } = await inquirer.prompt([
      {
        type: 'list',
        name: 'namingConvention',
        message: 'Choose a naming convention for your letter spacing tokens:',  
        choices: [
          { name: 'T-shirt sizes (e.g. xs, sm, md, lg)', value: 'tshirt' },
          { name: 'Ordinal (e.g. 1, 2, 3, 4)', value: 'ordinal' },
          { name: 'Incremental (e.g. 100, 200, 300, 400)', value: 'incremental' },
          { name: 'Alphabetical (e.g. A, B, C, D)', value: 'alphabetical' }
        ]
      }
    ]);
    let namingOptions = {};
    let names = [];

    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Define Values`));
    const { numValues } = await inquirer.prompt([
      {
        type: 'input',
        name: 'numValues',
        message: 'How many letter spacing values do you want to create? (1-7):',
        default: '5',
        validate: (input) => {
          const num = parseInt(input);
          if (isNaN(num) || num < 1 || num > 7) {
            return 'Please enter a number between 1 and 7';
          }
          return true;
        }
      }
    ]);
    
    const totalValues = parseInt(numValues);

    
    if (namingConvention === 'tshirt') {
      if (totalValues === 3) {
        names = ['sm', 'md', 'lg'];
      } else if (totalValues === 5) {
        names = ['xs', 'sm', 'md', 'lg', 'xl'];
      } else if (totalValues === 7) {
        names = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      } else {
        names = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].slice(0, totalValues);
      }
    } else if (namingConvention === 'ordinal') {
      for (let i = 1; i <= totalValues; i++) {
        const numberPart = namingOptions.format === 'padded' ? i.toString().padStart(2, '0') : i.toString();
        names.push(numberPart);
      }
    } else if (namingConvention === 'alphabetical') {
      const alphabets = namingOptions.case === 'uppercase' ? 
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] :
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
      names = alphabets.slice(0, totalValues);
    } else if (namingConvention === 'incremental') {
      for (let i = 1; i <= totalValues; i++) {
        names.push((i * namingOptions.increment).toString());
      }
    }

    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Scale Type`));
    const { scaleType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scaleType',
        message: 'Choose the scale type for letter spacing values:',
        choices: [
          { name: 'Predetermined Scale (-1.25%, 0%, 1.25%, 2.5%)', value: 'predetermined' },
          { name: 'Custom Values', value: 'custom' }
        ]
      }
    ]);

    if (scaleType === 'predetermined') {
      console.log(chalk.bold.yellow("\n📝 Predetermined Scale Information:"));
      console.log(chalk.yellow("The predetermined scale uses percentage values:"));
      console.log(chalk.yellow("• -1.25% - Tight spacing"));
      console.log(chalk.yellow("• 0% - Normal spacing"));
      console.log(chalk.yellow("• 1.25% - Slightly loose spacing"));
      console.log(chalk.yellow("• 2.5% - Loose spacing"));
      console.log(chalk.yellow("• 3.75% - Very loose spacing"));
      console.log(chalk.yellow("• 5% - Extra loose spacing"));
      console.log(chalk.yellow("• 10% - Maximum spacing"));
      console.log(chalk.yellow("\nYou can keep these values in percentages or convert them to em/rem units."));
    }

    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Unit`));
    console.log(chalk.yellow("Select the unit for letter spacing values. ") + chalk.underline("Recommended:") + chalk.yellow(" em or rem for better scaling."));
    let { unit } = await inquirer.prompt([
      {
        type: 'list',
        name: 'unit',
        message: 'Choose the unit for letter spacing values:',
        choices: [
          { name: 'em', value: 'em' },
          { name: 'rem', value: 'rem' },
          { name: '%', value: '%' }
        ]
      }
    ]);

    if (scaleType === 'predetermined') {
      if (unit === '%') {
        console.log(chalk.bold.yellow("\nℹ️  Note:"));
        console.log(chalk.yellow("You've chosen to keep the predetermined values in percentages."));
        console.log(chalk.yellow("This is fine, but consider that em/rem units might be more flexible for responsive design."));
      } else {
        console.log(chalk.bold.yellow("\nℹ️  Note:"));
        console.log(chalk.yellow(`The predetermined percentage values will be converted to ${unit} units.`));
        console.log(chalk.yellow("This conversion maintains the same visual spacing while using relative units."));
      }
    }

    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Define Values`));
    let values = [];
    if (scaleType === 'predetermined') {
      const predefinedValues = ['-1.25', '0', '1.25', '2.5', '3.75', '5', '10'];
      // Convert each predefined value to the selected unit
      values = predefinedValues.slice(0, totalValues).map(v => {
        if (unit === '%') {
          // Keep original percentage values
          return v + '%';
        } else {
          const convertedValue = convertLetterSpacing(v, '%', unit);
          return convertedValue + unit;
        }
      });
    } else if (scaleType === 'custom') {
      console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Define your custom values:`));
      console.log(chalk.yellow("\n📝 Letter Spacing Guidelines:"));
      console.log(chalk.yellow("• Negative values (-0.05 to -0.02) for tight spacing"));
      console.log(chalk.yellow("• Zero (0) for normal spacing"));
      console.log(chalk.yellow("• Positive values (0.02 to 0.1) for loose spacing"));
      console.log(chalk.yellow("• Values above 0.1 are rarely needed"));
      console.log(chalk.yellow("• Consider your font's natural spacing"));
      
      for (let i = 0; i < totalValues; i++) {
        const { customValue } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customValue',
            message: `Enter value ${i + 1} of ${totalValues}:\n`,
            default: i === 0 ? '-0.02' : i === 1 ? '0' : '0.02',
            validate: input => {
              if (!/^-?\d*\.?\d+$/.test(input)) {
                return 'Please enter a valid number (can be negative or decimal)';
              }
              const value = parseFloat(input);
              if (value < -0.1) {
                return 'Values below -0.1 are rarely needed for letter spacing';
              }
              if (value > 0.1) {
                return 'Values above 0.1 are rarely needed for letter spacing';
              }
              return true;
            }
          }
        ]);
        values.push(customValue + unit);
      }
    }

    const letterSpacing = {};
    
    for (let i = 0; i < totalValues; i++) {
      letterSpacing[names[i]] = {
        value: values[i],
        type: 'letterSpacing'
      };
    }

    console.log(chalk.bold.yellowBright("\n📋 Letter Spacing Settings Summary:"));
    
    const settingsTable = new Table({
      head: [chalk.bold("Setting"), chalk.bold("Option")],
      style: { head: ["red"], border: ["red"] }
    });

    settingsTable.push(
      ["Token Name", customPropertyName],
      ["Scale Type", scaleType === 'predetermined' ? 'Predetermined Scale' : 'Custom Values'],
      ["Unit", unit],
      ["Number of Values", totalValues.toString()]
    );

    console.log(settingsTable.toString());

    console.log(chalk.bold.yellowBright("\n📏 Letter Spacing Values:"));
    
    const valuesTable = new Table({
      head: [chalk.bold("Token Name"), chalk.bold("Value")],
      style: { head: ["red"], border: ["red"] }
    });

    Object.entries(letterSpacing).forEach(([name, data]) => {
      valuesTable.push([name, data.value]);
    });

    console.log(valuesTable.toString());

    const { confirmLetterSpacing } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmLetterSpacing",
        message: "Would you like to continue with these letter spacing settings?",
        default: true
      }
    ]);

    if (!confirmLetterSpacing) {
      console.log(chalk.bold.yellow("\n↺ Let's reconfigure your letter spacing settings..."));
      return await setupLetterSpacing();
    }
    
    return { letterSpacing, propertyName: customPropertyName };
  }

  function convertLetterSpacing(value, fromUnit, toUnit) {
    // Convert to px first (base unit)
    let pxValue;
    if (fromUnit === 'rem') {
      // 1rem = 16px (standard browser default)
      pxValue = parseFloat(value) * 16;
    } else if (fromUnit === 'em') {
      // 1em = current font size (default 16px)
      pxValue = parseFloat(value) * 16;
    } else if (fromUnit === '%') {
      // For letter spacing, percentage is relative to font size
      // Assuming base font size of 16px
      pxValue = (parseFloat(value) / 100) * 16;
    }

    // Convert from px to target unit
    if (toUnit === 'rem' || toUnit === 'em') {
      // Convert to rem/em (1rem/em = 16px)
      const convertedValue = (pxValue / 16).toFixed(2);
      // Remove trailing zeros for whole numbers
      return convertedValue.replace(/\.?0+$/, '');
    } else if (toUnit === '%') {
      return ((pxValue / 16) * 100).toFixed(2);
    }
  }

  async function setupLineHeight() {
    let substep = 0;
    console.log(chalk.bold.bgRedBright("\n========================================"));
    console.log(chalk.bold(`🔠 STEP ${currentStep}: LINE HEIGHT`));
    console.log(chalk.bold.bgRedBright("========================================\n"));
    
    await showAccessibilityNotes('lineHeight');

    console.log(chalk.bold.yellowBright(`🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Property Naming`));
    const { propertyName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'propertyName',
        message: 'How would you like to name your line height tokens?',
        choices: [
          { name: 'lineHeight', value: 'lineHeight' },
          { name: 'line-height', value: 'line-height' },
          { name: 'line_height', value: 'line_height' },
          { name: 'leading', value: 'leading' },
          { name: 'lh', value: 'lh' },
          { name: 'custom', value: 'custom' }
        ],
        default: 'lineHeight'
      }
    ]);

    let customPropertyName = propertyName;
    if (propertyName === 'custom') {
        const { customName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customName',
          message: 'Enter your custom token name (e.g., leadingScale, lineSpacing):',
          validate: input => {
            if (input.trim() === '') return 'Please enter a valid token name';
            if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(input)) return 'Token names must start with a letter and can only contain letters, numbers, and hyphens';
            return true;
          }
        }
      ]);
      customPropertyName = customName.trim();
    }

    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Naming Convention`));
    const { namingConvention } = await inquirer.prompt([
      {
        type: 'list',
        name: 'namingConvention',
        message: 'Choose a naming convention for your line height tokens:',
        choices: [
          { name: 'T-shirt sizes (e.g. xs, sm, md)', value: 'tshirt' },
          { name: 'Ordinal (e.g. 1, 2, 3)', value: 'ordinal' },
          { name: 'Incremental (e.g. 100, 200, 300 )', value: 'incremental' },
          { name: 'Semantic (e.g. tight, normal, loose)', value: 'semantic' },
          { name: 'Purpose-based (e.g. body, heading, display)', value: 'purpose' }
        ]
      }
    ]);

    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Scale Type`));
    console.log(chalk.yellow("Select a scale type for line heights. ") + chalk.underline("Recommended:") + chalk.yellow(" 1.0 to 2.0 for optimal readability."));

    const { scaleType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scaleType',
        message: 'Choose the scale type for line height values:',
        choices: [
          { name: 'Predetermined Scale 1 (1.1, 1.25, 1.5, 1.6, 1.75, 2.0)', value: 'scale1' },
          { name: 'Predetermined Scale 2 (1.0, 1.2, 1.5, 1.6, 2.0)', value: 'scale2' },
          { name: 'Custom Values', value: 'custom' }
        ]
      }
    ]);

    let lineHeightValues = [];
    if (scaleType === 'scale1') {
      console.log(chalk.yellow("\n📝 Scale 1 Values:"));
      console.log(chalk.yellow("• 1.1 - Tight spacing, good for headings"));
      console.log(chalk.yellow("• 1.25 - Slightly tight, good for subheadings"));
      console.log(chalk.yellow("• 1.5 - Standard body text"));
      console.log(chalk.yellow("• 1.6 - Slightly loose, good for long text"));
      console.log(chalk.yellow("• 1.75 - Loose spacing, good for readability"));
      console.log(chalk.yellow("• 2.0 - Very loose, good for maximum readability"));
      lineHeightValues = ['1.1', '1.25', '1.5', '1.6', '1.75', '2.0'];
    } else if (scaleType === 'scale2') {
      console.log(chalk.yellow("\n📝 Scale 2 Values:"));
      console.log(chalk.yellow("• 1.0 - Very tight, good for display text"));
      console.log(chalk.yellow("• 1.2 - Tight, good for headings"));
      console.log(chalk.yellow("• 1.5 - Standard body text"));
      console.log(chalk.yellow("• 1.6 - Slightly loose, good for long text"));
      console.log(chalk.yellow("• 2.0 - Very loose, good for maximum readability"));
      lineHeightValues = ['1.0', '1.2', '1.5', '1.6', '2.0'];
    } else {
      console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Define your custom values:`));
      console.log(chalk.yellow("\n📝 Line Height Guidelines:"));
      console.log(chalk.yellow("• Values below 1.0 are rarely used"));
      console.log(chalk.yellow("• 1.0-1.2 for tight spacing (headings)"));
      console.log(chalk.yellow("• 1.2-1.5 for normal spacing (body text)"));
      console.log(chalk.yellow("• 1.5-2.0 for loose spacing (long text)"));
      console.log(chalk.yellow("• Values above 2.0 are rarely needed"));
      
      for (let i = 0; i < 5; i++) {
        const { customValue } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customValue',
            message: `Enter value ${i + 1} of 5:`,
            default: i === 0 ? '1.0' : i === 1 ? '1.2' : i === 2 ? '1.5' : i === 3 ? '1.6' : '2.0',
            validate: input => {
              if (!/^\d*\.?\d+$/.test(input)) return 'Please enter a valid number';
              const value = parseFloat(input);
              if (value < 1.0) return 'Line height should be greater than or equal to 1.0';
              if (value > 2.0) return 'Values above 2.0 are rarely needed';
              return true;
            }
          }
        ]);
        lineHeightValues.push(customValue);
      }
    }

    let tokenNames = [];
    if (namingConvention === 'tshirt') {
      tokenNames = ['xs', 'sm', 'md', 'lg', 'xl'];
    } else if (namingConvention === 'semantic') {
      tokenNames = ['tight', 'normal', 'loose', 'relaxed', 'spacious'];
    } else if (namingConvention === 'ordinal') {
      tokenNames = ['1', '2', '3', '4', '5'];
    } else if (namingConvention === 'purpose') {
      tokenNames = ['body', 'heading', 'display', 'compact', 'expanded'];
    }

    const lineHeight = {};
    tokenNames.forEach((name, index) => {
      lineHeight[name] = {
        value: lineHeightValues[index],
        type: 'lineHeights'
      };
    });

    console.log(chalk.bold.yellowBright("\n📋 Line Height Settings Summary:"));
    
    const settingsTable = new Table({
      head: [chalk.bold("Setting"), chalk.bold("Option")],
      style: { head: ["red"], border: ["red"] }
    });

    settingsTable.push(
      ["Token Name", customPropertyName],
      ["Scale Type", scaleType === 'scale1' ? 'Predetermined Scale 1' : 
                     scaleType === 'scale2' ? 'Predetermined Scale 2' : 
                     'Custom Values'],
      ["Number of Values", lineHeightValues.length.toString()]
    );

    console.log(settingsTable.toString());

    console.log(chalk.bold.yellowBright("\n📏 Line Height Values:"));
    
    const valuesTable = new Table({
      head: [chalk.bold("Token Name"), chalk.bold("Value")],
      style: { head: ["red"], border: ["red"] }
    });

    Object.entries(lineHeight).forEach(([name, data]) => {
      valuesTable.push([name, data.value]);
    });

    console.log(valuesTable.toString());

    const { confirmLineHeight } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmLineHeight",
        message: "Would you like to continue with these line height settings?",
        default: true
      }
    ]);

    if (!confirmLineHeight) {
      console.log(chalk.bold.yellow("\n↺ Let's reconfigure your line height settings..."));
      return await setupLineHeight();
    }
    
    return { lineHeight, propertyName: customPropertyName };
  }

  let fontFamilyName = '';
  let fontSizeName = '';
  let fontWeightName = '';
  let letterSpacingName = '';
  let lineHeightName = '';
  
  let fontSize = {};
  let fontWeight = {};
  let letterSpacing = "";
  let lineHeight = "";
  
  let remainingProperties = [...selectedProperties];
  let currentProperty;
  
  while (remainingProperties.length > 0) {
    
    currentProperty = remainingProperties.shift();
    
    if (currentProperty === 'fontFamily') {
      const result = await setupFontFamily();
      fontFamilies = result.fontFamilies;
      fontNames = result.fontNames;
      fontFamilyName = result.propertyName;
    } else if (currentProperty === 'fontSize') {
      const result = await setupFontSize();
      fontSize = result.fontSizes;
      fontSizeName = result.propertyName;
    } else if (currentProperty === 'fontWeight') {
      const result = await setupFontWeight();
      fontWeight = result.fontWeight;
      fontWeightName = result.propertyName;
    } else if (currentProperty === 'letterSpacing') {
      const result = await setupLetterSpacing();
      letterSpacing = result.letterSpacing;
      letterSpacingName = result.propertyName;
    } else if (currentProperty === 'lineHeight') {
      const result = await setupLineHeight();
      lineHeight = result.lineHeight;
      lineHeightName = result.propertyName;
    }
    
    currentStep++;
    
    const allProperties = ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight'];
    const unselectedProperties = allProperties.filter(prop => 
      !selectedProperties.includes(prop) && 
      prop !== currentProperty
    );
    
    if (unselectedProperties.length > 0) {
      console.log(chalk.bold.bgRedBright("\n========================================"));
      console.log(chalk.bold("🔍 ADD MORE PROPERTIES"));
      console.log(chalk.bold.bgRedBright("========================================\n"));
      
      console.log(chalk.yellowBright("You've completed setting up: ") + 
                  chalk.bold(selectedProperties.map(p => {
                    if (p === 'fontFamily') return 'Font Family';
                    if (p === 'fontSize') return 'Font Size';
                    if (p === 'fontWeight') return 'Font Weight';
                    if (p === 'letterSpacing') return 'Letter Spacing';
                    if (p === 'lineHeight') return 'Line Height';
                    return p;
                  }).join(', ')));
      
      const { addMore } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'addMore',
          message: 'Would you like to add more typography properties?',
          default: false
        }
      ]);
      
      if (addMore) {
        const { additionalProperties } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'additionalProperties',
            message: 'Select additional properties to include:',
            choices: unselectedProperties.map(prop => 
              ({ 
                name: prop === 'fontFamily' ? 'Font Family' :
                     prop === 'fontSize' ? 'Font Size' :
                     prop === 'fontWeight' ? 'Font Weight' :
                     prop === 'letterSpacing' ? 'Letter Spacing' :
                     prop === 'lineHeight' ? 'Line Height' : prop,
                value: prop 
              })
            )
          }
        ]);
        
        if (additionalProperties.length > 0) {
          selectedProperties.push(...additionalProperties);
          remainingProperties.push(...additionalProperties);
          console.log(chalk.bold.greenBright(`✅ Added ${additionalProperties.length} more properties to configure.`));
        }
      }
    }
  }
  
  const tokens = { typography: {} };
  if(selectedProperties.includes('fontFamily')){
    tokens.typography[fontFamilyName] = fontFamilies;
  }
  if(selectedProperties.includes('fontSize')){
    tokens.typography[fontSizeName] = fontSize;
  }
  if(selectedProperties.includes('fontWeight')){
    tokens.typography[fontWeightName] = fontWeight;
  }
  if(selectedProperties.includes('letterSpacing')){
    tokens.typography[letterSpacingName] = letterSpacing;
  }
  if(selectedProperties.includes('lineHeight')){
    tokens.typography[lineHeightName] = lineHeight;
  }
  
  const finalTokens = tokens.typography; 
  
  const outputsDir = path.join(__dirname, "..", "..", "output_files");
  const tokensFolder = path.join(outputsDir, "tokens/json/typography");
  const cssFolder = path.join(outputsDir, "tokens/css/typography");
  const scssFolder = path.join(outputsDir, "tokens/scss/typography");

  [outputsDir, tokensFolder, cssFolder, scssFolder].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const jsonFilePath = path.join(tokensFolder, "typography_tokens.json");
  const cssFilePath = path.join(cssFolder, "typography_variables.css");
  const scssFilePath = path.join(scssFolder, "typography_variables.scss");

  const jsonFileExists = fs.existsSync(jsonFilePath);
  const cssFileExists = fs.existsSync(cssFilePath);
  const scssFileExists = fs.existsSync(scssFilePath);

  const jsonContent = JSON.stringify(finalTokens, null, 2);
  const cssContent = generateCSSVariables(finalTokens, "typography");
  const scssContent = generateSCSSVariables(finalTokens, "typography");

  fs.writeFileSync(jsonFilePath, jsonContent, 'utf-8');
  fs.writeFileSync(cssFilePath, cssContent, 'utf-8');
  fs.writeFileSync(scssFilePath, scssContent, 'utf-8');

  // await generateAccessibilityReport(selectedProperties, finalTokens, outputsDir);

  await showLoader(chalk.bold.yellowBright("\n🪄 Finalizing your spell..."), 1500);

  console.log(chalk.black.bgRedBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.black.bgRedBright("=======================================\n"));

  let statusLabel = (jsonFileExists || cssFileExists || scssFileExists) ? "Updated" : "Created";
  const labelIcon = statusLabel === "Created" ? "🪄" : "🆕";

  console.log(chalk.whiteBright(`${labelIcon} ${statusLabel}:`));
  console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), jsonFilePath)}`));
  console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), cssFilePath)}`));
  console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), scssFilePath)}`));
  
  // console.log('')
  // console.log(chalk.whiteBright(`✅ Generated accessibility report at:`));
  // console.log(chalk.whiteBright(`   -> reports/a11y-typography-guidelines.pdf`));

  console.log(chalk.black.bgRedBright("\n======================================="));
  console.log(chalk.bold("🎉🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgRedBright("=======================================\n"));
  
  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.redBright("Typography Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄📝\n"));
  console.log(chalk.black.bgRedBright("=======================================\n"));
}

function generateCSSVariables(tokenObj, prefix) {
  let css = ":root {\n";
  
  for (const [key, token] of Object.entries(tokenObj)) {
    if (typeof token === 'object') {
      for (const [subKey, subToken] of Object.entries(token)) {
        if (subToken && typeof subToken === 'object' && subToken.value) {
          css += `  --${key}-${subKey}: ${subToken.value};\n`;
        }
      }
    } else if (typeof token === 'string') {
      css += `  --${key}: ${token};\n`;
    }
  }
  
  css += "}";
  return css;
}

function generateSCSSVariables(tokenObj, prefix) {
  let scss = "";
  
  for (const [key, token] of Object.entries(tokenObj)) {
    if (typeof token === 'object') {
      for (const [subKey, subToken] of Object.entries(token)) {
        if (subToken && typeof subToken === 'object' && subToken.value) {
          scss += `$${key}-${subKey}: ${subToken.value};\n`;
        }
      }
    } else if (typeof token === 'string') {
      scss += `$${key}: ${token};\n`;
    }
  }
  
  return scss;
}

typographyWiz();