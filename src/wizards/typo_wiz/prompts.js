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

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?\n>>>",
      choices: [
        { name: "✅ Accept these values", value: "accept" },
        { name: "↺ Start over", value: "restart" }
      ]
    }
  ]);

  if (action === "restart") {
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

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?\n>>>",
      choices: [
        { name: "✅ Accept these values", value: "accept" },
        { name: "↺ Start over", value: "restart" }
      ]
    }
  ]);

  if (action === "restart") {
    console.log(chalk.bold.yellow("\n↺ Let's reconfigure your font size settings..."));
    return await setupFontSize(currentStep);
  }
  
  return { fontSizes, propertyName: customPropertyName };
}

export async function setupFontWeight(currentStep) {
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

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?\n>>>",
      choices: [
        { name: "✅ Accept these values", value: "accept" },
        { name: "↺ Start over", value: "restart" }
      ]
    }
  ]);

  if (action === "restart") {
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

  // Configure naming options based on convention
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
          { name: '100 in 100 (e.g., 100, 200, 300, 400)', value: 100 },
          { name: '50 in 50 (e.g., 50, 100, 150, 200)', value: 50 },
          { name: '25 in 25 (e.g., 25, 50, 75, 100)', value: 25 },
          { name: '10 in 10 (e.g., 10, 20, 30, 40)', value: 10 }
        ]
      }
    ]);
    namingOptions.increment = increment;
  } else if (namingConvention === 'alphabetical') {
    const { alphabeticalCase } = await inquirer.prompt([
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
    namingOptions.case = alphabeticalCase;
  }

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

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?\n>>>",
      choices: [
        { name: "✅ Accept these values", value: "accept" },
        { name: "↺ Start over", value: "restart" }
      ]
    }
  ]);

  if (action === "restart") {
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

  // Configure naming options if needed
  let namingOptions = {};
  if (namingConvention === 'ordinal') {
    const { ordinalFormat } = await inquirer.prompt([
      {
        type: 'list',
        name: 'ordinalFormat',
        message: 'For Ordinal scale, choose the format:\n>>>',
        choices: [
          { name: 'Padded (e.g., 01, 02, 03)', value: 'padded' },
          { name: 'Unpadded (e.g., 1, 2, 3)', value: 'unpadded' }
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
          { name: '100 in 100 (e.g., 100, 200, 300)', value: 100 },
          { name: '50 in 50 (e.g., 50, 100, 150)', value: 50 },
          { name: '25 in 25 (e.g., 25, 50, 75)', value: 25 },
          { name: '10 in 10 (e.g., 10, 20, 30)', value: 10 }
        ]
      }
    ]);
    namingOptions.increment = increment;
  }

  console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Define Number of Values`));
  const { numValues } = await inquirer.prompt([
    {
      type: 'input',
      name: 'numValues',
      message: 'How many line height values do you want to create? (3-7):\n>>>',
      default: '5',
      validate: (input) => {
        const num = parseInt(input);
        if (isNaN(num) || num < 3 || num > 7) {
          return 'Please enter a number between 3 and 7';
        }
        return true;
      }
    }
  ]);

  const totalValues = parseInt(numValues);

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
  const allScale1Values = ['1.1', '1.25', '1.5', '1.6', '1.75', '2.0'];
  const allScale2Values = ['1.0', '1.2', '1.5', '1.6', '2.0'];

  if (scaleType === 'scale1') {
    console.log(chalk.yellow("\n📝 Scale 1 Available Values:"));
    console.log(chalk.yellow("• 1.1 - Tight spacing, good for headings"));
    console.log(chalk.yellow("• 1.25 - Slightly tight, good for subheadings"));
    console.log(chalk.yellow("• 1.5 - Standard body text"));
    console.log(chalk.yellow("• 1.6 - Slightly loose, good for long text"));
    console.log(chalk.yellow("• 1.75 - Loose spacing, good for readability"));
    console.log(chalk.yellow("• 2.0 - Very loose, good for maximum readability"));

    // Select values based on totalValues, spreading evenly across the scale
    if (totalValues >= allScale1Values.length) {
      lineHeightValues = [...allScale1Values];
    } else {
      // Pick evenly spaced values
      const step = (allScale1Values.length - 1) / (totalValues - 1);
      for (let i = 0; i < totalValues; i++) {
        const index = Math.round(i * step);
        lineHeightValues.push(allScale1Values[index]);
      }
    }
  } else if (scaleType === 'scale2') {
    console.log(chalk.yellow("\n📝 Scale 2 Available Values:"));
    console.log(chalk.yellow("• 1.0 - Very tight, good for display text"));
    console.log(chalk.yellow("• 1.2 - Tight, good for headings"));
    console.log(chalk.yellow("• 1.5 - Standard body text"));
    console.log(chalk.yellow("• 1.6 - Slightly loose, good for long text"));
    console.log(chalk.yellow("• 2.0 - Very loose, good for maximum readability"));

    // Select values based on totalValues, spreading evenly across the scale
    if (totalValues >= allScale2Values.length) {
      lineHeightValues = [...allScale2Values];
    } else {
      // Pick evenly spaced values
      const step = (allScale2Values.length - 1) / (totalValues - 1);
      for (let i = 0; i < totalValues; i++) {
        const index = Math.round(i * step);
        lineHeightValues.push(allScale2Values[index]);
      }
    }
  } else {
    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Define your custom values:`));
    console.log(chalk.yellow("\n📝 Line Height Guidelines:"));
    console.log(chalk.yellow("• Values below 1.0 are rarely used"));
    console.log(chalk.yellow("• 1.0-1.2 for tight spacing (headings)"));
    console.log(chalk.yellow("• 1.2-1.5 for normal spacing (body text)"));
    console.log(chalk.yellow("• 1.5-2.0 for loose spacing (long text)"));
    console.log(chalk.yellow("• Values above 2.0 are rarely needed"));

    const defaultValues = ['1.0', '1.2', '1.5', '1.6', '1.75', '2.0'];
    for (let i = 0; i < totalValues; i++) {
      const { customValue } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customValue',
          message: `Enter value ${i + 1} of ${totalValues}:\n>>>`,
          default: defaultValues[i] || '1.5',
          validate: input => {
            if (!/^\d*\.?\d+$/.test(input)) return 'Please enter a valid number';
            const value = parseFloat(input);
            if (value < 1.0) return 'Line height should be greater than or equal to 1.0';
            if (value > 3.0) return 'Values above 3.0 are rarely needed';
            return true;
          }
        }
      ]);
      lineHeightValues.push(customValue);
    }
  }

  let tokenNames = [];
  if (namingConvention === 'tshirt') {
    const allTshirtSizes = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    if (totalValues === 3) {
      tokenNames = ['sm', 'md', 'lg'];
    } else if (totalValues === 5) {
      tokenNames = ['xs', 'sm', 'md', 'lg', 'xl'];
    } else if (totalValues === 7) {
      tokenNames = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    } else {
      tokenNames = allTshirtSizes.slice(0, totalValues);
    }
  } else if (namingConvention === 'semantic') {
    const allSemanticNames = ['tightest', 'tight', 'normal', 'loose', 'looser', 'loosest', 'spacious'];
    if (totalValues === 3) {
      tokenNames = ['tight', 'normal', 'loose'];
    } else if (totalValues === 5) {
      tokenNames = ['tight', 'normal', 'loose', 'looser', 'spacious'];
    } else {
      tokenNames = allSemanticNames.slice(0, totalValues);
    }
  } else if (namingConvention === 'ordinal') {
    for (let i = 1; i <= totalValues; i++) {
      const numberPart = namingOptions.format === 'padded' ? i.toString().padStart(2, '0') : i.toString();
      tokenNames.push(numberPart);
    }
  } else if (namingConvention === 'incremental') {
    for (let i = 1; i <= totalValues; i++) {
      tokenNames.push((i * namingOptions.increment).toString());
    }
  } else if (namingConvention === 'purpose') {
    const allPurposeNames = ['display', 'heading', 'subheading', 'body', 'caption', 'comfortable', 'spacious'];
    tokenNames = allPurposeNames.slice(0, totalValues);
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

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?\n>>>",
      choices: [
        { name: "✅ Accept these values", value: "accept" },
        { name: "↺ Start over", value: "restart" }
      ]
    }
  ]);

  if (action === "restart") {
    console.log(chalk.bold.yellow("\n↺ Let's reconfigure your line height settings..."));
    return await setupLineHeight(currentStep);
  }
  
  return { lineHeight, propertyName: customPropertyName };
}

export async function setupCompositeStyles(currentStep, availableTokens) {
  console.log(chalk.bold.bgRedBright("\n========================================"));
  console.log(chalk.bold(`🎨 STEP ${currentStep}: COMPOSITE TEXT STYLES`));
  console.log(chalk.bold.bgRedBright("========================================\n"));

  console.log(chalk.yellowBright("Composite text styles combine multiple typography properties into complete text styles."));
  console.log(chalk.yellowBright("These are similar to Figma's text styles and are useful for defining consistent text patterns."));
  console.log(chalk.yellowBright("\nExample: A 'heading-1' style might combine:"));
  console.log(chalk.yellow("  • Font Family: primary"));
  console.log(chalk.yellow("  • Font Size: xl"));
  console.log(chalk.yellow("  • Font Weight: bold"));
  console.log(chalk.yellow("  • Line Height: tight"));
  console.log(chalk.yellow("  • Letter Spacing: sm\n"));

  const { createComposite } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'createComposite',
      message: 'Would you like to create composite text styles?\n>>>',
      default: true
    }
  ]);

  if (!createComposite) {
    return null;
  }

  let substep = 0;
  console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Property Naming`));
  const customPropertyName = await promptForPropertyName(
    'composite text styles',
    [
      { name: 'textStyles', value: 'textStyles' },
      { name: 'text-styles', value: 'text-styles' },
      { name: 'text_styles', value: 'text_styles' },
      { name: 'styles', value: 'styles' },
      { name: 'typography', value: 'typography' },
      { name: 'custom', value: 'custom' }
    ],
    'textStyles',
    'designStyles, typeStyles'
  );

  console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Style Generation Method`));
  const { styleMethod } = await inquirer.prompt([
    {
      type: 'list',
      name: 'styleMethod',
      message: 'How would you like to create your text styles?\n>>>',
      choices: [
        { name: 'Preset Styles (heading-1, body, caption, etc.)', value: 'preset' },
        { name: 'Scale-Based Styles (use naming convention for headings/body)', value: 'scale' },
        { name: 'Custom Individual Styles', value: 'custom' }
      ]
    }
  ]);

  let compositeStyles = {};

  if (styleMethod === 'preset') {
    // Define common text style presets
    const presetStyles = {
      'heading-1': { usage: 'Large page headings', category: 'heading' },
      'heading-2': { usage: 'Section headings', category: 'heading' },
      'heading-3': { usage: 'Subsection headings', category: 'heading' },
      'heading-4': { usage: 'Small headings', category: 'heading' },
      'heading-5': { usage: 'Minor headings', category: 'heading' },
      'heading-6': { usage: 'Smallest headings', category: 'heading' },
      'body': { usage: 'Main body text', category: 'body' },
      'body-large': { usage: 'Larger body text', category: 'body' },
      'body-small': { usage: 'Smaller body text', category: 'body' },
      'caption': { usage: 'Captions and fine print', category: 'utility' },
      'overline': { usage: 'Overline text (all caps, small)', category: 'utility' },
      'button': { usage: 'Button labels', category: 'utility' },
      'label': { usage: 'Form labels', category: 'utility' }
    };

    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Select Preset Styles`));
    const { selectedPresets } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedPresets',
        message: 'Select which preset text styles to include:\n>>>',
        choices: Object.entries(presetStyles).map(([name, info]) => ({
          name: `${name} - ${info.usage}`,
          value: name,
          checked: ['heading-1', 'heading-2', 'heading-3', 'body'].includes(name)
        })),
        validate: (answer) => {
          if (answer.length < 1) {
            return chalk.bold.red('🚫 Please select at least one text style.');
          }
          return true;
        }
      }
    ]);

    // Now configure each preset
    for (const styleName of selectedPresets) {
      console.log(chalk.bold.yellowBright(`\n📝 Configuring: ${styleName}`));
      console.log(chalk.gray(`Usage: ${presetStyles[styleName].usage}`));

      const styleConfig = await configureTextStyle(styleName, availableTokens);
      compositeStyles[styleName] = styleConfig;
    }

  } else if (styleMethod === 'scale') {
    // Scale-based approach with naming conventions
    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Choose Style Categories`));
    const { selectedCategories } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedCategories',
        message: 'Which style categories do you want to create?\n>>>',
        choices: [
          { name: 'Headings (display/title styles)', value: 'heading', checked: true },
          { name: 'Body Text (paragraph/content styles)', value: 'body', checked: true },
          { name: 'Display (hero/featured text)', value: 'display', checked: false },
          { name: 'UI Elements (buttons, labels, captions)', value: 'ui', checked: false }
        ],
        validate: (answer) => {
          if (answer.length < 1) {
            return 'Please select at least one category';
          }
          return true;
        }
      }
    ]);

    for (const category of selectedCategories) {
      console.log(chalk.bold.yellowBright(`\n📝 Configuring ${category.charAt(0).toUpperCase() + category.slice(1)} Styles`));

      const { namingConvention } = await inquirer.prompt([
        {
          type: 'list',
          name: 'namingConvention',
          message: `Choose naming convention for ${category} styles:\n>>>`,
          choices: [
            { name: 'T-shirt sizes (xs, sm, md, lg, xl)', value: 'tshirt' },
            { name: 'Ordinal (1, 2, 3, 4, 5)', value: 'ordinal' },
            { name: 'Semantic (tight, normal, loose)', value: 'semantic' },
            { name: 'Incremental (100, 200, 300)', value: 'incremental' }
          ]
        }
      ]);

      const { numStyles } = await inquirer.prompt([
        {
          type: 'input',
          name: 'numStyles',
          message: `How many ${category} styles? (3-7):\n>>>`,
          default: category === 'heading' ? '5' : '3',
          validate: (input) => {
            const num = parseInt(input);
            if (isNaN(num) || num < 3 || num > 7) {
              return 'Please enter a number between 3 and 7';
            }
            return true;
          }
        }
      ]);

      const totalStyles = parseInt(numStyles);
      let styleNames = [];

      // Generate style names based on convention
      if (namingConvention === 'tshirt') {
        const tshirtSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
        styleNames = tshirtSizes.slice(0, totalStyles);
      } else if (namingConvention === 'ordinal') {
        for (let i = 1; i <= totalStyles; i++) {
          styleNames.push(i.toString());
        }
      } else if (namingConvention === 'semantic') {
        const semanticNames = ['tight', 'normal', 'loose', 'relaxed', 'spacious', 'airy', 'open'];
        styleNames = semanticNames.slice(0, totalStyles);
      } else if (namingConvention === 'incremental') {
        for (let i = 1; i <= totalStyles; i++) {
          styleNames.push((i * 100).toString());
        }
      }

      // Configure each style in the category
      for (const scaleName of styleNames) {
        const fullStyleName = `${category}-${scaleName}`;
        console.log(chalk.bold.yellowBright(`\n📝 Configuring: ${fullStyleName}`));

        const styleConfig = await configureTextStyle(fullStyleName, availableTokens);
        compositeStyles[fullStyleName] = styleConfig;
      }
    }

  } else {
    // Custom styles
    console.log(chalk.bold.yellowBright(`\n🏷️ Step ${currentStep}${String.fromCharCode(65 + substep++)}: Define Custom Styles`));
    const { numStyles } = await inquirer.prompt([
      {
        type: 'input',
        name: 'numStyles',
        message: 'How many custom text styles do you want to create? (1-10):\n>>>',
        default: '3',
        validate: (input) => {
          const num = parseInt(input);
          if (isNaN(num) || num < 1 || num > 10) {
            return 'Please enter a number between 1 and 10';
          }
          return true;
        }
      }
    ]);

    const totalStyles = parseInt(numStyles);

    for (let i = 0; i < totalStyles; i++) {
      const { styleName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'styleName',
          message: `Enter name for text style ${i + 1} of ${totalStyles} (e.g., hero-title, card-body):\n>>>`,
          validate: input => {
            if (input.trim() === '') return 'Please enter a valid name';
            if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(input)) {
              return 'Names must start with a letter and can only contain letters, numbers, and hyphens';
            }
            if (compositeStyles[input.trim()]) {
              return 'This name already exists. Please choose a different name.';
            }
            return true;
          }
        }
      ]);

      const styleConfig = await configureTextStyle(styleName.trim(), availableTokens);
      compositeStyles[styleName.trim()] = styleConfig;
    }
  }

  // Preview all composite styles
  console.log(chalk.bold.yellowBright("\n📋 Composite Text Styles Summary:"));
  console.log(createSettingsTable([
    ["Token Name", customPropertyName],
    ["Number of Styles", Object.keys(compositeStyles).length.toString()]
  ]));

  console.log(chalk.bold.yellowBright("\n🎨 Text Styles:"));
  const compositeTable = new Table({
    head: [chalk.bold("Style Name"), chalk.bold("Properties")],
    style: { head: ["red"], border: ["red"] },
    wordWrap: true,
    colWidths: [25, 60]
  });

  Object.entries(compositeStyles).forEach(([name, style]) => {
    const props = [];
    if (style.$value.fontFamily) props.push(`Font Family: ${style.$value.fontFamily}`);
    if (style.$value.fontSize) props.push(`Font Size: ${style.$value.fontSize}`);
    if (style.$value.fontWeight) props.push(`Font Weight: ${style.$value.fontWeight}`);
    if (style.$value.lineHeight) props.push(`Line Height: ${style.$value.lineHeight}`);
    if (style.$value.letterSpacing) props.push(`Letter Spacing: ${style.$value.letterSpacing}`);
    compositeTable.push([name, props.join('\n')]);
  });

  console.log(compositeTable.toString());

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?\n>>>",
      choices: [
        { name: "✅ Accept these styles", value: "accept" },
        { name: "↺ Start over", value: "restart" }
      ]
    }
  ]);

  if (action === "restart") {
    console.log(chalk.bold.yellow("\n↺ Let's reconfigure your composite text styles..."));
    return await setupCompositeStyles(currentStep, availableTokens);
  }

  return { compositeStyles, propertyName: customPropertyName };
}

async function configureTextStyle(styleName, availableTokens, autoSuggest = true) {
  const style = {
    $type: "typography",
    $value: {}
  };

  const availableProperties = [];
  if (availableTokens.fontFamily) availableProperties.push('fontFamily');
  if (availableTokens.fontSize) availableProperties.push('fontSize');
  if (availableTokens.fontWeight) availableProperties.push('fontWeight');
  if (availableTokens.lineHeight) availableProperties.push('lineHeight');
  if (availableTokens.letterSpacing) availableProperties.push('letterSpacing');

  // Auto-suggest smart defaults based on style name
  let suggestedValues = null;
  if (autoSuggest) {
    suggestedValues = suggestTokenCombination(styleName, availableTokens);
  }

  if (suggestedValues) {
    console.log(chalk.bold.greenBright("\n💡 Smart Suggestion:"));
    const suggestionTable = new Table({
      head: [chalk.bold("Property"), chalk.bold("Suggested Value")],
      style: { head: ["green"], border: ["green"] },
      colWidths: [20, 40]
    });

    Object.entries(suggestedValues).forEach(([prop, tokenName]) => {
      const tokens = availableTokens[prop];
      if (tokens && tokens[tokenName]) {
        const propLabel = prop === 'fontFamily' ? 'Font Family' :
                          prop === 'fontSize' ? 'Font Size' :
                          prop === 'fontWeight' ? 'Font Weight' :
                          prop === 'lineHeight' ? 'Line Height' :
                          'Letter Spacing';
        suggestionTable.push([propLabel, `${tokenName} (${tokens[tokenName].$value})`]);
      }
    });

    console.log(suggestionTable.toString());

    const { useSuggestion } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useSuggestion',
        message: 'Would you like to use this smart suggestion?\n>>>',
        default: true
      }
    ]);

    if (useSuggestion) {
      // Apply suggestions only for properties that were configured
      Object.entries(suggestedValues).forEach(([prop, tokenName]) => {
        const tokens = availableTokens[prop];
        // Only add if the property was actually configured
        if (tokens && Object.keys(tokens).length > 0 && tokens[tokenName]) {
          const propertyName = availableTokens[`${prop}Name`] || prop;
          style.$value[prop] = `{typography.${propertyName}.${tokenName}}`;
        }
      });
      return style;
    }
  }

  // Manual configuration
  const { selectedProperties } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedProperties',
      message: `Which properties do you want to include in "${styleName}"?\n>>>`,
      choices: [
        { name: 'Font Family', value: 'fontFamily', checked: availableProperties.includes('fontFamily') },
        { name: 'Font Size', value: 'fontSize', checked: availableProperties.includes('fontSize') },
        { name: 'Font Weight', value: 'fontWeight', checked: availableProperties.includes('fontWeight') },
        { name: 'Line Height', value: 'lineHeight', checked: availableProperties.includes('lineHeight') },
        { name: 'Letter Spacing', value: 'letterSpacing', checked: availableProperties.includes('letterSpacing') }
      ].filter(prop => availableProperties.includes(prop.value)),
      validate: (answer) => {
        if (answer.length < 1) {
          return 'Please select at least one property for this text style';
        }
        return true;
      }
    }
  ]);

  // For each selected property, let user choose a token reference
  for (const prop of selectedProperties) {
    const tokens = availableTokens[prop];

    // Skip if tokens don't exist (property wasn't configured initially)
    if (!tokens || Object.keys(tokens).length === 0) {
      console.log(chalk.yellow(`⚠️  Skipping ${prop} - not configured in your token set`));
      continue;
    }

    const tokenNames = Object.keys(tokens);

    const propLabel = prop === 'fontFamily' ? 'Font Family' :
                      prop === 'fontSize' ? 'Font Size' :
                      prop === 'fontWeight' ? 'Font Weight' :
                      prop === 'lineHeight' ? 'Line Height' :
                      'Letter Spacing';

    // Get suggested default if available
    const suggestedDefault = suggestedValues && suggestedValues[prop] ? suggestedValues[prop] : tokenNames[0];

    const { selectedToken } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedToken',
        message: `Select ${propLabel} for "${styleName}":\n>>>`,
        choices: tokenNames.map(name => ({
          name: `${name} (${tokens[name].$value})`,
          value: name
        })),
        default: suggestedDefault
      }
    ]);

    // Create token reference
    const propertyName = availableTokens[`${prop}Name`] || prop;
    style.$value[prop] = `{typography.${propertyName}.${selectedToken}}`;
  }

  return style;
}

function suggestTokenCombination(styleName, availableTokens) {
  const suggestions = {};

  // Parse style name to understand intent
  const nameLower = styleName.toLowerCase();
  const isHeading = nameLower.includes('heading') || nameLower.includes('title') || nameLower.includes('h1') || nameLower.includes('h2') || nameLower.includes('h3');
  const isDisplay = nameLower.includes('display') || nameLower.includes('hero');
  const isBody = nameLower.includes('body') || nameLower.includes('paragraph');
  const isSmall = nameLower.includes('small') || nameLower.includes('caption') || nameLower.includes('xs');
  const isLarge = nameLower.includes('large') || nameLower.includes('xl') || nameLower.includes('2xl') || nameLower.includes('3xl');

  // Suggest Font Size
  if (availableTokens.fontSize && Object.keys(availableTokens.fontSize).length > 0) {
    const sizeTokens = Object.keys(availableTokens.fontSize);
    let suggested = null;
    if (isDisplay || (isHeading && isLarge)) {
      suggested = findTokenByPattern(sizeTokens, ['3xl', '2xl', 'xl', 'xxl', 'xxxl']) || sizeTokens[sizeTokens.length - 1];
    } else if (isHeading) {
      if (nameLower.includes('1') || nameLower.includes('xl')) {
        suggested = findTokenByPattern(sizeTokens, ['xl', '2xl', 'lg']);
      } else if (nameLower.includes('2') || nameLower.includes('lg')) {
        suggested = findTokenByPattern(sizeTokens, ['lg', 'xl']);
      } else if (nameLower.includes('3') || nameLower.includes('md')) {
        suggested = findTokenByPattern(sizeTokens, ['md', 'lg']);
      } else {
        suggested = findTokenByPattern(sizeTokens, ['lg', 'xl']);
      }
    } else if (isSmall) {
      suggested = findTokenByPattern(sizeTokens, ['xs', 'sm', 'small']) || sizeTokens[0];
    } else if (isBody) {
      suggested = findTokenByPattern(sizeTokens, ['md', 'base', 'normal']);
    }
    if (suggested) suggestions.fontSize = suggested;
  }

  // Suggest Font Weight
  if (availableTokens.fontWeight && Object.keys(availableTokens.fontWeight).length > 0) {
    const weightTokens = Object.keys(availableTokens.fontWeight);
    let suggested = null;
    if (isHeading || isDisplay) {
      suggested = findTokenByPattern(weightTokens, ['bold', 'semibold', 'semi-bold', '700', '600']);
    } else if (isBody) {
      suggested = findTokenByPattern(weightTokens, ['regular', 'normal', '400']);
    } else if (nameLower.includes('button') || nameLower.includes('label')) {
      suggested = findTokenByPattern(weightTokens, ['medium', '500', 'semibold', '600']);
    }
    if (suggested) suggestions.fontWeight = suggested;
  }

  // Suggest Line Height
  if (availableTokens.lineHeight && Object.keys(availableTokens.lineHeight).length > 0) {
    const lineHeightTokens = Object.keys(availableTokens.lineHeight);
    let suggested = null;
    if (isHeading || isDisplay) {
      suggested = findTokenByPattern(lineHeightTokens, ['tight', 'xs', 'sm', '1', 'tightest']);
    } else if (isBody) {
      suggested = findTokenByPattern(lineHeightTokens, ['normal', 'md', 'base', '3', 'loose']);
    }
    if (suggested) suggestions.lineHeight = suggested;
  }

  // Suggest Letter Spacing
  if (availableTokens.letterSpacing && Object.keys(availableTokens.letterSpacing).length > 0) {
    const spacingTokens = Object.keys(availableTokens.letterSpacing);
    let suggested = null;
    if (isDisplay) {
      suggested = findTokenByPattern(spacingTokens, ['tight', 'sm', 'xs', '-1']);
    } else if (isHeading) {
      suggested = findTokenByPattern(spacingTokens, ['sm', 'normal', 'md', '0']);
    } else if (isBody) {
      suggested = findTokenByPattern(spacingTokens, ['normal', 'md', '0']);
    }
    if (suggested) suggestions.letterSpacing = suggested;
  }

  // Suggest Font Family (if available)
  if (availableTokens.fontFamily && Object.keys(availableTokens.fontFamily).length > 0) {
    const familyTokens = Object.keys(availableTokens.fontFamily);
    let suggested = null;
    if (familyTokens.length > 1) {
      if (isHeading || isDisplay) {
        suggested = findTokenByPattern(familyTokens, ['heading', 'display', 'primary', 'title', 'serif', '1']);
      } else if (isBody) {
        suggested = findTokenByPattern(familyTokens, ['body', 'text', 'primary', 'sans', 'sans-serif']);
      }
    } else if (familyTokens.length === 1) {
      // If there's only one font family, use it
      suggested = familyTokens[0];
    }
    if (suggested) suggestions.fontFamily = suggested;
  }

  // Only return suggestions if we found at least 2 properties
  return Object.keys(suggestions).length >= 2 ? suggestions : null;
}

function findTokenByPattern(tokens, patterns) {
  for (const pattern of patterns) {
    const found = tokens.find(token =>
      token.toLowerCase() === pattern.toLowerCase() ||
      token.toLowerCase().includes(pattern.toLowerCase())
    );
    if (found) return found;
  }
  return null;
}
