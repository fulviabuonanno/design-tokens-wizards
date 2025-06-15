import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import Table from "cli-table3";

const versionArg = process.argv.find(arg => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Size Tokens Wizard - Version ${version}`));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Displays a loading message with progressing dots.
 * @param {string} message - The message to display.
 * @param {number} duration - Duration for which the loader shows.
 */
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
  
  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("⭐️ STEP 1: BASE UNIT"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
  console.log(chalk.yellowBright("ℹ️ The base unit for size tokens is set to 'px'."));
  const unit = 'px';

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 2: NAME YOUR TOKENS"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
  const nameAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: '📝 What name would you like to assign to your size tokens?',
      choices: ['size', 'sizing', 'dimension', 's', 'sz', 'd', 'dim', 'custom'],
      loop: false
    }
  ]);
  let name;
  if (nameAnswer.name === 'custom') {
    
    const customNameAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'customName',
        message: '📝 Please provide a name for your size tokens:',
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

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 3: DEFINE SCALE"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  const scaleAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'scale',
      message: '🔢 Select the scale to use for your values:',
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
    console.log(chalk.black.bgBlueBright("\n======================================="));
    console.log(chalk.bold("📚 SCALE INFORMATION"));
    console.log(chalk.black.bgBlueBright("=======================================\n"));

    const scaleInfoTable = new Table({
      head: [
        chalk.bold("Scale Name"),
        chalk.bold("Description"),
        chalk.bold("Examples")
      ],
      wordWrap: true,
      wrapOnWordBoundary: true,
      style: { head: ["blue"], border: ["blue"] },
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
    console.log(chalk.black.bgBlueBright("\n=======================================\n"));
    const newScaleAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'scale',
        message: '🔢 Select the scale to use for your values:',
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
          { name: 'Minor Sixth (1.6)', value: '1.6' },
          { name: 'Major Sixth (1.667)', value: '1.667' },
          { name: 'Minor Seventh (1.778)', value: '1.778' },
          { name: 'Major Seventh (1.875)', value: '1.875' },
          { name: 'Octave (2.0)', value: '2.0' },
          { name: 'Custom Ratio', value: 'custom' }
        ]
      }
    ]);

    const modularBaseAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'multiplier',
        message: 'Enter the starting value to build your modular scale (e.g. 4):',
        validate: (input) => {
          const num = parseFloat(input);
          return (isNaN(num) || num <= 0) ? "Please enter a valid positive number." : true;
        }
      }
    ]);
    
    let factor;
    if (scaleRatio === 'custom') {
      const customFactorAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'factor',
          message: 'Enter the multiplication factor (e.g. 1.5):',
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
    const customBaseAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'base',
        message: 'Enter the starting value for your custom intervals (e.g. 4)',
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
        message: 'Enter the step interval (e.g. 6):',
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
    const fibonacciBaseAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'fibonacciBase',
        message: 'Enter a base value for your Fibonacci scale:',
        validate: (input) => {
          const num = parseFloat(input);
          return (isNaN(num) || num <= 0) ? "Please enter a valid positive number." : true;
        }
      }
    ]);
    scaleAnswer.fibonacciBase = parseFloat(fibonacciBaseAnswer.fibonacciBase);
  }

  const scale = scaleAnswer.scale;

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 4: DEFINE NUMBER OF VALUES"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
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

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 5: DEFINE SCALE NAMING CRITERIA"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
  const askForNamingCriteria = async () => {
    let choices = [];
    if (numValues <= 20) {
      choices = [
        { name: 'T-shirt size (e.g., xs, sm, md, lg)', value: 't-shirt' },
        { name: 'Incremental (e.g., 100, 200, 300, 400)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3, 4)', value: 'ordinal' },
        { name: 'Alphabetical (e.g., A, B, C, D)', value: 'alphabetical' }
      ];
    } else if (numValues < 27) {
      choices = [
        { name: 'Incremental (e.g., 100, 200, 300, 400)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3, 4)', value: 'ordinal' },
        { name: 'Alphabetical (e.g., A, B, C, D)', value: 'alphabetical' }
      ];
    } else { 
      choices = [
        { name: 'Incremental (e.g., 100, 200, 300, 400)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3, 4 )', value: 'ordinal' }
      ];
    }
    const namingChoiceAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'namingChoice',
        message: 'Please choose scale naming criteria of your preference:',
        choices: choices
      }
    ]);
    
    let ordinalFormat = 'unpadded';
    let alphabeticalCase = 'uppercase';
    let incrementalStep = 100; 
    if (namingChoiceAnswer.namingChoice === 'ordinal') {
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
    ordinalFormat = ordinalFormatAnswer.ordinalFormat;
  } else if (namingChoiceAnswer.namingChoice === 'alphabetical') {
    const alphabeticalAnswer = await inquirer.prompt([
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
    alphabeticalCase = alphabeticalAnswer.alphabeticalCase;
  } else if (namingChoiceAnswer.namingChoice === 'incremental') {
    const incrementalAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'increment',
        message: 'For Incremental scale, choose the step increment:',
        choices: [                
          { name: '100 in 100 (e.g., 100, 200, 300, 400)', value: '100' },
          { name: '50 in 50 (e.g., 50, 100, 150, 200)', value: '50' },
          { name: '25 in 25 (e.g., 25, 50, 75, 100)', value: '25' },
          { name: '10 in 10 (e.g., 10, 20, 30, 40)', value: '10' }
        ]
      }
    ]);
    incrementalStep = parseInt(incrementalAnswer.increment, 10);
  }
  return { 
    namingChoice: namingChoiceAnswer.namingChoice, 
    ordinalFormat, 
    alphabeticalCase,
    incrementalStep 
  };
};

const namingCriteria = await askForNamingCriteria();

return { 
  unit, 
  name, 
  numValues, 
  namingChoice: namingCriteria.namingChoice, 
  scale, 
  ordinalFormat: namingCriteria.ordinalFormat, 
  alphabeticalCase: namingCriteria.alphabeticalCase, 
  incrementalStep: namingCriteria.incrementalStep,
  multiplier: scaleAnswer.multiplier,      
  factor: scaleAnswer.factor,              
  customIntervals: scaleAnswer.customIntervals,
  fibonacciBase: scaleAnswer.fibonacciBase 
};
};

const generateTokens = (unit, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep, multiplier, customIntervals, factor, fibonacciBase) => {
  const tokens = {};
  let baseValue = 0;
  
  let prev;

  switch (scale) {
    case "4":
      baseValue = 4;
      break;
    case "8":
      baseValue = 8;
      break;
    case "modular":
      break;
    case "custom":
      break;
    case "fibonacci":
      break;
  }
  
  for (let i = 1; i <= numValues; i++) {
    let tokenName;
    switch (namingChoice) {
      case "t-shirt":
        tokenName = ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"][i - 1] || `size${i}`;
        break;
      case "incremental":
        tokenName = (i * incrementalStep).toString();
        break;
      case "ordinal":
        tokenName = ordinalFormat === 'padded' ? i.toString().padStart(2, '0') : i.toString();
        break;
      case "alphabetical":
        tokenName = alphabeticalCase === 'lowercase' ? String.fromCharCode(96 + i) : String.fromCharCode(64 + i);
        break;
    }
    
    let value;
    if (scale === 'custom') {
      value = customIntervals.base + customIntervals.step * (i - 1);
    } else if (scale === 'modular') {
      value = multiplier * Math.pow(factor, i - 1);
    } else if (scale === 'fibonacci') {
      
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
      $type: "sizing"
    };
  }
  
  return tokens;
};

const convertTokens = (tokens, unit) => {
  const conversions = {
    rem: (value) => `${value / 16}rem`,
    em: (value) => `${value / 16}em`
  };
  const convertedTokens = {};
  for (const [key, token] of Object.entries(tokens)) {
    const numericValue = parseFloat(token.$value);
    convertedTokens[key] = {
      $value: conversions[unit](numericValue),
      $type: "sizing"
    };
  }
  return convertedTokens;
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

const saveTokensToFile = (tokensObject, folder, fileName) => {
  const filePath = path.join(folder, fileName);

  const orderedObject = {};
  Object.entries(tokensObject).forEach(([topKey, tokens]) => {
    const sortedKeys = Object.keys(tokens).sort((a, b) => {
      return Number(a) - Number(b);
    });
    const sortedTokens = {};
    sortedKeys.forEach(key => {
      sortedTokens[key] = {
        $value: tokens[key].$value,
        $type: tokens[key].$type
      };
    });
    
    orderedObject[topKey === 'size' ? 'sizing' : topKey] = sortedTokens;
  });
  fs.writeFileSync(filePath, JSON.stringify(orderedObject, null, 2));
  return fs.existsSync(filePath);
};

const convertTokensToCSS = (tokens) => {
  let cssVariables = ":root {\n";
  const processTokens = (obj, prefix = "") => {
    let keys = Object.keys(obj);
    if (keys.length) {
      keys = keys.sort((a, b) => a.localeCompare(b));
      for (const key of keys) {
        if (obj[key] && typeof obj[key] === "object" && "$value" in obj[key]) {
          cssVariables += `  --${prefix}${key}: ${obj[key].$value};\n`;
        } else {
          processTokens(obj[key], `${prefix}${key}-`);
        }
      }
    }
  };
  processTokens(tokens);
  cssVariables += "}";
  return cssVariables;
};

const saveCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const cssContent = convertTokensToCSS(tokens);
  fs.writeFileSync(filePath, cssContent);
  return fileExists;
};

const convertTokensToSCSS = (tokens) => {
  let scssVariables = "";
  const processTokens = (obj, prefix = "") => {
    let keys = Object.keys(obj);
    if (keys.length) {
      keys = keys.sort((a, b) => a.localeCompare(b));
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
  const tshirtOrder = [
    "3xs", "2xs", "xs", "sm", "md", "lg", "xl",
    "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl",
    "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"
  ];
  const customSort = (a, b) => {
    const aInList = tshirtOrder.includes(a);
    const bInList = tshirtOrder.includes(b);
    if (aInList && bInList) return tshirtOrder.indexOf(a) - tshirtOrder.indexOf(b);
    else if (aInList) return -1;
    else if (bInList) return 1;
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  };
  const sortedKeys = Object.keys(tokens).sort(customSort);
  let scssVariables = '';
  sortedKeys.forEach(key => {
    scssVariables += `$${name}-${key}: ${tokens[key].$value};\n`;
  });
  fs.writeFileSync(filePath, scssVariables);
  return fs.existsSync(filePath);
};

const deleteUnusedUnitFiles = (folder, selectedUnits, fileExtension, prefix) => {
  const unitFiles = {
    rem: `${prefix}_rem.${fileExtension}`,
    em: `${prefix}_em.${fileExtension}`
  };
  for (const [unit, fileName] of Object.entries(unitFiles)) {
    if (!selectedUnits.includes(unit)) {
      const filePath = path.join(folder, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(`🗑️ Deleted: ${relativePath}`);
      }
    }
  }
};

const main = async () => {
  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE SIZE TOKENS WIZARD'S MAGIC"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  await showLoader(chalk.bold.yellowBright("🧚 Casting the magic of tokens"), 1500);

  console.log(
    chalk.whiteBright("\n✨ Welcome to the Size Tokens Wizard! 🧙✨ Ready to create some beautiful size tokens? Let's get started!") +
    chalk.whiteBright("\n\n🎨 Your tokens will be ready to sync with ") +
    chalk.underline("JSON format for Tokens Studio in Figma") +
    chalk.whiteBright(" in a snap! 🌟 And here's the magical bonus: you'll get ") +
    chalk.underline("SCSS") +
    chalk.whiteBright(" and ") +
    chalk.underline("CSS") +
    chalk.whiteBright(" files to bring your size tokens to life! ✨")
  );
  const input = await askForInput();
  if (!input) return;
  const { unit, name, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep, multiplier, factor, customIntervals, fibonacciBase } = input;

  const tokensData = generateTokens(unit, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep, multiplier, customIntervals, factor, fibonacciBase);

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 5.5: SIZE TOKENS PREVIEW"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

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
    chalk.bold.blue("Tokens Name: ") + chalk.whiteBright(name) + "\n" +
    chalk.bold.blue("Nº of Values: ") + chalk.whiteBright(numValues.toString()) + "\n" +
    chalk.bold.blue("Scale: ") + chalk.whiteBright(scaleNames[scale] || scale)
  );
  console.log(
    chalk.bold.blue("Naming Convention: ") + chalk.whiteBright(namingConventions[namingChoice] || namingChoice) + "\n"
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
    style: { head: ["blue"], border: ["blue"] }
  });

  sortedEntries.forEach(([tokenName, token]) => {
    table.push([tokenName, token.$value]);
  });

  console.log(table.toString());

  const { confirmSpacing } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmSpacing",
      message: "Would you like to continue with this nomenclature?",
      default: true
    }
  ]);

  if (!confirmSpacing) {
    console.log(chalk.bold.yellowBright("\nNo problem! Let's start over 🧩 since you didn't confirm to move forward with the nomenclature."));
    
    return main(); 
  }
 
  const topKey = (namingChoice === 't-shirt') ? 'size' : name;

  const outputsDir = path.join(__dirname, "..", "..", "output_files");
  const tokensFolder = path.join(outputsDir, "tokens/json/size");
  const cssFolder = path.join(outputsDir, "tokens/css/size");
  const scssFolder = path.join(outputsDir, "tokens/scss/size");

  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder, { recursive: true });
  if (!fs.existsSync(scssFolder)) fs.mkdirSync(scssFolder, { recursive: true });

  const jsonFileExists = saveTokensToFile({ [topKey]: tokensData }, tokensFolder, 'size_tokens_px.json');
  const cssFileExists = saveCSSTokensToFile(tokensData, topKey, cssFolder, 'size_variables_px.css');
  const scssFileExists = saveSCSSTokensToFile(tokensData, topKey, scssFolder, 'size_variables_px.scss');

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔄 CONVERTING SIZE TOKENS TO OTHER UNITS"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
  const convertAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'convert',
      message: 'Would you like to convert the tokens to other units (rem, em)?',
      default: true
    }
  ]);

  let units = [];
  let unitsAnswer = { units: [] }; 
  let deletedFiles = []; 

  if (convertAnswer.convert) {
    unitsAnswer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'units',
        message: 'Please, select the units you want to use to convert your tokens (leave empty to skip):',
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
        const convertedTokens = convertTokens(tokensData, unit);
        
        saveTokensToFile({ [topKey]: convertedTokens }, tokensFolder, `size_tokens${unitSuffix}.json`);
        saveCSSTokensToFile(convertedTokens, topKey, cssFolder, `size_variables${unitSuffix}.css`);
        saveSCSSTokensToFile(convertedTokens, topKey, scssFolder, `size_variables${unitSuffix}.scss`);
      }
    }
  } else {
    
    const deleteFileIfExists = (folder, fileName) => {
      const filePath = path.join(folder, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deletedFiles.push(path.relative(process.cwd(), filePath));
      }
    };
    deleteFileIfExists(tokensFolder, 'size_tokens_rem.json');
    deleteFileIfExists(cssFolder, 'size_variables_rem.css');
    deleteFileIfExists(scssFolder, 'size_variables_rem.scss');
    deleteFileIfExists(tokensFolder, 'size_tokens_em.json');
    deleteFileIfExists(cssFolder, 'size_variables_em.css');
    deleteFileIfExists(scssFolder, 'size_variables_em.scss');
  }

  await showLoader(chalk.bold.yellow("\n🪄 Finalizing your spell"), 1500);

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  let statusLabel = (jsonFileExists || cssFileExists || scssFileExists) ? "Updated" : "Created";
  const labelIcon = statusLabel === "Created" ? "🪄" : "🆕";
  if (units.length > 0) {
    console.log(chalk.whiteBright(`${labelIcon} ${statusLabel}:`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(tokensFolder, 'size_tokens_px.json'))}`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(cssFolder, 'size_variables_px.css'))}`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(scssFolder, 'size_variables_px.scss'))}`));
    if (units.includes('rem')) {
      console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(tokensFolder, 'size_tokens_rem.json'))}`));
      console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(cssFolder, 'size_variables_rem.css'))}`));
      console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(scssFolder, 'size_variables_rem.scss'))}`));
    }
    if (units.includes('em')) {
      console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(tokensFolder, 'size_tokens_em.json'))}`));
      console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(cssFolder, 'size_variables_em.css'))}`));
      console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(scssFolder, 'size_variables_em.scss'))}`));
    }
  } else {
    console.log(chalk.whiteBright(`${labelIcon} ${statusLabel}:`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(tokensFolder, 'size_tokens_px.json'))}`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(cssFolder, 'size_variables_px.css'))}`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(scssFolder, 'size_variables_px.scss'))}`));
    if (deletedFiles.length > 0) {
      console.log(chalk.whiteBright("🗑️ Deleted:"));
      deletedFiles.forEach(deletedFile => {
        console.log(chalk.whiteBright(`   -> ${deletedFile}`));
      });
    }
  }

  deleteUnusedUnitFiles(tokensFolder, units, 'json');
  deleteUnusedUnitFiles(cssFolder, units, 'css');
  deleteUnusedUnitFiles(scssFolder, units, 'scss');

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🎉🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
  
  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.blueBright("Size Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄📏\n"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
};

main();