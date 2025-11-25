import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import { showAccessibilityNotes } from './accessibility.js';
import { createSettingsTable, createValuesTable, calculateSizes, getDescriptiveName, convertLetterSpacing } from './utils.js';

// Font weight options
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

export async function promptForPropertyName(propertyLabel, choices, defaultChoice, customExamples) {
  const { propertyName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'propertyName',
      message: `How would you like to name your ${propertyLabel} tokens?
>>>`,
      choices: choices,
      default: defaultChoice
    }
  ]);

  let customPropertyName = propertyName;
  if (propertyName === 'custom') {
    const { customName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customName',
        message: `Enter your custom token name (e.g., ${customExamples}):
>>>`,
        validate: input => {
          if (input.trim() === '') return 'Please enter a valid token name';
          if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(input)) return 'Token names must start with a letter and can only contain letters, numbers, and hyphens';
          return true;
        }
      }
    ]);
    customPropertyName = customName.trim();
  }

  return customPropertyName;
}

export async function setupFontFamily(currentStep) {
  let substep = 0;
  console.log(chalk.bold.bgRedBright("\n========================================"));
  console.log(chalk.bold(`🔠 STEP ${currentStep}: FONT FAMILY SETUP`));
  console.log(chalk.bold.bgRedBright("========================================\n"));
  
  await showAccessibilityNotes('fontFamily');

  console.log(chalk.bold.yellowBright(`🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Property Naming`));
  const customPropertyName = await promptForPropertyName(
    'font family',
    [
      { name: 'fontFamily', value: 'fontFamily' },
      { name: 'font-family', value: 'font-family' },
      { name: 'font_family', value: 'font_family' },
      { name: 'fonts', value: 'fonts' },
      { name: 'ff', value: 'ff' },
      { name: 'custom', value: 'custom' }
    ],
    'fontFamily',
    'brandFonts, systemFonts'
  );
  
  console.log(chalk.bold.yellowBright(`\n🔢 Step ${currentStep}${String.fromCharCode(65 + substep++)}: Select Nº of Fonts`));
  const { numFonts } = await inquirer.prompt([
    {
      type: 'list', 
      name: 'numFonts', 
      message: 'How many fonts do you want to include for font family?\n>>>',
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
      message: 'Which naming convention for font family tokens would you like to use?\n>>>',
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
        message: 'For Ordinal scale, choose the format:\n>>>',
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
  } else if (namingConvention === 'alphabetical') {
    const alphabeticalCaseAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'alphabeticalCase',
        message: 'For Alphabetical scale, choose the case:\n>>>',
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
          message: `Enter name for font family ${i}:\n>>>`,
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
  let fontFamilies = {}; 
  for (const name of fontNames) {
    console.log(chalk.gray(`\nConfiguring font family for "${name}"`));
    const { inputMethod } = await inquirer.prompt([
      {
        type: 'list', 
        name: 'inputMethod', 
        message: `How would you like to specify the font family for "${name}"?\n>>>`,
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
          message: `Select a font family for "${name}":\n>>>`, 
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
          message: `Enter the font family name for "${name}" (e.g., "Montserrat"):\n>>>`,  
          validate: input => input.trim() !== '' || 'Please enter a font family name'
        }
      ]);
      const { genericFamily } = await inquirer.prompt([
        {
          type: 'list',
          name: 'genericFamily',
          message: 'Select a fallback generic font family:\n>>>',
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
          message: `Enter font families with fallbacks for "${name}" (comma-separated, e.g., "Montserrat", "Helvetica Neue", sans-serif):\n>>>`,
          validate: input => input.trim() !== '' || 'Please enter at least one font family'
        }
      ]);
      fontValue = multipleFonts;
    }
    fontFamilies[name] = {
      $value: fontValue,
      $type: "fontFamily"
    };
  }

  console.log(chalk.bold.yellowBright("\n📋 Font Family Settings Summary:"));
  console.log(createSettingsTable([
    ["Token Name", customPropertyName],
    ["Number of Fonts", totalFonts.toString()],
    ["Naming Convention", namingConvention]
  ]));

  console.log(chalk.bold.yellowBright("\n🔤 Font Families:"));
  console.log(createValuesTable(fontFamilies));

  const { confirmFontFamily } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmFontFamily",
      message: "Would you like to continue with these font family settings?\n>>>",
      default: true
    }
  ]);

  if (!confirmFontFamily) {
    console.log(chalk.bold.yellow("\n↺ Let's reconfigure your font family settings..."));
    return await setupFontFamily(currentStep);
  }
  
  return { fontFamilies, fontNames, propertyName: customPropertyName };
}

export async function setupFontSize(currentStep) {
  let substep = 0;
  console.log(chalk.bold.bgRedBright("\n========================================"));
  console.log(chalk.bold(`🔠 STEP ${currentStep}: FONT SIZE`));
  console.log(chalk.bold.bgRedBright("========================================\n"));
  
  await showAccessibilityNotes('fontSize');
  
  let fontSizes = {}; // Initialize fontSizes object

  console.log(chalk.bold.yellowBright(`🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Property Naming`));
  const customPropertyName = await promptForPropertyName(
    'font size',
    [
      { name: 'fontSize', value: 'fontSize' },
      { name: 'font-size', value: 'font-size' },
      { name: 'font_size', value: 'font_size' },
      { name: 'size', value: 'size' },
      { name: 'fs', value: 'fs' },
      { name: 'custom', value: 'custom' }
    ],
    'fontSize',
    'sizeScale, fontSizeScale'
  );

  console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Naming Convention`));
  const { namingConvention } = await inquirer.prompt([
    {
      type: 'list',
      name: 'namingConvention',
      message: 'Choose a naming convention for your font size tokens:\n>>>',
      choices: [
        { name: 'T-shirt sizes (e.g. xs, sm, md, lg)', value: 'tshirt' },
        { name: 'Ordinal (e.g. 1, 2, 3, 4)', value: 'ordinal' },
        { name: 'Incremental (e.g. 100, 200, 300, 400)', value: 'incremental' },
        { name: 'Alphabetical (e.g. A, B, C, D)', value: 'alphabetical' }
      ]
    }
  ]);

  let namingOptions = {};
  let sizeNames = [];

  if (namingConvention === 'ordinal') {
    const { ordinalFormat } = await inquirer.prompt([
      {
        type: 'list',
        name: 'ordinalFormat',
        message: 'For Ordinal scale, choose the format:\n>>>',
        choices: [
          { name: 'Padded (e.g., 01, 02, 03, 04)', value: 'padded' },
          { name: 'Unpadded (e.g., 1, 2, 3, 4)', value: 'unpadded' }
        ]
      }
    ]);
    namingOptions.format = ordinalFormat;
  } else if (namingConvention === 'incremental') {
    const { increment } = await inquirer.prompt([
      {
        type: 'list',
        name: 'increment',
        message: 'For Incremental scale, choose the step increment:\n>>>',
        choices: [
          { name: "100 in 100 (e.g., 100, 200, 300, 400)", value: '100' },
          { name: "50 in 50 (e.g., 50, 100, 150, 200)", value: '50' },
          { name: "25 in 25 (e.g., 25, 50, 75, 100)", value: '25' },
          { name: "10 in 10 (e.g., 10, 20, 30, 40)", value: '10' }
        ]
      }
    ]);
    namingOptions.increment = increment;
  } else if (namingConvention === 'alphabetical') {
    const { alphabeticalCase } = await inquirer.prompt([
      {
        type: 'list',
        name: 'alphabeticalCase',
        message: 'For Alphabetical scale, choose the format:\n>>>',
        choices: [
          { name: 'Uppercase (A, B, C, D)', value: 'uppercase' },
          { name: 'Lowercase (a, b, c, d)', value: 'lowercase' }
        ]
      }
    ]);
    namingOptions.case = alphabeticalCase;
  }

  console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Scale Type`));
  let { scaleType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scaleType',
      message: 'Choose the scale type for font sizes:\n>>>',
      choices: [
        { name: '4-Point Grid System', value: 'grid4' },
        { name: '8-Point Grid System', value: 'grid8' },
        { name: 'Modular Scale', value: 'modular' },
        { name: 'Custom Intervals', value: 'custom' },
        { name: 'Fibonacci Scale', value: 'fibonacci' },
        { name: 'More Info', value: 'info' }
      ]
    }
  ]);

  if (scaleType === 'info') {
    console.log(chalk.black.bgRedBright("\n========================================"));
    console.log(chalk.bold("📚 SCALE INFORMATION"));
    console.log(chalk.black.bgRedBright("========================================\n"));

    const scaleInfoTable = new Table({
      head: [
        chalk.bold("Scale Name"),
        chalk.bold("Description"),
        chalk.bold("Examples")
      ],
      wordWrap: true,
      wrapOnWordBoundary: true,
      style: { head: ["red"], border: ["red"] },
      colWidths: [25, 50, 30]
    });

    scaleInfoTable.push(
      [
        "4-Point Grid System",
        "Increments by 4 units to maintain consistency. Perfect for maintaining visual rhythm and alignment.",
        "4, 8, 12, 16, ...\nGreat for UI components."
      ],
      [
        "8-Point Grid System",
        "Increments by 8 units for more spacious designs. Ideal for larger components and breathing room.",
        "8, 16, 24, 32, ...\nCommon in modern web design."
      ],
      [
        "Modular Scale",
        "Uses a multiplier for a harmonious flow. Creates a musical, proportional relationship between values using a constant ratio.",
        "4, 6.4, 10.24, ...\nBased on musical intervals."
      ],
      [
        "Custom Intervals",
        "User-defined intervals for complete customization. Complete control over the progression of values.",
        "4, 10, 16, 22, ...\nGreat for specific needs."
      ],
      [
        "Fibonacci Scale",
        "Uses Golden Ratio (≈1.618) for natural progression. Creates an organic sequence found in nature and art. Each value is 1.618 times the previous one.",
        "4, 6.47, 10.47, ...\nPerfect for organic UIs."
      ]
    );

    console.log(scaleInfoTable.toString());
    console.log(chalk.black.bgRedBright("\n========================================\n"));
    
    const newScaleAnswer = await inquirer.prompt([ 
      {
        type: 'list',
        name: 'scaleType',
        message: 'Choose the scale type for font sizes:\n>>>',
        choices: [
          { name: '4-Point Grid System', value: 'grid4' },
          { name: '8-Point Grid System', value: 'grid8' },
          { name: 'Modular Scale', value: 'modular' },
          { name: 'Custom Intervals', value: 'custom' },
          { name: 'Fibonacci Scale', value: 'fibonacci' }
        ]
      }
    ]);
    scaleType = newScaleAnswer.scaleType;
  }

  let scaleInfo = {
    method: scaleType,
    unit: 'px'
  };

  if (scaleType === 'grid4' || scaleType === 'grid8') {
    scaleInfo.step = scaleType === 'grid4' ? 4 : 8;
    
    const { baseValue } = await inquirer.prompt([
      {
        type: 'input',
        name: 'baseValue',
        message: 'Enter the base size (middle value):\n>>>',
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
  } else if (scaleType === 'modular') {
    scaleInfo.method = 'modular';
    
    const { baseValue } = await inquirer.prompt([
      {
        type: 'input',
        name: 'baseValue',
        message: 'Enter the base size (middle value):\n>>>',
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
        message: 'Choose a ratio for the modular scale:\n>>>',
        choices: [
          { name: 'Minor Second (1.067)', value: '1.067' },
          { name: 'Major Second (1.125)', value: '1.125' },
          { name: 'Minor Third (1.2)', value: '1.2' },
          { name: 'Major Third (1.25)', value: '1.25' },
          { name: 'Perfect Fourth (1.333)', value: '1.333' },
          { name: 'Augmented Fourth (1.414)', value: '1.414' },
          { name: 'Perfect Fifth (1.5)', value: '1.5' },
          { name: 'Minor Sixth (1.6)', value: '1.6' },
          { name: 'Major Sixth (1.667)', value: '1.667' },
          { name: 'Minor Seventh (1.778)', value: '1.778' },
          { name: 'Major Seventh (1.875)', value: '1.875' },
          { name: 'Octave (2.0)', value: '2.0' },
          { name: 'Custom Ratio', value: 'custom' }
        ]
      }
    ]);
    
    if (scaleRatio === 'custom') {
      const { customRatio } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customRatio',
          message: 'Enter your custom ratio (e.g., 1.42):\n>>>',
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
  } else if (scaleType === 'fibonacci') {
    scaleInfo.method = 'fibonacci';
    
    console.log(chalk.bold.yellow("\n📝 Fibonacci Scale Information:"));
    console.log(chalk.yellow("The Fibonacci scale uses the Golden Ratio (1.618) to generate a harmonious sequence."));
    console.log(chalk.yellow("Each value is approximately 1.618 times the previous value."));
    console.log(chalk.yellow("This creates a natural, pleasing progression that follows the Fibonacci sequence."));
    console.log(chalk.yellow("Example: Starting with 16px, the sequence would be:"));
    console.log(chalk.yellow("• 16px (base)"));
    console.log(chalk.yellow("• 26px (16 × 1.618)"));
    console.log(chalk.yellow("• 42px (26 × 1.618)"));
    const { baseValue } = await inquirer.prompt([
      {
        type: 'input',
        name: 'baseValue',
        message: 'Enter the base size (starting value):\n>>>',
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
    scaleInfo.ratio = 1.618; // Golden Ratio
  } else if (scaleType === 'custom') {
    scaleInfo.method = 'custom';
    
    const { baseValue } = await inquirer.prompt([
      {
        type: 'input',
        name: 'baseValue',
        message: 'Enter the base size:\n>>>',
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
        message: 'Enter the custom step increment:\n>>>',
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
  }

  console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Unit`));
  
  const { sizingUnit } = await inquirer.prompt([
    {
      type: 'list',
      name: 'sizingUnit',
      message: 'Choose the unit for font sizes:\n>>>',
      choices: ['px', 'rem', 'em'],
      default: 'px'
    }
  ]);
  
  scaleInfo.unit = sizingUnit;
  
  const { totalSizes } = await inquirer.prompt([
    {
      type: 'input',
      name: 'totalSizes',
      message: 'How many font sizes do you want to create? (min: 1, max: 12):\n>>>',
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
        $value: `${sizes[index]}${scaleInfo.unit}`, 
        $type: 'fontSize' 
      };
    }
  });

  console.log(chalk.bold.yellowBright("\n📋 Font Size Settings Summary:"));

  // Add note about minimum font size
  console.log(chalk.yellow("\n⚠️  Note: For accessibility, the minimum font size is enforced at 12px (or its rem/em equivalent). \nIf your scale would generate a smaller value, it will be clamped to this minimum.\n"));

  console.log(createSettingsTable([
    ["Token Name", customPropertyName],
    ["Naming Convention", getDescriptiveName('namingConvention', namingConvention)],
    ["Scale Type", getDescriptiveName('scaleType', scaleType)],
    ["Number of Font Sizes", numSizes.toString()],
    ["Unit", scaleInfo.unit]
  ]));

  console.log(chalk.bold.yellowBright("\n📏 Font Sizes:"));
  console.log(createValuesTable(fontSizes));
  
  const { confirmFontSize } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmFontSize",
      message: "Would you like to continue with these font size settings?\n>>>",
      default: true
    }
  ]);

  if (!confirmFontSize) {
    console.log(chalk.bold.yellow("\n↺ Let's reconfigure your font size settings..."));
    return await setupFontSize(currentStep);
  }
  
  return { fontSizes, propertyName: customPropertyName };
}

export async function setupFontWeight(currentStep) {
  const tokenNames = weightOptions.map(opt => opt.name.toLowerCase().replace(' ', ''));
  let substep = 0;
  console.log(chalk.bold.bgRedBright("\n========================================"));
  console.log(chalk.bold(`🔠 STEP ${currentStep}: FONT WEIGHT`));
  console.log(chalk.bold.bgRedBright("========================================\n"));
  
  await showAccessibilityNotes('fontWeight');

  console.log(chalk.bold.yellowBright(`🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Property Naming`));
  const customPropertyName = await promptForPropertyName(
    'font weight',
    [
      { name: 'fontWeight', value: 'fontWeight' },
      { name: 'font-weight', value: 'font-weight' },
      { name: 'font_weight', value: 'font_weight' },
      { name: 'fw', value: 'fw' },
      { name: 'custom', value: 'custom' }
    ],
    'fontWeight',
    'weightScale, weightType'
  );

  console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Define Font Weight Values`));
  const { selectedWeights } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedWeights',
      message: 'Select the font weights to include in your design system:\n>>>',
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
  selectedWeights.forEach(weight => {
    fontWeight[weight.name] = {
      $value: weight.value,
      $type: "fontWeight"
    };
  });

  console.log(chalk.bold.yellowBright("\n📋 Font Weight Settings Summary:"));
  console.log(createSettingsTable([
    ["Token Name", customPropertyName],
    ["Number of Weights", selectedWeights.length.toString()]
  ]));

  console.log(chalk.bold.yellowBright("\n📏 Font Weights:"));
  console.log(createValuesTable(fontWeight));

  const { confirmFontWeight } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmFontWeight",
      message: "Would you like to continue with these font weight settings?\n>>>",
      default: true
    }
  ]);

  if (!confirmFontFontWeight) {
    console.log(chalk.bold.yellow("\n↺ Let's reconfigure your font weight settings..."));
    return await setupFontWeight(currentStep);
  }
  
  return { fontWeight, propertyName: customPropertyName };
}

export async function setupLetterSpacing(currentStep) {
  let substep = 0;
  console.log(chalk.bold.bgRedBright("\n========================================"));
  console.log(chalk.bold(`🔠 STEP ${currentStep}: LETTER SPACING`));
  console.log(chalk.bold.bgRedBright("========================================\n"));
  
  await showAccessibilityNotes('letterSpacing');

  console.log(chalk.bold.yellowBright(`🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Property Naming`));
  const customPropertyName = await promptForPropertyName(
    'letter spacing',
    [
      { name: 'letterSpacing', value: 'letterSpacing' },
      { name: 'letter-spacing', value: 'letter-spacing' },
      { name: 'letter_spacing', value: 'letter_spacing' },
      { name: 'tracking', value: 'tracking' },
      { name: 'ls', value: 'ls' },
      { name: 'custom', value: 'custom' }
    ],
    'letterSpacing',
    'spacingScale, spacingType'
  );

  console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Naming Convention`));
  const { namingConvention } = await inquirer.prompt([
    {
      type: 'list',
      name: 'namingConvention',
      message: 'Choose a naming convention for your letter spacing tokens:\n>>>',
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
      message: 'How many letter spacing values do you want to create? (1-7):\n>>>',
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
      message: 'Choose the scale type for letter spacing values:\n>>>',
      choices: [
        { name: 'Predetermined Scale (-1.25%, 0%, 1.25%, 2.5%)', value: 'predetermined' },
        { name: 'Custom Values', value: 'custom' }
      ]
    }
  ]);

  if (scaleType === 'predetermined') {
    console.log(chalk.yellow("\n📝 Predetermined Scale Information:"));
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
      message: 'Choose the unit for letter spacing values:\n>>>',
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
          message: `Enter value ${i + 1} of ${totalValues}:\n>>>`,
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
      $value: values[i],
      $type: 'letterSpacing'
    };
  }

  console.log(chalk.bold.yellowBright("\n📋 Letter Spacing Settings Summary:"));
  console.log(createSettingsTable([
    ["Token Name", customPropertyName],
    ["Scale Type", scaleType === 'predetermined' ? 'Predetermined Scale' : 'Custom Values'],
    ["Unit", unit],
    ["Number of Values", totalValues.toString()]
  ]));

  console.log(chalk.bold.yellowBright("\n📏 Letter Spacing Values:"));
  console.log(createValuesTable(letterSpacing));

  const { confirmLetterSpacing } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmLetterSpacing",
      message: "Would you like to continue with these letter spacing settings?\n>>>",
      default: true
    }
  ]);

  if (!confirmLetterSpacing) {
    console.log(chalk.bold.yellow("\n↺ Let's reconfigure your letter spacing settings..."));
    return await setupLetterSpacing(currentStep);
  }
  
  return { letterSpacing, propertyName: customPropertyName };
}

export async function setupLineHeight(currentStep) {
  let substep = 0;
  console.log(chalk.bold.bgRedBright("\n========================================"));
  console.log(chalk.bold(`🔠 STEP ${currentStep}: LINE HEIGHT`));
  console.log(chalk.bold.bgRedBright("========================================\n"));
  
  await showAccessibilityNotes('lineHeight');

  console.log(chalk.bold.yellowBright(`🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Property Naming`));
  const customPropertyName = await promptForPropertyName(
    'line height',
    [
      { name: 'lineHeight', value: 'lineHeight' },
      { name: 'line-height', value: 'line-height' },
      { name: 'line_height', value: 'line_height' },
      { name: 'leading', value: 'leading' },
      { name: 'lh', value: 'lh' },
      { name: 'custom', value: 'custom' }
    ],
    'lineHeight',
    'leadingScale, lineSpacing'
  );

  console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Naming Convention`));
  const { namingConvention } = await inquirer.prompt([
    {
      type: 'list',
      name: 'namingConvention',
      message: 'Choose a naming convention for your line height tokens:\n>>>',
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
      message: 'Choose the scale type for line height values:\n>>>',
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
          message: `Enter value ${i + 1} of 5:\n>>>`,
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
      $value: lineHeightValues[index],
      $type: 'lineHeight'
    };
  });

  console.log(chalk.bold.yellowBright("\n📋 Line Height Settings Summary:"));
  console.log(createSettingsTable([
    ["Token Name", customPropertyName],
    ["Scale Type", scaleType === 'scale1' ? 'Predetermined Scale 1' :
                   scaleType === 'scale2' ? 'Predetermined Scale 2' :
                   'Custom Values'],
    ["Number of Values", lineHeightValues.length.toString()]
  ]));

  console.log(chalk.bold.yellowBright("\n📏 Line Height Values:"));
  console.log(createValuesTable(lineHeight));

  const { confirmLineHeight } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmLineHeight",
      message: "Would you like to continue with these line height settings?\n>>>",
      default: true
    }
  ]);

  if (!confirmLineHeight) {
    console.log(chalk.bold.yellow("\n↺ Let's reconfigure your line height settings..."));
    return await setupLineHeight(currentStep);
  }
  
  return { lineHeight, propertyName: customPropertyName };
}
