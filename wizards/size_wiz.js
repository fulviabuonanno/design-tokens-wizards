import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from 'url';
import chalk from 'chalk';

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
  console.log(chalk.blue("ℹ️ The base unit for size tokens is set to 'px'."));
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
    console.log("Scale Name                 | Description                                             | Examples");
    console.log("--------------------------------------------------------------------------------------------");
    console.log("4-Point Grid System        | Increments by 4 units to maintain consistency.          | 4, 8, 12, 16, ...");
    console.log("8-Point Grid System        | Increments by 8 units for more spacious designs.        | 8, 16, 24, 32, ...");
    console.log("Modular Scale              | Dynamic scale using a multiplier and factor for a harmonious progression. | 16, 32, 64, 128, ...");
    console.log("Custom Intervals           | User-defined intervals for complete customization.      | 10, 20, 35, 50, ...");
    console.log("Fibonacci Scale            | Generates values by multiplying the previous value by the golden ratio (≈1.618). Base value is repeated. | e.g., 4, 6.47, 10.47, ...");
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
        default: '4',
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

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 5: DEFINE SCALE NAMING CRITERIA"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
  const askForNamingCriteria = async () => {
    let choices = [];
    if (numValues <= 20) {
      choices = [
        { name: 'T-shirt size (e.g., xs, sm, md, lg, xl)', value: 't-shirt' },
        { name: 'Incremental (e.g., 50, 100, 150)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3)', value: 'ordinal' },
        { name: 'Alphabetical (e.g., A, B, C or a, b, c)', value: 'alphabetical' }
      ];
    } else if (numValues < 27) {
      choices = [
        { name: 'Incremental (e.g., 50, 100, 150)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3)', value: 'ordinal' },
        { name: 'Alphabetical (e.g., A, B, C or a, b, c)', value: 'alphabetical' }
      ];
    } else { 
      choices = [
        { name: 'Incremental (e.g., 50, 100, 150)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3)', value: 'ordinal' }
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
          { name: 'Padded (e.g., 01, 02, 03)', value: 'padded' },
          { name: 'Unpadded (e.g., 1, 2, 3)', value: 'unpadded' }
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
          { name: 'Uppercase (A, B, C)', value: 'uppercase' },
          { name: 'Lowercase (a, b, c)', value: 'lowercase' }
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
          { name: '50 in 50 (e.g., 50, 100, 150, 200)', value: '50' },
          { name: '100 in 100 (e.g., 100, 200, 300, 400)', value: '100' }
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

let namingChoice = await askForNamingCriteria();
let ordinalFormat = namingChoice.ordinalFormat;
let alphabeticalCase = namingChoice.alphabeticalCase;
let incrementalStep = namingChoice.incrementalStep;

while ((namingChoice.namingChoice === 'A' && numValues > 20) || (namingChoice.namingChoice === 'D' && numValues > 26)) {
  if (namingChoice.namingChoice === 'A' && numValues > 20) {
    console.log(chalk.red("❌ T-shirt Size scale naming criteria is not recommended for more than 20 values. Please consider using Incremental or Ordinal naming criteria."));
  } else if (namingChoice.namingChoice === 'D' && numValues > 26) {
    console.log(chalk.red("❌ Alphabetical scale naming criteria is not recommended for more than 26 values."));
  }
  namingChoice = await askForNamingCriteria();
  ordinalFormat = namingChoice.ordinalFormat;
  alphabeticalCase = namingChoice.alphabeticalCase;
  incrementalStep = namingChoice.incrementalStep;
}

return { 
  unit, 
  name, 
  numValues, 
  namingChoice: namingChoice.namingChoice, 
  scale, 
  ordinalFormat, 
  alphabeticalCase, 
  incrementalStep,
  multiplier: scaleAnswer.multiplier,      
  factor: scaleAnswer.factor,              
  customIntervals: scaleAnswer.customIntervals,
  fibonacciBase: scaleAnswer.fibonacciBase // se incluye la base Fibonacci
};
};

const generateTokens = (unit, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep, multiplier, customIntervals, factor, fibonacciBase) => {
  const tokens = {};
  let baseValue = 0;
  // Declaración para almacenar el valor previo en la escala Fibonacci
  let prev;

  switch (scale) {
    case "4":
      baseValue = 4;
      break;
    case "8":
      baseValue = 8;
      break;
    case "modular":
      // ... lógica modular ...
      break;
    case "custom":
      // ... lógica custom ...
      break;
    case "fibonacci":
      // No es necesario definir baseValue acá; se usará fibonacciBase en el loop
      break;
  }
  
  for (let i = 1; i <= numValues; i++) {
    let tokenName;
    switch (namingChoice) {
      case "t-shirt":
        tokenName = ["3xs", "2xs", "xs", "s", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"][i - 1] || `size${i}`;
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
      // Usamos multiplicación por el ratio áureo en vez de la suma
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
      type: "sizing"
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
    const numericValue = parseFloat(token.value);
    convertedTokens[key] = {
      value: conversions[unit](numericValue),
      type: "sizing"
    };
  }
  return convertedTokens;
};

const sortObjectRecursively = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectRecursively);
  
  const tshirtOrder = [
    "3xs", "2xs", "xs", "s", "md", "lg", "xl",
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
  const sortedKeys = Object.keys(obj).sort(customSort);
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
    } else {
        
        const keys = Object.keys(value);
        let result = "{\n";
        keys.forEach((key, idx) => {
            result += spacer + JSON.stringify(key) + ": " + customStringify(value[key], indent + 2);
            if (idx < keys.length - 1) result += ",\n";
        });
        result += "\n" + ' '.repeat(indent - 2) + "}";
        return result;
    }
};

const saveTokensToFile = (tokensObject, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  // Se reconstruye el objeto para ordenar las propiedades: value primero y type segundo.
  const orderedObject = {};
  Object.entries(tokensObject).forEach(([topKey, tokens]) => {
    const orderedTokens = {};
    // Se asume que tokens es un objeto con cada propiedad representando un token.
    Object.keys(tokens).forEach(key => {
      const token = tokens[key];
      orderedTokens[key] = {
        value: token.value,
        type: token.type
      };
    });
    orderedObject[topKey] = orderedTokens;
  });
  fs.writeFileSync(filePath, JSON.stringify(orderedObject, null, 2));
  return fs.existsSync(filePath);
};

const convertTokensToCSS = (tokens, name) => {
  const tshirtOrder = [
    "3xs", "2xs", "xs", "s", "md", "lg", "xl",
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
  let cssVariables = ':root {\n';
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

const saveSCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const tshirtOrder = [
    "3xs", "2xs", "xs", "s", "md", "lg", "xl",
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
    scssVariables += `$${name}-${key}: ${tokens[key].value};\n`;
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
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
  await showLoader(chalk.bold.magenta("🧚 Casting the magic of tokens"), 2000);
  console.log(chalk.whiteBright("\n❤️ Welcome to the ") + chalk.bold.blue("Size Tokens Wizard") + chalk.whiteBright(" script! \nLet this wizard 🧙 guide you through creating your size tokens step by step. \nGenerate your tokens and prepare them ready for using or syncing in ") + chalk.underline("Tokens Studio") + chalk.whiteBright("."));

  const input = await askForInput();
  if (!input) return;
  const { unit, name, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep, multiplier, factor, customIntervals, fibonacciBase } = input;

  const tokensData = generateTokens(unit, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep, multiplier, customIntervals, factor, fibonacciBase);

  const topKey = (namingChoice === 't-shirt') ? 'size' : name;

  const outputsDir = path.join(__dirname, "..", "outputs");
  const tokensFolder = path.join(outputsDir, "tokens", "size");
  const cssFolder = path.join(outputsDir, "css", "size");
  const scssFolder = path.join(outputsDir, "scss", "size");

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

  await showLoader(chalk.bold.yellow("\n🪄 Finalizing your spell"), 2000);

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  let statusLabel = (jsonFileExists || cssFileExists || scssFileExists) ? "Updated" : "Saved";
  const labelIcon = statusLabel === "Saved" ? "✅" : "🆕";
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