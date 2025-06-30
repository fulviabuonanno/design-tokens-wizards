import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from 'url';
import chalk from "chalk";
import Table from "cli-table3";

const versionArg = process.argv.find(arg => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Space Tokens Wizard - Version ${version}`));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const askForInput = async () => {
  
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("⭐️ STEP 1: BASE UNIT"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  console.log(chalk.yellowBright("ℹ️ The base unit for space tokens is set to 'px'."));
  const unit = 'px';

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 2: NAME YOUR TOKENS"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  const nameAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: '\ud83d\udcdd What name would you like to assign to your space tokens?\n>>>',
      choices: ['space', 'spacing', 'sp', 'spc', 'custom']
    }
  ]);
  let name;
  
  if (nameAnswer.name === 'custom') {
    const customNameAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'customName',
        message: '\ud83d\udcdd Please provide a name for your space tokens:\n>>>',
        validate: (input) => {
          if (!input) {
            return "❌ Name is required. Please provide a valid name.";
          } else if (!/^[a-zA-Z0-9.-]+$/.test(input)) {
            return "❌ Name should only contain letters, numbers, hyphens (-), and dots (.)";
          }
          return true;
        }
      }
    ]);
    name = customNameAnswer.customName;
  } else {
    name = nameAnswer.name;
  }

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 3: DEFINE SCALE"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  const scaleAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'scale',
      message: '\ud83d\udd22 Select the scale to use for your values:\n>>>',
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

  if (scaleAnswer.scale === 'info') {
    console.log(chalk.black.bgMagentaBright("\n======================================="));
    console.log(chalk.bold("📚 SCALE INFORMATION"));
    console.log(chalk.black.bgMagentaBright("=======================================\n"));

    const scaleInfoTable = new Table({
      head: [
        chalk.bold("Scale Name"),
        chalk.bold("Description"),
        chalk.bold("Examples")
      ],
      wordWrap: true,
      wrapOnWordBoundary: true,
      style: { head: ["magenta"], border: ["magenta"] },
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
    console.log(chalk.black.bgMagentaBright("\n=======================================\n"));
    const newScaleAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'scale',
        message: '\ud83d\udd22 Select the scale to use for your values:\n>>>',
        choices: [
          { name: '4-Point Grid System', value: '4' },
          { name: '8-Point Grid System', value: '8' },
          { name: 'Modular Scale (multiplier based)', value: 'modular' },
          { name: 'Custom Intervals', value: 'custom' },
          { name: 'Fibonacci Scale', value: 'fibonacci' }
        ]
      }
    ]);
    scaleAnswer.scale = newScaleAnswer.scale;
  }

  if (scaleAnswer.scale === 'modular') {
    console.log(chalk.yellowBright("\nℹ️ The modular scale creates a harmonious progression of values using a consistent ratio."));
    console.log(chalk.yellowBright("Each value is multiplied by the chosen ratio to create the next value in the sequence."));
    console.log(chalk.yellowBright("This creates a musical, proportional relationship between values, similar to musical intervals."));
    
    const { scaleRatio } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scaleRatio',
        message: 'Choose a ratio for the modular scale:\n>>>',
        choices: [
          { name: 'Minor Second (1.067) - Subtle, gentle progression', value: '1.067' },
          { name: 'Major Second (1.125) - Balanced, natural progression', value: '1.125' },
          { name: 'Minor Third (1.2) - Moderate, comfortable steps', value: '1.2' },
          { name: 'Major Third (1.25) - Strong, noticeable progression', value: '1.25' },
          { name: 'Perfect Fourth (1.333) - Classic, musical harmony', value: '1.333' },
          { name: 'Augmented Fourth (1.414) - Dynamic, energetic steps', value: '1.414' },
          { name: 'Perfect Fifth (1.5) - Bold, dramatic progression', value: '1.5' },
          { name: 'Minor Sixth (1.6) - Expressive, wide steps', value: '1.6' },
          { name: 'Major Sixth (1.667) - Powerful, impactful progression', value: '1.667' },
          { name: 'Minor Seventh (1.778) - Dramatic, large steps', value: '1.778' },
          { name: 'Major Seventh (1.875) - Bold, significant progression', value: '1.875' },
          { name: 'Octave (2.0) - Doubling, dramatic contrast', value: '2.0' },
          { name: 'Custom Ratio - Define your own progression', value: 'custom' }
        ]
      }
    ]);

    console.log(chalk.yellowBright("\nℹ️ The base value determines where your scale begins."));
    console.log(chalk.yellowBright("This will be the first value in your sequence, and all subsequent values will be calculated from it."));
    
    const modularBaseAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'multiplier',
        message: 'Enter the starting value to build your modular scale (e.g. 4):\n>>>',
        validate: (input) => {
          const num = parseFloat(input);
          return (isNaN(num) || num <= 0) ? "Please enter a valid positive number." : true;
        }
      }
    ]);
    
    let factor;
    if (scaleRatio === 'custom') {
      console.log(chalk.yellowBright("\nℹ️ The multiplication factor determines how quickly your values increase."));
      console.log(chalk.yellowBright("A larger factor creates bigger jumps between values, while a smaller factor creates more subtle progression."));
      
      const customFactorAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'factor',
          message: 'Enter the multiplication factor (e.g. 1.5):\n>>>',
          validate: (input) => {
            const num = parseFloat(input);
            return (isNaN(num) || num <= 0) ? "Please enter a valid positive number." : true;
          }
        }
      ]);
      factor = parseFloat(customFactorAnswer.factor);
    } else {
      factor = parseFloat(scaleRatio);
    }

    scaleAnswer.multiplier = parseFloat(modularBaseAnswer.multiplier);
    scaleAnswer.factor = factor;
  } else if (scaleAnswer.scale === 'custom') {
    console.log(chalk.yellowBright("\nℹ️ Custom intervals allow you to define your own progression of values."));
    console.log(chalk.yellowBright("You'll set a starting value and a step interval to create your unique scale."));
    console.log(chalk.yellowBright("This gives you complete control over the spacing between values."));
    
    const customBaseAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'base',
        message: 'Enter the starting value for your custom intervals (e.g. 4):\n>>>',
        validate: (input) => {
          const num = parseFloat(input);
          return (isNaN(num) || num <= 0) ? "Please enter a valid positive number." : true;
        }
      }
    ]);
    const customStepAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'step',
        message: 'Enter the step interval (e.g. 6):\n>>>',
        validate: (input) => {
          const num = parseFloat(input);
          return (isNaN(num) || num <= 0) ? "Please enter a valid positive number." : true;
        }
      }
    ]);
    
    scaleAnswer.customIntervals = {
      base: parseFloat(customBaseAnswer.base),
      step: parseFloat(customStepAnswer.step)
    };
  } else if (scaleAnswer.scale === 'fibonacci') {
    console.log(chalk.yellowBright("\nℹ️ The Fibonacci scale uses the Golden Ratio (≈1.618) to create a natural progression."));
    console.log(chalk.yellowBright("This ratio is found throughout nature and is considered aesthetically pleasing."));
    console.log(chalk.yellowBright("Each value is approximately 1.618 times the previous value, creating a harmonious sequence."));
    console.log(chalk.yellowBright("This scale is perfect for creating organic, natural-feeling designs."));
    
    const fibonacciBaseAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'fibonacciBase',
        message: 'Enter a base value for your Fibonacci scale:\n>>>',
        validate: (input) => {
          const num = parseFloat(input);
          return (isNaN(num) || num <= 0) ? "Please enter a valid positive number." : true;
        }
      }
    ]);
    scaleAnswer.fibonacciBase = parseFloat(fibonacciBaseAnswer.fibonacciBase);
  }

  const scale = scaleAnswer.scale;

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 4: DEFINE NUMBER OF VALUES"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  const numValuesAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'numValues',
      message: '🔢 How many values would you like to define? (1-20)\n>>>',
      validate: (input) => {
        const num = parseInt(input);
        if (isNaN(num) || num <= 0 || num > 20) {
          return `❌ Invalid number of values "${input}". Please provide a number between 1 and 20.`;
        }
        return true;
      }
    }
  ]);
  const numValues = parseInt(numValuesAnswer.numValues);

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 5: DEFINE SCALE NAMING CRITERIA"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  const askForNamingCriteria = async () => {
    let choices = [];
    
    if (numValues <= 20) {
      choices = [
        { name: 'T-shirt size (e.g., xs, sm, md, lg)', value: 't-shirt' },
        { name: 'Incremental (e.g., 100, 200, 300, 400)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3, 4)', value: 'ordinal' },
        { name: 'Alphabetical (e.g., A, B, C, D)', value: 'alphabetical' }
      ];
    } else if (numValues >= 27) {
      
      choices = [
        { name: 'Incremental (e.g., 100, 200, 300, 400)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3, 4)', value: 'ordinal' }
      ];
    } else {
      choices = [
        { name: 'Incremental (e.g., 100, 200, 300, 400)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3, 4)', value: 'ordinal' },
        { name: 'Alphabetical (e.g., A, B, C, D)', value: 'alphabetical' }
      ];
    }
    
    const namingChoiceAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'namingChoice',
        message: 'Please choose your scale naming criteria:\n>>>',
        choices: choices
      }
    ]);
    
    let ordinalFormat = 'unpadded';
    let alphabeticalCase;
    let incrementalStep = 100; 
    
    if (namingChoiceAnswer.namingChoice === 'incremental') {
      const incrementalStepAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'incrementalStep',
          message: 'For Incremental scale, choose the step increment:\n>>>',
          choices: [
            { name: '100 in 100 (e.g., 100, 200, 300, 400)', value: 100 },      
            { name: '50 in 50 (e.g., 50, 100, 150, 200)', value: 50 },
            { name: '25 in 25 (e.g., 25, 50, 75, 100)', value: 25 },
            { name: '10 in 10 (e.g., 10, 20, 30, 40)', value: 10 }
          ]
        }
      ]);
      incrementalStep = incrementalStepAnswer.incrementalStep;
    }
    
    if (namingChoiceAnswer.namingChoice === 'ordinal') {
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
      ordinalFormat = ordinalFormatAnswer.ordinalFormat;
    }
    
    if (namingChoiceAnswer.namingChoice === 'alphabetical') {
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
      alphabeticalCase = alphabeticalCaseAnswer.alphabeticalCase;
    }
    return { 
      namingChoice: namingChoiceAnswer.namingChoice, 
      ordinalFormat, 
      alphabeticalCase,
      incrementalStep 
    };
  };

  let { namingChoice, ordinalFormat, alphabeticalCase, incrementalStep } = await askForNamingCriteria();

  while ((namingChoice === 'A' && numValues > 20) || (namingChoice === 'D' && numValues > 26)) {
    if (namingChoice === 'A' && numValues > 20) {
      console.log(chalk.red("❌ T-shirt size naming criteria is not recommended for more than 20 values. Please choose Incremental or ordinal naming criteria."));
    } else if (namingChoice === 'D' && numValues > 26) {
      console.log(chalk.red("❌ Alphabetical naming criteria is not recommended for more than 26 values."));
    }
    ({ namingChoice, ordinalFormat, alphabeticalCase } = await askForNamingCriteria());
  }

  return { 
    unit, 
    name, 
    numValues, 
    namingChoice, 
    scale, 
    ordinalFormat, 
    alphabeticalCase, 
    incrementalStep,
    multiplier: scaleAnswer.multiplier,      
    factor: scaleAnswer.factor,              
    customIntervals: scaleAnswer.customIntervals,
    fibonacciBase: scaleAnswer.fibonacciBase
  };
};

const generateSpacingTokens = (
  unit,
  numValues,
  namingChoice,
  scale,
  ordinalFormat,
  alphabeticalCase,
  incrementalStep = 100,
  multiplier,
  factor,
  customIntervals,
  fibonacciBase
) => {
  const tokens = {};
  let baseValue;
  let prev; 

  switch (scale) {
    case "4":
      baseValue = 4;
      break;
    case "8":
      baseValue = 8;
      break;
  }

  for (let i = 1; i <= numValues; i++) {
    let tokenName;

    switch (namingChoice) {
      case "t-shirt":
        tokenName = [
          "3xs",
          "2xs",
          "xs",
          "sm",
          "md",
          "lg",
          "xl",
          "2xl",
          "3xl",
          "4xl",
          "5xl",
          "6xl",
          "7xl",
          "8xl",
          "9xl",
          "10xl",
          "11xl",
          "12xl",
          "13xl",
          "14xl",
          "15xl"
        ][i - 1] || `space${i}`;
        break;
      case "incremental":
        tokenName = (i * incrementalStep).toString();
        break;
      case "ordinal":
        tokenName =
          ordinalFormat === "padded"
            ? i.toString().padStart(2, "0")
            : i.toString();
        break;
      case "alphabetical":
        tokenName =
          alphabeticalCase === "lowercase"
            ? String.fromCharCode(96 + i)
            : String.fromCharCode(64 + i);
        break;
    }

    let value;

    if (scale === "custom") {
      value = customIntervals.base + customIntervals.step * (i - 1);
    } else if (scale === "modular") {
      value = multiplier * Math.pow(factor, i - 1);
    } else if (scale === "fibonacci") {
      const phi = 1.618;
      if (i === 1) {
        value = fibonacciBase;
      } else {
        value = prev * phi;
      }
      prev = value;
    } else {
      value = baseValue * i;
    }

    value = Math.round(value * 100) / 100;

    tokens[tokenName] = {
      $value: `${value}${unit}`,
      $type: "spacing"
    };
  }

  return tokens;
};

const convertPxToOtherUnits = (tokens, unit) => {
  const conversions = {
    rem: (value) => `${value / 16}rem`,
    em: (value) => `${value / 16}em`,
  };
  const convertedTokens = {};
  for (const [key, token] of Object.entries(tokens)) {
    const numericValue = parseFloat(token.$value);
    convertedTokens[key] = {
      $value: conversions[unit](numericValue),
      $type: "spacing"
    };
  }
  return convertedTokens;
};

const saveTokensToFile = (tokensObject, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const tshirtOrder = [
    "3xs", "2xs", "xs", "sm", "md", "lg", "xl",
    "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl",
    "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"
  ];
  const sortKeys = (obj) => {
    let keys = Object.keys(obj);
    const allNumeric = keys.every(k => /^\d+$/.test(k));
    const allTshirt = keys.every(k => tshirtOrder.includes(k));
    if (allNumeric) {
      keys = keys.map(Number).sort((a, b) => a - b).map(String);
    } else if (allTshirt) {
      keys = keys.sort((a, b) => tshirtOrder.indexOf(a) - tshirtOrder.indexOf(b));
    } else {
      keys = keys.sort((a, b) => a.localeCompare(b));
    }
    const sortedObj = {};
    for (const key of keys) {
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        sortedObj[key] = sortKeys(obj[key]);
      } else {
        sortedObj[key] = obj[key];
      }
    }
    return sortedObj;
  };
  const sortedTokens = sortKeys(tokensObject);
  fs.writeFileSync(filePath, JSON.stringify(sortedTokens, null, 2));
  return fs.existsSync(filePath);
};

const convertTokensToCSS = (tokens, prefix = "") => {
  let cssVariables = ":root {\n";
  const tshirtOrder = [
    "3xs", "2xs", "xs", "sm", "md", "lg", "xl",
    "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl",
    "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"
  ];
  const processTokens = (obj, currentPrefix = "") => {
    let keys = Object.keys(obj);
    if (keys.length) {
      const allNumeric = keys.every(k => /^\d+$/.test(k));
      const allTshirt = keys.every(k => tshirtOrder.includes(k));
      if (allNumeric) {
        keys = keys.map(Number).sort((a, b) => a - b).map(String);
      } else if (allTshirt) {
        keys = keys.sort((a, b) => tshirtOrder.indexOf(a) - tshirtOrder.indexOf(b));
      } else {
        keys = keys.sort((a, b) => a.localeCompare(b));
      }
      for (const key of keys) {
        if (obj[key] && typeof obj[key] === "object" && "$value" in obj[key]) {
          cssVariables += `  --${currentPrefix}${key}: ${obj[key].$value};\n`;
        } else {
          processTokens(obj[key], `${currentPrefix}${key}-`);
        }
      }
    }
  };
  processTokens(tokens, prefix);
  cssVariables += "}";
  return cssVariables;
};

const saveCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const cssContent = convertTokensToCSS(tokens, name ? name + '-' : '');
  fs.writeFileSync(filePath, cssContent);
  return fileExists;
};

const convertTokensToSCSS = (tokens) => {
  let scssVariables = "";
  const tshirtOrder = [
    "3xs", "2xs", "xs", "sm", "md", "lg", "xl",
    "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl",
    "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"
  ];
  const processTokens = (obj, prefix = "") => {
    let keys = Object.keys(obj);
    if (keys.length) {
      const allNumeric = keys.every(k => /^\d+$/.test(k));
      const allTshirt = keys.every(k => tshirtOrder.includes(k));
      if (allNumeric) {
        keys = keys.map(Number).sort((a, b) => a - b).map(String);
      } else if (allTshirt) {
        keys = keys.sort((a, b) => tshirtOrder.indexOf(a) - tshirtOrder.indexOf(b));
      } else {
        keys = keys.sort((a, b) => a.localeCompare(b));
      }
      for (const key of keys) {
        if (obj[key] && typeof obj[key] === "object" && "$value" in obj[key]) {
          scssVariables += `$${prefix}${key}: ${obj[key].$value};\n`;
        } else {
          processTokens(obj[key], `${prefix}${key}-`);
        }
      }
    }
  };
  processTokens(tokens);
  return scssVariables;
};

const saveSCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const scssContent = convertTokensToSCSS(tokens);
  fs.writeFileSync(filePath, scssContent);
  return fileExists;
};

const deleteUnusedUnitFiles = (folder, selectedUnits, fileExtension, filePrefix = 'space_variables') => {
  const deletedFiles = [];
  const unitFiles = {
    rem: `${filePrefix}_rem.${fileExtension}`,
    em: `${filePrefix}_em.${fileExtension}`
  };
  for (const [unit, fileName] of Object.entries(unitFiles)) {
    if (!selectedUnits.includes(unit)) {
      const filePath = path.join(folder, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(`🗑️ Deleted: ${relativePath}`);
        deletedFiles.push(relativePath);
      }
    }
  }
  return deletedFiles;
};

const sortObjectRecursively = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectRecursively);
  const sortedKeys = Object.keys(obj).sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b);
  });
  const sortedObj = {};
  sortedKeys.forEach(key => {
    sortedObj[key] = sortObjectRecursively(obj[key]);
  });
  return sortedObj;
};

const customStringify = (obj, indent = 2) => {
  const spacer = " ".repeat(indent);
  const stringify = (value, currentIndent) => {
    if (value === null || typeof value !== "object") {
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      const items = value.map(item => stringify(item, currentIndent + indent));
      return "[\n" + " ".repeat(currentIndent + indent) + items.join(",\n" + " ".repeat(currentIndent + indent)) + "\n" + " ".repeat(currentIndent) + "]";
    }
    let keys = Object.keys(value);
    
    keys.sort((a, b) => {
      if (a === "$value") return -1;
      if (b === "$value") return 1;
      if (a === "$type") return -1;
      if (b === "$type") return 1;
      return a.localeCompare(b);
    });

    let result = "{\n";
    keys.forEach((key, idx) => {
      result += " ".repeat(currentIndent + indent) + JSON.stringify(key) + ": " + stringify(value[key], currentIndent + indent);
      if (idx < keys.length - 1) result += ",\n";
    });
    result += "\n" + " ".repeat(currentIndent) + "}";
    return result;
  };
  return stringify(obj, 0);
};

const main = async () => {
  
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE SPACE TOKENS WIZARD'S MAGIC"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  await showLoader(chalk.bold.yellow("🧚 Casting the magic of tokens"), 1500);

  console.log(
    chalk.whiteBright("\n✨ Welcome to the Space Tokens Wizard! 🧙✨ Ready to create some beautiful space tokens? Let's get started!") +
    chalk.whiteBright("\n\n🎨 Your tokens will be ready to sync with ") +
    chalk.underline("JSON format for Tokens Studio in Figma") +
    chalk.whiteBright(" in a snap! 🌟 And here's the magical bonus: you'll get ") +
    chalk.underline("SCSS") +
    chalk.whiteBright(" and ") +
    chalk.underline("CSS") +
    chalk.whiteBright(" files to bring your space tokens to life! ✨")
  );

  const input = await askForInput();
  if (!input) return;
  const { unit, name, numValues, namingChoice, ordinalFormat, alphabeticalCase, scale, incrementalStep, multiplier, factor, customIntervals, fibonacciBase } = input;
  const tokensData = generateSpacingTokens(unit, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep, multiplier, factor, customIntervals, fibonacciBase);

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 5.5: SPACE TOKENS PREVIEW"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  const scaleNames = {
    "4": "4-Point Grid System",
    "8": "8-Point Grid System",
    modular: "Modular Scale (multiplier based)",
    custom: "Custom Intervals",
    fibonacci: "Fibonacci Scale"
  };

  const namingConventions = {
    "t-shirt": "T-shirt Size",
    incremental: "Incremental",
    ordinal: "Ordinal",
    alphabetical: "Alphabetical"
  };

  console.log(
    chalk.bold.magenta("Tokens Name: ") + chalk.whiteBright(name) + "\n" +
    chalk.bold.magenta("Nº of Values: ") + chalk.whiteBright(numValues.toString()) + "\n" +
    chalk.bold.magenta("Scale: ") + chalk.whiteBright(scaleNames[scale] || scale)
  );
  console.log(
    chalk.bold.magenta("Naming Convention: ") + chalk.whiteBright(namingConventions[namingChoice] || namingChoice) + "\n"
  );

  const tshirtOrder = ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"];

  const sortedEntries = Object.entries(tokensData).sort((a, b) => {
    const indexA = tshirtOrder.indexOf(a[0]);
    const indexB = tshirtOrder.indexOf(b[0]);
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a[0].localeCompare(b[0], undefined, { numeric: true });
  });

  const table = new Table({
    head: [chalk.bold("Scale"), chalk.bold("Value")],
    style: { head: ["magenta"], border: ["magenta"] }
  });

  sortedEntries.forEach(([tokenName, token]) => {
    table.push([tokenName, token.$value]);
  });

  console.log(table.toString());

  const { confirmSpacing } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmSpacing",
      message: "Would you like to continue with this nomenclature?\n>>>",
      default: true
    }
  ]);

  if (!confirmSpacing) {
    console.log(chalk.bold.yellowBright("\nNo problem! Let's start over 🧩 since you didn't confirm to move forward with the nomenclature."));
    
    return main(); 
  }

  const outputsDir = path.join(__dirname, "..", "..", "output_files");
  const tokensFolder = path.join(outputsDir, "tokens/json/space");
  const cssFolder = path.join(outputsDir, "tokens/css/space");
  const scssFolder = path.join(outputsDir, "tokens/scss/space");

  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder, { recursive: true }); 
  if (!fs.existsSync(scssFolder)) fs.mkdirSync(scssFolder, { recursive: true }); 

  const jsonFileExists = saveTokensToFile({ [name]: tokensData }, tokensFolder, 'space_tokens_px.json');
  const cssFileExists = saveCSSTokensToFile(tokensData, name, cssFolder, 'space_variables_px.css');
  const scssFileExists = saveSCSSTokensToFile(tokensData, name, scssFolder, 'space_variables_px.scss');

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔄 CONVERTING SPACE TOKENS TO OTHER UNITS"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  const convertTokensResp = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'convert',
      message: 'Would you like to convert the tokens to other units (rem, em)?\n>>>',
      default: false,
    }
  ]);

  let units = [];
  let unitsAnswer = { units: [] }; 

  if (convertTokensResp.convert) {
    
    unitsAnswer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'units',
        message: 'Please, select the units you want to use to convert your tokens (leave empty to skip):\n>>>',
        choices: [
          { name: 'rem', value: 'rem' },
          { name: 'em', value: 'em' }
        ]
      }
    ]);
    units = unitsAnswer.units; 
    
    if (units.length > 0) {
      for (const unit of units) {
        const unitSuffix = `_${unit}`;
        const convertedTokens = convertPxToOtherUnits(tokensData, unit);
        const unitJsonFileExists = saveTokensToFile({ [name]: convertedTokens }, tokensFolder, `space_tokens${unitSuffix}.json`);
        const unitCssFileExists = saveCSSTokensToFile(convertedTokens, name, cssFolder, `space_variables${unitSuffix}.css`);
        const unitScssFileExists = saveSCSSTokensToFile(convertedTokens, name, scssFolder, `space_variables${unitSuffix}.scss`);
      }
    }
    
    await showLoader(chalk.bold.yellowBright("\n🪄 Finalizing your spell"), 1500);
    
    console.log(chalk.black.bgMagentaBright("\n======================================="));
    console.log(chalk.bold("📄 OUTPUT FILES"));
    console.log(chalk.black.bgMagentaBright("=======================================\n"));
    
    if (jsonFileExists || cssFileExists || scssFileExists) {
      console.log(chalk.whiteBright("🆕 Updated:"));
    } else {
      console.log(chalk.whiteBright("🪄 Created:"));
    }
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(tokensFolder, 'space_tokens_px.json'))}`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(cssFolder, 'space_variables_px.css'))}`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(scssFolder, 'space_variables_px.scss'))}`));
    
    if (units.length > 0) {
      for (const unit of units) {
        const unitSuffix = `_${unit}`;
        
        console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(tokensFolder, `${name}_tokens${unitSuffix}.json`))}`));
        console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(cssFolder, `${name}_variables${unitSuffix}.css`))}`));
        console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(scssFolder, `${name}_variables${unitSuffix}.scss`))}`));
      }
    }
    
    deleteUnusedUnitFiles(tokensFolder, units, 'json', 'space_tokens');
    deleteUnusedUnitFiles(cssFolder, units, 'css', 'space_tokens');
    deleteUnusedUnitFiles(scssFolder, units, 'scss', 'space_tokens');
    
  } else {
    
    await showLoader(chalk.bold.yellowBright("\n🪄 Finalizing your spell"), 1500);
    
    const deletedFiles = [];
    const deleteFileIfExists = (folder, fileName) => {
      const filePath = path.join(folder, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deletedFiles.push(path.relative(process.cwd(), filePath));
      }
    };
    
    deleteFileIfExists(tokensFolder, 'space_tokens_rem.json');
    deleteFileIfExists(tokensFolder, 'space_tokens_em.json');
    deleteFileIfExists(cssFolder, 'space_variables_rem.css');
    deleteFileIfExists(cssFolder, 'space_variables_em.css');
    deleteFileIfExists(scssFolder, 'space_variables_rem.scss');
    deleteFileIfExists(scssFolder, 'space_variables_em.scss');
    
    console.log(chalk.black.bgMagentaBright("\n======================================="));
    console.log(chalk.bold("📄 OUTPUT FILES"));
    console.log(chalk.black.bgMagentaBright("=======================================\n"));
    
    console.log(chalk.whiteBright("🪄 Created:"));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(tokensFolder, 'space_tokens_px.json'))}`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(cssFolder, 'space_variables_px.css'))}`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(scssFolder, 'space_variables_px.scss'))}`));
    
    if (deletedFiles.length > 0) {
      console.log(chalk.whiteBright("🗑️ Deleted:"));
      deletedFiles.forEach(deletedFile => {
        console.log(chalk.whiteBright(`   -> ${deletedFile}`));
      });
    }
  }
      
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🎉🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  
  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.magentaBright("Space Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄📏\n"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
};

main();