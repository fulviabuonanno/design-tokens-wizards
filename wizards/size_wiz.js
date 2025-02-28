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

/**
 * Prompts the user for configuration inputs.
 * It gathers basic details like token naming, scale, number of values, and naming criteria.
 * Returns an object with all the necessary parameters.
 */
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
        { name: 'More Info', value: 'info' }
      ],
      filter: (input) => input.toUpperCase() 
    }
  ]);
  if (scaleAnswer.scale === 'info') {
    
    console.log(chalk.black.bgBlueBright("\n======================================="));
    console.log(chalk.bold("📚 SCALE INFORMATION"));
    console.log(chalk.black.bgBlueBright("=======================================\n"));
    console.log("Scale Name       | Description                                      | Examples");
    console.log("--------------------------------------------------------------------------------");
    console.log("4-Point Grid System         | A standard scale where each step is 4 units.     | 4, 8, 12, 16, ...");
    console.log("8-Point Grid System     | A standard scale where each step is 8 units.     | 8, 16, 24, 32, ...");
    console.log(chalk.black.bgBlueBright("=======================================\n"));
    const newScaleAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'scale',
        message: '🔢 Select the scale to use for your values: \n',
        choices: [
          { name: '4-Point Grid System', value: '4' },
          { name: '8-Point Grid System', value: '8' }
        ]
      }
    ]);
    scaleAnswer.scale = newScaleAnswer.scale;
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

  return { unit, name, numValues, namingChoice: namingChoice.namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep };
};

/**
 * Generates size tokens based on user inputs.
 * Uses the scale (4px or 8px grid) and naming criteria to build a tokens object.
 */
const generateTokens = (unit, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep) => {
  const tokens = {};
  let baseValue;
  
  switch (scale) {
    case "4":
      baseValue = 4;
      break;
    case "8":
      baseValue = 8;
      break;
  }
  
  for (let i = 1; i <= numValues; i++) {
    let name;
    
    switch (namingChoice) {
      case "t-shirt":
        name = ["3xs", "2xs", "xs", "s", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"][i - 1] || `size${i}`;
        break;
      case "incremental":
        name = (i * incrementalStep).toString();
        break;
      case "ordinal":
        name = ordinalFormat === 'padded' ? i.toString().padStart(2, '0') : i.toString();
        break;
      case "alphabetical":
        if (alphabeticalCase === 'lowercase') {
          name = String.fromCharCode(96 + i);
        } else {
          name = String.fromCharCode(64 + i);
        }
        break;
    }
    const value = baseValue * i;
    
    tokens[name] = {
      value: `${value}${unit}`,
      type: "sizing" 
    };
  }
  return tokens;
};

/**
 * Converts tokens from px to another unit (rem, em)
 * using predefined conversion functions.
 */
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

/**
 * Recursively sorts an object by key, using numeric ordering when possible.
 */
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

/**
 * Custom function to stringify objects while preserving key order.
 */
const customStringify = (value, indent = 2) => {
    const spacer = ' '.repeat(indent);
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        const items = value.map(item => customStringify(item, indent + 2));
        return "[\n" + spacer + items.join(",\n" + spacer) + "\n" + ' '.repeat(indent - 2) + "]";
    } else {
        let keys = Object.keys(value);
        if (keys.includes('value') && keys.includes('type')) {
            keys = ['value', 'type', ...keys.filter(k => k !== 'value' && k !== 'type').sort((a, b) => a.localeCompare(b))];
        } else {
            keys = keys.sort((a, b) => {
                const numA = Number(a);
                const numB = Number(b);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return a.localeCompare(b);
            });
        }
        let result = "{\n";
        keys.forEach((key, idx) => {
            result += spacer + JSON.stringify(key) + ": " + customStringify(value[key], indent + 2);
            if (idx < keys.length - 1) result += ",\n";
        });
        result += "\n" + ' '.repeat(indent - 2) + "}";
        return result;
    }
};

/**
 * Saves tokens data to a JSON file.
 * First, the tokens are recursively sorted and then stringified using the custom function.
 */
const saveTokensToFile = (tokensData, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const sortedTokensData = sortObjectRecursively(tokensData);
  const outputJSON = customStringify(sortedTokensData, 2);
  fs.writeFileSync(filePath, outputJSON);
  return fileExists;
};

/**
 * Converts tokens into CSS variable declarations.
 */
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

/**
 * Saves CSS tokens to a file.
 */
const saveCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const cssContent = convertTokensToCSS(tokens, name);
  fs.writeFileSync(filePath, cssContent);
  return fileExists;
};

/**
 * Converts tokens into SCSS variable declarations.
 */
const convertTokensToSCSS = (tokens, name) => {
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
  return scssVariables;
};

/**
 * Saves SCSS tokens to a file.
 */
const saveSCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const scssContent = convertTokensToSCSS(tokens, name);
  fs.writeFileSync(filePath, scssContent);
  return fileExists;
};

/**
 * Deletes files corresponding to units that were not selected by the user.
 */
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

/**
 * Main function orchestrating the token generation process:
 *  - Shows loaders and welcomes the user.
 *  - Collects user input step by step.
 *  - Generates tokens based on input.
 *  - Saves tokens as JSON, CSS, and SCSS files.
 *  - Optionally converts tokens to other units.
 *  - Deletes files related to unused units.
 */
const main = async () => {
  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
  await showLoader(chalk.bold.magenta("🧚 Casting the magic of tokens"), 2000);
  console.log(chalk.whiteBright("\n❤️ Welcome to the ") + chalk.bold.blue("Size Tokens Wizard") + chalk.whiteBright(" script! \nLet this wizard 🧙 guide you through creating your size tokens step by step. \nGenerate your tokens and prepare them ready for using or syncing in ") + chalk.underline("Tokens Studio") + chalk.whiteBright("."));

  const input = await askForInput();
  if (!input) return;
  const { unit, name, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep } = input;

  const tokensData = generateTokens(unit, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep);

  const outputsDir = path.join(__dirname, "..", "outputs");
  const tokensFolder = path.join(outputsDir, "tokens", "size");
  const cssFolder = path.join(outputsDir, "css", "size");
  const scssFolder = path.join(outputsDir, "scss", "size");

  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder, { recursive: true });
  if (!fs.existsSync(scssFolder)) fs.mkdirSync(scssFolder, { recursive: true });

  const jsonFileExists = saveTokensToFile({ [name]: tokensData }, tokensFolder, 'size_tokens_px.json');
  const cssFileExists = saveCSSTokensToFile(tokensData, name, cssFolder, 'size_variables_px.css');
  const scssFileExists = saveSCSSTokensToFile(tokensData, name, scssFolder, 'size_variables_px.scss');

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
        
        saveTokensToFile({ [name]: convertedTokens }, tokensFolder, `size_tokens${unitSuffix}.json`);
        saveCSSTokensToFile(convertedTokens, name, cssFolder, `size_variables${unitSuffix}.css`);
        saveSCSSTokensToFile(convertedTokens, name, scssFolder, `size_variables${unitSuffix}.scss`);
      }
    }
  } 

  await showLoader(chalk.bold.magenta("\n🪄 Finalizing your spell"), 2000);

  const hasChanges = jsonFileExists || cssFileExists || scssFileExists || (units.length > 0);

  if (hasChanges) {
    console.log(chalk.black.bgBlueBright("\n======================================="));
    console.log(chalk.bold("🚧 CHANGES IN OUTPUT FILES"));
    console.log(chalk.black.bgBlueBright("=======================================\n"));
    console.log(chalk.whiteBright(`🆕 ${jsonFileExists ? 'Updated' : 'Saved'}: ${path.relative(process.cwd(), path.join(tokensFolder, 'size_tokens_px.json'))}`));
    console.log(chalk.whiteBright(`🆕 ${cssFileExists ? 'Updated' : 'Saved'}: ${path.relative(process.cwd(), path.join(cssFolder, 'size_variables_px.css'))}`));
    console.log(chalk.whiteBright(`🆕 ${scssFileExists ? 'Updated' : 'Saved'}: ${path.relative(process.cwd(), path.join(scssFolder, 'size_variables_px.scss'))}`));
  
    if (units.length > 0) {
      for (const unit of units) {
        const unitSuffix = `_${unit}`;
        console.log(chalk.whiteBright(`🆕 Converted (${unit}): ${path.relative(process.cwd(), path.join(tokensFolder, `size_tokens${unitSuffix}.json`))}`));
        console.log(chalk.whiteBright(`🆕 Converted (${unit}): ${path.relative(process.cwd(), path.join(cssFolder, `size_variables${unitSuffix}.css`))}`));
        console.log(chalk.whiteBright(`🆕 Converted (${unit}): ${path.relative(process.cwd(), path.join(scssFolder, `size_variables${unitSuffix}.scss`))}`));
      }
    }
    
    deleteUnusedUnitFiles(tokensFolder, units, 'json', 'size_tokens');
    deleteUnusedUnitFiles(cssFolder, units, 'css', 'size_variables');
    deleteUnusedUnitFiles(scssFolder, units, 'scss', 'size_variables');
  
    console.log(chalk.black.bgBlueBright("\n=======================================\n"));
  } else {
    
    console.log(chalk.black.bgBlueBright("\n======================================="));
    console.log(chalk.bold("📄 OUTPUT FILES"));
    console.log(chalk.black.bgBlueBright("=======================================\n"));
    console.log(chalk.whiteBright(`✅ Saved: ${path.relative(process.cwd(), path.join(tokensFolder, 'size_tokens_px.json'))}`));
    console.log(chalk.whiteBright(`✅ Saved: ${path.relative(process.cwd(), path.join(cssFolder, 'size_variables_px.css'))}`));
    console.log(chalk.whiteBright(`✅ Saved: ${path.relative(process.cwd(), path.join(scssFolder, 'size_variables_px.scss'))}`));
    
    if (units.length > 0) {
      for (const unit of units) {
        const unitSuffix = `_${unit}`;
        console.log(chalk.whiteBright(`✅ Converted (${unit}): ${path.relative(process.cwd(), path.join(tokensFolder, `size_tokens${unitSuffix}.json`))}`));
        console.log(chalk.whiteBright(`✅ Converted (${unit}): ${path.relative(process.cwd(), path.join(cssFolder, `size_variables${unitSuffix}.css`))}`));
        console.log(chalk.whiteBright(`✅ Converted (${unit}): ${path.relative(process.cwd(), path.join(scssFolder, `size_variables${unitSuffix}.scss`))}`));
      }
    }
  }

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🎉🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.blueBright("Size Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄📏\n"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
};

main();