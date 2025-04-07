import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Table from 'cli-table3';
import markdownpdf from 'markdown-pdf';

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
      message: '📝 Would you like to see ' + chalk.underline(' guidelines') + ' for this typography property?',
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
  const reportsDir = path.join(outputsDir, "..", "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, "a11y-typography-guidelines.md");
  
  let report = `# Typography Accessibility Guidelines 🎨👁️\n\n`;
  report += `This report outlines the accessibility guidelines for your typography system based on your selections.\n\n`;
  
  report += `## Selected Properties\n`;
  selectedProperties.forEach(prop => {
    report += `- ${prop}\n`;
  });
  report += `\n`;

  if (selectedProperties.includes('fontFamily')) {
    report += `## Font Family Guidelines\n\n`;
    report += `### Your Font Choices\n`;
    Object.entries(tokens.fontFamily || {}).forEach(([name, data]) => {
      report += `- ${name}: ${data.value}\n`;
    });
    report += `\n### Accessibility Guidelines\n`;
    report += `- Choose fonts with clear letterforms and good character distinction\n`;
    report += `- Sans-serif fonts are generally more readable on screens\n`;
    report += `- Ensure fonts support all required characters and languages\n`;
    report += `- Always provide at least one system font fallback\n`;
    report += `- Consider using system font stacks for better performance\n\n`;
  }

  if (selectedProperties.includes('fontSize')) {
    report += `## Font Size Guidelines\n\n`;
    report += `### Your Font Sizes\n`;
    Object.entries(tokens.fontSize || {}).forEach(([name, data]) => {
      report += `- ${name}: ${data.value}\n`;
    });
    report += `\n### Accessibility Guidelines\n`;
    report += `- Body text should be at least 16px\n`;
    report += `- Minimum text size should be 12px\n`;
    report += `- Small font sizes should only be used for supplementary content\n`;
    report += `- Consider users with visual impairments when defining your scale\n\n`;
  }

  if (selectedProperties.includes('fontWeight')) {
    report += `## Font Weight Guidelines\n\n`;
    report += `### Your Font Weights\n`;
    Object.entries(tokens.fontWeight || {}).forEach(([name, data]) => {
      report += `- ${name}: ${data.value}\n`;
    });
    report += `\n### Accessibility Guidelines\n`;
    report += `- Body text should be at least 400 (regular) weight\n`;
    report += `- Avoid using font weights below 400 for main content\n`;
    report += `- Headers typically benefit from weights of 600 or higher\n`;
    report += `- Ensure sufficient contrast between text and background\n\n`;
  }

  if (selectedProperties.includes('letterSpacing')) {
    report += `## Letter Spacing Guidelines\n\n`;
    report += `### Your Letter Spacing Values\n`;
    Object.entries(tokens.letterSpacing || {}).forEach(([name, data]) => {
      report += `- ${name}: ${data.value}\n`;
    });
    report += `\n### Accessibility Guidelines\n`;
    report += `- Avoid extreme letter spacing values that could harm readability\n`;
    report += `- Body text should maintain normal letter spacing (0) or very subtle adjustments\n`;
    report += `- Users with dyslexia may struggle with increased letter spacing\n`;
    report += `- Ensure sufficient contrast and clear letterforms remain visible\n\n`;
  }

  if (selectedProperties.includes('lineHeight')) {
    report += `## Line Height Guidelines\n\n`;
    report += `### Your Line Heights\n`;
    Object.entries(tokens.lineHeight || {}).forEach(([name, data]) => {
      report += `- ${name}: ${data.value}\n`;
    });
    report += `\n### Accessibility Guidelines\n`;
    report += `- Body text should have a minimum line height of 1.5\n`;
    report += `- Headings should have a minimum line height of 1.3\n`;
    report += `- Line height should increase as line length increases\n`;
    report += `- WCAG 2.2 Success Criterion 1.4.12 requires adjustable line spacing up to 1.5\n\n`;
  }

  report += `## Implementation Checklist\n\n`;
  selectedProperties.forEach(prop => {
    const checklistItem = {
      fontFamily: '[ ] Font families are accessible and have proper fallbacks',
      fontSize: '[ ] Font sizes meet minimum requirements (16px for body, 12px minimum)',
      fontWeight: '[ ] Font weights are appropriate for content hierarchy',
      letterSpacing: '[ ] Letter spacing is optimized for readability',
      lineHeight: '[ ] Line heights meet WCAG 2.2 requirements'
    }[prop];
    if (checklistItem) {
      report += `${checklistItem}\n`;
    }
  });
  report += `[ ] Typography is tested across different devices and browsers\n`;
  report += `[ ] Accessibility tools have been used to verify implementation\n`;
  report += `[ ] User testing has been conducted with diverse user groups\n\n`;

  report += `---\n\n`;
  report += `*Generated by Design Tokens Wizards - Typography Accessibility Guidelines*\n`;
  const timestamp = new Date().toLocaleString();
  report += `Generated on: ${timestamp}\n\n`;

  fs.writeFileSync(reportPath, report);
  
  const pdfPath = path.join(reportsDir, "a11y-typography-guidelines.pdf");
  markdownpdf().from(reportPath).to(pdfPath, function () {
  });
}

async function typographyWiz() {
  
  console.log(chalk.bold.bgRedBright("\n========================================"));
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.bold.bgRedBright("========================================\n"));

  await showLoader(chalk.bold.magenta("🦄 Casting the magic of tokens..."), 1500);
  console.log(
    chalk.whiteBright("\n❤️ Welcome to the ") +
        chalk.bold.yellow("Typography Tokens Wizard") +
        chalk.whiteBright(" script! \nLet this wizard guide you through creating your typography tokens in just a few steps. \nDefine your font families, sizes, weights, and more, and prepare them for import or sync with ") +
        chalk.underline("Tokens Studio") +
        chalk.whiteBright(" format.\n")
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
    
    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Property Naming`));
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
            { name: 'Padded (e.g., 01, 02, 03)', value: 'padded' },
            { name: 'Unpadded (e.g., 1, 2, 3)', value: 'unpadded' }
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
            { name: 'Uppercase (A, B, C)', value: 'uppercase' },
            { name: 'Lowercase (a, b, c)', value: 'lowercase' }
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
          { name: 'T-shirt sizes (xs, sm, md, lg, xl)', value: 'tshirt' },
          { name: 'Ordinal (1, 2, 3, 4, 5)', value: 'ordinal' },
          { name: 'Incremental (10, 20, 30...)', value: 'incremental' },
          { name: 'Alphabetical (a, b, c, d, e)', value: 'alphabetical' }
      
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
            { name: 'Padded (e.g., 01, 02, 03)', value: 'padded' },
            { name: 'Unpadded (e.g., 1, 2, 3)', value: 'unpadded' }
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
            { name: 'Uppercase (A, B, C)', value: 'uppercase' },
            { name: 'Lowercase (a, b, c)', value: 'lowercase' }
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
            { name: '10 in 10 (e.g., 10, 20, 30, ...)', value: 10 },
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
    
    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Define Values`));
    
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
    
    function calculateSizes(scaleInfo, numSizes) {
      const sizes = [];
      const MIN_FONT_SIZE = 12; 
      
      if (scaleInfo.method === 'grid') {
        
        const baseSize = Math.max(scaleInfo.base, MIN_FONT_SIZE);
        const step = scaleInfo.step;
        
        for (let i = 0; i < numSizes; i++) {
          const size = Math.round((baseSize + (i * step)) * 100) / 100;
          sizes.push(size);
        }
      } else if (scaleInfo.method === 'modular') {
        
        const baseSize = Math.max(scaleInfo.base, MIN_FONT_SIZE);
        const ratio = scaleInfo.ratio;
        
        for (let i = 0; i < numSizes; i++) {
          const size = Math.round(baseSize * Math.pow(ratio, i) * 100) / 100;
          sizes.push(size);
        }
      } else if (scaleInfo.method === 'fibonacci') {
        
        const sequence = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]; 
        
        const minMultiplier = MIN_FONT_SIZE / sequence[0];
        const multiplier = Math.max(scaleInfo.baseMultiplier, minMultiplier);
        
        const calculatedSizes = sequence.slice(0, numSizes).map(num => 
          Math.round(num * multiplier * 100) / 100
        );
        
        sizes.push(...calculatedSizes);
        
        while (sizes.length < numSizes) {
          const nextFib = sequence[sequence.length - 1] + sequence[sequence.length - 2];
          sequence.push(nextFib);
          sizes.push(Math.round(nextFib * multiplier * 100) / 100);
        }
      } else {
        
        const baseSize = Math.max(scaleInfo.base, MIN_FONT_SIZE);
        const step = scaleInfo.step || 4; 
        
        for (let i = 0; i < numSizes; i++) {
          const size = Math.round((baseSize + (i * step)) * 100) / 100;
          sizes.push(size);
        }
      }
      
      const uniqueSizes = [];
      for (let i = 0; i < sizes.length; i++) {
        
        let size = Math.max(sizes[i], MIN_FONT_SIZE);
        
        if (uniqueSizes.length > 0 && size <= uniqueSizes[uniqueSizes.length - 1]) {
          size = uniqueSizes[uniqueSizes.length - 1] + 1;
        }
        
        uniqueSizes.push(size);
      }
      
      return uniqueSizes;
    }
    
    console.log(chalk.bold.yellowBright("\n📋 Font Size Settings Summary:"));
    
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

    console.log(chalk.bold.yellowBright(`🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Define Font Weight Values`));
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
  
  // LETTER SPACING REVISION
  
  async function setupLetterSpacing() {
    let substep = 0;
    console.log(chalk.bold.bgRedBright("\n========================================"));
    console.log(chalk.bold(`🔠 STEP ${currentStep}: LETTER SPACING`));
    console.log(chalk.bold.bgRedBright("========================================\n"));
    
    await showAccessibilityNotes('letterSpacing');
    
    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Property Naming`));
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
          { name: 'T-shirt sizes (xs, sm, md, lg, xl)', value: 'tshirt' },
          { name: 'Ordinal (1, 2, 3, 4, 5)', value: 'ordinal' },
          { name: 'Incremental (10, 20, 30...)', value: 'incremental' },
          { name: 'Alphabetical (a, b, c, d, e)', value: 'alphabetical' }
        ]
      }
    ]);
    let namingOptions = {};
    let names = [];

    if (namingConvention === 'ordinal') {
      const ordinalFormatAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'ordinalFormat',
          message: 'For Ordinal scale, choose the format:',
          choices: [
            { name: 'Padded (e.g., 01, 02, 03)', value: 'padded' },
            { name: 'Unpadded (e.g., 1, 2, 3)', value: 'unpadded' }
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
            { name: 'Uppercase (A, B, C)', value: 'uppercase' },
            { name: 'Lowercase (a, b, c)', value: 'lowercase' }
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
            { name: '10 in 10 (e.g., 10, 20, 30, ...)', value: 10 },
            { name: '50 in 50 (e.g., 50, 100, 150, 200)', value: 50 },
            { name: '100 in 100 (e.g., 100, 200, 300, 400)', value: 100 }
          ]
        }
      ]);
      namingOptions.increment = incrementalStepAnswer.incrementalStep;
    }

    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Scale Type`));
    const { scaleType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scaleType',
        message: 'Choose the scale type for letter spacing values:',
        choices: [
          { name: 'Predetermined (-1.25%, 0%, 1.25%, 2.5%)', value: 'predetermined' },
          { name: 'Custom Intervals', value: 'custom' }
        ]
      }
    ]);

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
          { name: 'px', value: 'px' },
          { name: '%', value: '%' }
        ]
      }
    ]);

    if (scaleType === 'predetermined' && unit === '%') {
      console.log(chalk.bold.yellow("\n⚠️  WARNING:"));
      console.log(chalk.yellow("The predetermined scale values are optimized for absolute units."));
      console.log(chalk.yellow("For better typography control, consider using 'em', 'rem', or 'px' instead of '%'."));
      
      const { changeUnit } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'changeUnit',
          message: 'Would you like to select a different unit?',
          default: true
        }
      ]);

      if (changeUnit) {
        const { newUnit } = await inquirer.prompt([
          {
            type: 'list',
            name: 'newUnit',
            message: 'Choose a new unit:',
            choices: [
              { name: 'em', value: 'em' },
              { name: 'rem', value: 'rem' },
              { name: 'px', value: 'px' }
            ]
          }
        ]);
        unit = newUnit;
      }
    }

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
    
    let values = [];
    const totalValues = parseInt(numValues);

    if (scaleType === 'predetermined') {
      const predefinedValues = ['-1.25', '0', '1.25', '2.5', '3.75', '5', '10'];
      values = predefinedValues.slice(0, totalValues).map(v => v + (unit === 'px' ? 'px' : unit));
    } else if (scaleType === 'custom') {
      console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Define your custom intervals:`));
      
      for (let i = 0; i < totalValues; i++) {
        const { customValue } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customValue',
            message: `Enter value ${i + 1} of ${totalValues}:\n`,
            default: '0',
            validate: input => {
              if (!/^-?\d*\.?\d+$/.test(input)) {
                return 'Please enter a valid number (can be negative or decimal)';
              }
              return true;
            }
          }
        ]);
        values.push(customValue + (unit === 'px' ? 'px' : unit));
      }
    }

    const letterSpacing = {};
    for (let i = 0; i < totalValues; i++) {
      if (values[i] && names[i]) {
        letterSpacing[names[i]] = {
          value: values[i],
          type: 'letterSpacing'
        };
      }
    }

    console.log(chalk.bold.yellowBright("\n📋 Letter Spacing Settings Summary:"));
    
    const settingsTable = new Table({
      head: [chalk.bold("Setting"), chalk.bold("Option")],
      style: { head: ["red"], border: ["red"] }
    });

    settingsTable.push(
      ["Token Name", customPropertyName],
      ["Scale Type", scaleType],
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

  // LINE HEIGHT REVISION

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

    console.log(chalk.bold.yellowBright(`🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Naming Convention`));
    const { namingConvention } = await inquirer.prompt([
      {
        type: 'list',
        name: 'namingConvention',
        message: 'Choose a naming convention for your line height tokens:',
        choices: [
          { name: 'T-shirt sizes (xs, sm, md, lg, xl)', value: 'tshirt' },
          { name: 'Ordinal (1, 2, 3, 4, 5)', value: 'ordinal' },
          { name: 'Incremental (100, 200, 300, 400, 500)', value: 'incremental' },
          { name: 'Semantic (tight, normal, loose, relaxed, spacious)', value: 'semantic' },
          { name: 'Purpose-based (body, heading, display, compact, expanded)', value: 'purpose' }
        ]
      }
    ]);

    console.log(chalk.bold.yellowBright(`🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Scale Type`));
    console.log(chalk.yellow("Select a scale type for line heights. ") + chalk.underline("Recommended:") + chalk.yellow(" 1.0 to 2.0 for optimal readability."));

    const { scaleType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scaleType',
        message: 'Choose the scale type for line height values:',
        choices: [
          { name: 'Scale 1 (1.1, 1.25, 1.5, 1.6, 1.75, 2.0)', value: 'scale1' },
          { name: 'Scale 2 (1.0, 1.2, 1.5, 1.6, 2.0)', value: 'scale2' },
          { name: 'Custom Intervals', value: 'custom' }
        ]
      }
    ]);

    let lineHeightValues = [];
    if (scaleType === 'scale1') {
      lineHeightValues = ['1.1', '1.25', '1.5', '1.6', '1.75', '2.0'];
    } else if (scaleType === 'scale2') {
      lineHeightValues = ['1.0', '1.2', '1.5', '1.6', '2.0'];
    } else {
      console.log(chalk.yellow("\n⚠️ Note: For optimal readability, line heights should typically be between 1.0 and 2.0"));
      for (let i = 0; i < 5; i++) {
            const { customValue } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customValue',
            message: `Enter value ${i + 1} of 5:`,
            default: i === 2 ? '1.5' : String(1.0 + (i * 0.2)),
            validate: input => {
              if (!/^\d*\.?\d+$/.test(input)) return 'Please enter a valid number';
              const value = parseFloat(input);
              if (value < 1) return 'Line height should be greater than or equal to 1';
              if (i === 2 && value !== 1.5) return 'The third value must be 1.5 for normal line height';
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
      ["Naming Convention", namingConvention],
      ["Scale Type", scaleType]
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
      letterSpacing = result.value;
      letterSpacingName = result.propertyName;
    } else if (currentProperty === 'lineHeight') {
      const result = await setupLineHeight();
      lineHeight = result.value;
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
            choices: unselectedProperties.map(prop => {
              if (prop === 'fontFamily') return { name: 'Font Family', value: 'fontFamily' };
              if (prop === 'fontSize') return { name: 'Font Size', value: 'fontSize' };
              if (prop === 'fontWeight') return { name: 'Font Weight', value: 'fontWeight' };
              if (prop === 'letterSpacing') return { name: 'Letter Spacing', value: 'letterSpacing' };
              if (prop === 'lineHeight') return { name: 'Line Height', value: 'lineHeight' };
              return { name: prop, value: prop };
            })
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
    const letterSpacingResult = await setupLetterSpacing();
    tokens.typography[letterSpacingResult.propertyName] = letterSpacingResult.letterSpacing;
  }
  if(selectedProperties.includes('lineHeight')){
    tokens.typography[lineHeightName] = { value: lineHeight, type: "lineHeights" };
  }
  
  const finalTokens = tokens.typography; 
  
  const outputsDir = path.join(__dirname, "..", "outputs");
  const tokensTypographyDir = path.join(outputsDir, "tokens", "typography");
  const cssTypographyDir = path.join(outputsDir, "css", "typography");
  const scssTypographyDir = path.join(outputsDir, "scss", "typography");

  [outputsDir, tokensTypographyDir, cssTypographyDir, scssTypographyDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const jsonFilePath = path.join(tokensTypographyDir, "typography_tokens.json");
  const cssFilePath = path.join(cssTypographyDir, "typography_variables.css");
  const scssFilePath = path.join(scssTypographyDir, "typography_variables.scss");

  const jsonFileExists = fs.existsSync(jsonFilePath);
  const cssFileExists = fs.existsSync(cssFilePath);
  const scssFileExists = fs.existsSync(scssFilePath);

  const jsonContent = JSON.stringify(finalTokens, null, 2);
  const cssContent = generateCSSVariables(finalTokens, "typography");
  const scssContent = generateSCSSVariables(finalTokens, "typography");

  fs.writeFileSync(jsonFilePath, jsonContent, 'utf-8');
  fs.writeFileSync(cssFilePath, cssContent, 'utf-8');
  fs.writeFileSync(scssFilePath, scssContent, 'utf-8');

  await generateAccessibilityReport(selectedProperties, finalTokens, outputsDir);

  await showLoader(chalk.bold.yellow("\n🪄 Finalizing your spell..."), 1500);

  console.log(chalk.black.bgRedBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.black.bgRedBright("=======================================\n"));

  let statusLabel = (jsonFileExists || cssFileExists || scssFileExists) ? "Updated" : "Created";
  const labelIcon = statusLabel === "Created" ? "🪄" : "🆕";

  console.log(chalk.whiteBright(`${labelIcon} ${statusLabel}:`));
  console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), jsonFilePath)}`));
  console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), cssFilePath)}`));
  console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), scssFilePath)}`));
  
  console.log('')
  console.log(chalk.whiteBright(`✅ Generated accessibility report at:`));
  console.log(chalk.whiteBright(`   -> reports/a11y-typography-guidelines.md`));
  console.log(chalk.whiteBright(`   -> reports/a11y-typography-guidelines.pdf`));

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
      scss += "\n";
    }
  }
  
  return scss;
}

typographyWiz();