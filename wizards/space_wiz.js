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
  console.log(chalk.yellowBright("ℹ️ The base unit for spacing tokens is set to 'px'."));
  const unit = 'px';

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 2: NAME YOUR TOKENS"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  const nameAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: '📝 What name would you like to assign to your spacing tokens?',
      choices: ['space', 'spacing', 'sp', 'spc', 'custom']
    }
  ]);
  let name;
  
  if (nameAnswer.name === 'custom') {
    const customNameAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'customName',
        message: '📝 Please provide a name for your spacing tokens:',
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
    console.log(chalk.black.bgMagentaBright("\n======================================="));
    console.log(chalk.bold("📚 SCALE INFORMATION"));
    console.log(chalk.black.bgMagentaBright("=======================================\n"));
    console.log(`
  ===============================================================================================
  Scale Name               | Description                                           | Examples
  ===============================================================================================
  4-Point Grid System      | Increments by 4 units to maintain consistency.        | 4, 8, 12, 16, ...
  8-Point Grid System      | Increments by 8 units for more spacious designs.      | 8, 16, 24, 32, ...
  Modular Scale            | Uses a multiplier and factor for a harmonious flow.   | e.g., 4, 6.4, 10.24, ...
  Custom Intervals         | User-defined intervals for complete customization.    | e.g., 4, 10, 16, 22, ...
  Fibonacci Scale          | Multiplies the previous value by ≈1.618.              | e.g., 4, 6.47, 10.47, ...
  ===============================================================================================
    `);
    console.log(chalk.black.bgMagentaBright("\n=======================================\n"));
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
    
    const modularFactorAnswer = await inquirer.prompt([
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
    scaleAnswer.multiplier = parseFloat(modularBaseAnswer.multiplier);
    scaleAnswer.factor = parseFloat(modularFactorAnswer.factor);
  } else if (scaleAnswer.scale === 'custom') {
    const customBaseAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'base',
        message: 'Enter the starting value for your custom intervals (e.g. 4):',
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

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 4: DEFINE NUMBER OF VALUES"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  const numValuesAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'numValues',
      message: '🔢 How many values would you like to define?\n>>>',
      validate: (input) => {
        const num = parseInt(input);
        if (isNaN(num) || num <= 0) {
          return `❌ Invalid number of values "${input}". Please provide a valid number.`;
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
        { name: 'T-shirt size (e.g., xs, sm, md, lg, xl)', value: 't-shirt' },
        { name: 'Incremental (e.g., 50, 100, 150, 200)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3)', value: 'ordinal' },
        { name: 'Alphabetical (e.g., A, B, C or a, b, c)', value: 'alphabetical' }
      ];
    } else if (numValues >= 27) {
      
      choices = [
        { name: 'Incremental (e.g., 50, 100, 150, 200)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3)', value: 'ordinal' }
      ];
    } else {
      choices = [
        { name: 'Incremental (e.g., 50, 100, 150, 200)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3)', value: 'ordinal' },
        { name: 'Alphabetical (e.g., A, B, C or a, b, c)', value: 'alphabetical' }
      ];
    }
    
    const namingChoiceAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'namingChoice',
        message: 'Please choose your scale naming criteria:',
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
          message: 'For Incremental scale, choose the step increment:',
          choices: [
            { name: '50 in 50 (e.g., 50, 100, 150, 200)', value: 50 },
            { name: '100 in 100 (e.g., 100, 200, 300, 400)', value: 100 }
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
          message: 'For Ordinal scale, choose the format:',
          choices: [
            { name: 'Padded (e.g., 01, 02, 03)', value: 'padded' },
            { name: 'Unpadded (e.g., 1, 2, 3)', value: 'unpadded' }
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
          message: 'For Alphabetical scale, choose the case:',
          choices: [
            { name: 'Uppercase (A, B, C)', value: 'uppercase' },
            { name: 'Lowercase (a, b, c)', value: 'lowercase' }
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
      value: `${value}${unit}`,
      type: "spacing"
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
    const numericValue = parseFloat(token.value);
    convertedTokens[key] = {
      value: conversions[unit](numericValue),
      type: "spacing"
    };
  }
  return convertedTokens;
};

const saveTokensToFile = (tokensData, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  
  const sortedTokensData = sortObjectRecursively(tokensData);
  const outputJSON = customStringify(sortedTokensData, 2);
  
  fs.writeFileSync(filePath, outputJSON);
  return fileExists;
};

const convertTokensToCSS = (tokens, name) => {
  let cssVariables = ':root {\n';
  const tshirtOrder = ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"];
  const customComparator = (a, b) => {
      const indexA = tshirtOrder.indexOf(a);
      const indexB = tshirtOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
  };
  const sortedKeys = Object.keys(tokens).sort(customComparator);
  sortedKeys.forEach(key => {
      cssVariables += `  --${name}-${key}: ${tokens[key].value};\n`;
  });
  cssVariables += '}';
  return cssVariables;
};

const saveCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const cssContent = convertTokensToCSS(tokens, name);
  fs.writeFileSync(filePath, cssContent);
  return fileExists;
};

const convertTokensToSCSS = (tokens, name) => {
  let scssVariables = '';
  const tshirtOrder = ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"];
  const customComparator = (a, b) => {
      const indexA = tshirtOrder.indexOf(a);
      const indexB = tshirtOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
  };
  const sortedKeys = Object.keys(tokens).sort(customComparator);
  sortedKeys.forEach(key => {
      scssVariables += `$${name}-${key}: ${tokens[key].value};\n`;
  });
  return scssVariables;
};

const saveSCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const scssContent = convertTokensToSCSS(tokens, name);
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

const customStringify = (value, indent = 2) => {
    const spacer = ' '.repeat(indent);
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        const items = value.map(item => customStringify(item, indent + 2));
        return "[\n" + spacer + items.join(",\n" + spacer) + "\n" + ' '.repeat(indent - 2) + "]";
    }
    const tshirtOrder = ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"];
    const customComparator = (a, b) => {
        const indexA = tshirtOrder.indexOf(a);
        const indexB = tshirtOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        const numA = Number(a);
        const numB = Number(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        if (a === 'value' && b === 'type') return -1;
        if (a === 'type' && b === 'value') return 1;
        return a.localeCompare(b);
    };
    const keys = Object.keys(value).sort(customComparator);
    let result = "{\n";
    keys.forEach((key, idx) => {
        result += spacer + JSON.stringify(key) + ": " + customStringify(value[key], indent + 2);
        if (idx < keys.length - 1) {
            result += ",\n";
        }
    });
    result += "\n" + ' '.repeat(indent - 2) + "}";
    return result;
};

const main = async () => {
  
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  await showLoader(chalk.bold.yellow("🧚 Casting the magic of tokens"), 1500);

  console.log(chalk.whiteBright("\n❤️ Welcome to the ") + chalk.bold.magenta("Spacing Tokens Wizard") + chalk.whiteBright(" script! \nLet this wizard 🧙 guide you through creating your spacing tokens step by step. \nGenerate your tokens and prepare them for using or syncing in ") + chalk.underline("Tokens Studio") + chalk.whiteBright("."));

  const input = await askForInput();
  if (!input) return;
  const { unit, name, numValues, namingChoice, ordinalFormat, alphabeticalCase, scale, incrementalStep, multiplier, factor, customIntervals, fibonacciBase } = input;
  const tokensData = generateSpacingTokens(unit, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep, multiplier, factor, customIntervals, fibonacciBase);

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 5.5: SPACE TOKEN PREVIEWS"));
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
    table.push([tokenName, token.value]);
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

  const outputsDir = path.join(__dirname, "..", "outputs");
  const tokensFolder = path.join(outputsDir, "tokens", "space");
  const cssFolder = path.join(outputsDir, "css", "space");
  const scssFolder = path.join(outputsDir, "scss", "space");

  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder, { recursive: true }); 
  if (!fs.existsSync(scssFolder)) fs.mkdirSync(scssFolder, { recursive: true }); 

  const jsonFileExists = saveTokensToFile({ [name]: tokensData }, tokensFolder, 'space_tokens_px.json');
  const cssFileExists = saveCSSTokensToFile(tokensData, name, cssFolder, 'space_variables_px.css');
  const scssFileExists = saveSCSSTokensToFile(tokensData, name, scssFolder, 'space_variables_px.scss');

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔄 CONVERTING SPACING TOKENS TO OTHER UNITS"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  const convertTokensResp = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'convert',
      message: "Would you like to convert the tokens to other units (rem, em) (Y/n)",
      default: true,
    }
  ]);

  let units = [];
  let unitsAnswer = { units: [] }; 

  if (convertTokensResp.convert) {
    
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
      console.log(chalk.whiteBright("✅ Saved:"));
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
    
    console.log(chalk.whiteBright("✅ Saved:"));
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
  
  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.magentaBright("Spacing Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄📏\n"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
};

main();