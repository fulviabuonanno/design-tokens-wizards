import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from 'url';
import chalk from "chalk";

const versionArg = process.argv.find(arg => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Space Tokens Wizard - Version ${version}`));
}

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to display a loader for a specified duration
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

// Function to handle user input for generating spacing tokens
const askForInput = async () => {
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("⭐️ STEP 1: BASE UNIT"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // Inform the user about the base unit
  console.log(chalk.magenta("ℹ️ The base unit for spacing tokens is set to 'px'."));
  const unit = 'px';

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 2: NAME YOUR TOKENS"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // Ask for a name for the spacing tokens
  const nameAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: '📝 What name would you like to assign to your spacing tokens?',
      choices: ['space', 'spacing', 'sp', 'spc', 'other']
    }
  ]);

  let name;
  if (nameAnswer.name === 'other') {
    const otherNameAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'otherName',
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
    name = otherNameAnswer.otherName;
  } else {
    name = nameAnswer.name;
  }

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 3: DEFINE SCALE"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // Ask for the scale to structure spacing values
  const scaleAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'scale',
      message: '🔢 Select the scale to use for your spacing values: \n>>>',
      choices: [
        { name: 'A. 4px-Grid', value: 'A' },
        { name: 'B. 8-Point Grid', value: 'B' },
        { name: 'C. More information about Scales', value: 'C' }
      ],
      filter: (input) => input.toUpperCase()
    }
  ]);

  if (scaleAnswer.scale === 'C') {
    console.log(chalk.black.bgMagentaBright("\n======================================="));
    console.log(chalk.bold("📚 SCALE INFORMATION"));
    console.log(chalk.black.bgMagentaBright("=======================================\n"));
    console.log("Scale Name       | Description                                      | Examples");
    console.log("--------------------------------------------------------------------------------");
    console.log("4px-Grid         | A standard scale where each step is 4 units.     | 4, 8, 12, 16, ...");
    console.log("8-point Grid     | A standard scale where each step is 8 units.     | 8, 16, 24, 32, ...");
    console.log(chalk.black.bgMagentaBright("=======================================\n"));

    // Ask for the scale again after showing information
    const newScaleAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'scale',
        message: '🔢 Select the scale to use for your spacing values: \n>>>',
        choices: [
          { name: 'A. 4px-Grid', value: 'A' },
          { name: 'B. 8-Point Grid', value: 'B' }
        ]
      }
    ]);
    scaleAnswer.scale = newScaleAnswer.scale;
  }

  const scale = scaleAnswer.scale;

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 4: DEFINE NUMBER OF VALUES"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // Ask for how many spacing values the user wants to define
  const numValuesAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'numValues',
      message: '🔢 How many values would you like to define? \n>>>',
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

  // Ask for naming criteria based on the number of spacing values
  const askForNamingCriteria = async () => {
    let choices = [];
    if (numValues <= 20) {
      choices = [
        { name: 'T-shirt size (e.g., xs, sm, md, lg, xl)', value: 'A' },
        { name: 'Incremental (e.g., 50, 100, 150, 200)', value: 'B' },
        { name: 'Cardinal (e.g., 1, 2, 3)', value: 'C' },
        { name: 'Alphabetical (e.g., A, B, C or a, b, c)', value: 'D' }
      ];
    } else if (numValues >= 27) {
      // Para más de o igual a 27 valores, solo se muestran las opciones Incremental y Cardinal
      choices = [
        { name: 'Incremental (e.g., 50, 100, 150, 200)', value: 'B' },
        { name: 'Cardinal (e.g., 1, 2, 3)', value: 'C' }
      ];
    } else {
      // Entre 21 y 26, se presentan las tres opciones
      choices = [
        { name: 'Incremental (e.g., 50, 100, 150, 200)', value: 'B' },
        { name: 'Cardinal (e.g., 1, 2, 3)', value: 'C' },
        { name: 'Alphabetical (e.g., A, B, C or a, b, c)', value: 'D' }
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
    
    let cardinalFormat = 'unpadded';
    let alphabeticalCase;
    let incrementalStep = 100; // valor por defecto
    
    if (namingChoiceAnswer.namingChoice === 'B') {
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
    if (namingChoiceAnswer.namingChoice === 'C') {
      const cardinalFormatAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'cardinalFormat',
          message: 'For Cardinal scale, choose the format:',
          choices: [
            { name: 'Padded (e.g., 01, 02, 03)', value: 'padded' },
            { name: 'Unpadded (e.g., 1, 2, 3)', value: 'unpadded' }
          ]
        }
      ]);
      cardinalFormat = cardinalFormatAnswer.cardinalFormat;
    }
    if (namingChoiceAnswer.namingChoice === 'D') {
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
      cardinalFormat, 
      alphabeticalCase,
      incrementalStep 
    };
  };

  let { namingChoice, cardinalFormat, alphabeticalCase, incrementalStep } = await askForNamingCriteria();

  // Validate naming choice against number of values
  while ((namingChoice === 'A' && numValues > 20) || (namingChoice === 'D' && numValues > 26)) {
    if (namingChoice === 'A' && numValues > 20) {
      console.log(chalk.red("❌ T-shirt Size naming criteria is not recommended for more than 20 values. Please choose Incremental or Cardinal naming criteria."));
    } else if (namingChoice === 'D' && numValues > 26) {
      console.log(chalk.red("❌ Alphabetical naming criteria is not recommended for more than 26 values."));
    }
    ({ namingChoice, cardinalFormat, alphabeticalCase } = await askForNamingCriteria());
  }

  return { unit, name, numValues, namingChoice, cardinalFormat, alphabeticalCase, scale, incrementalStep };
};

// Function to generate spacing tokens based on user input
const generateSpacingTokens = (unit, numValues, namingChoice, scale, cardinalFormat, alphabeticalCase, incrementalStep = 100) => {
  const tokens = {};
  let baseValue;
  switch (scale) {
    case "A":
      baseValue = 4;
      break;
    case "B":
      baseValue = 8;
      break;
  }
  for (let i = 1; i <= numValues; i++) {
    let tokenName;
    switch (namingChoice) {
      case "A":
        tokenName = ["3xs", "2xs", "xs", "s", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"][i - 1] || `space${i}`;
        break;
      case "B":
        tokenName = (i * incrementalStep).toString();
        break;
      case "C":
        tokenName = cardinalFormat === 'padded' ? i.toString().padStart(2, '0') : i.toString();
        break;
      case "D":
        if (alphabeticalCase === 'lowercase') {
          tokenName = String.fromCharCode(96 + i);
        } else {
          tokenName = String.fromCharCode(64 + i);
        }
        break;
    }
    const value = baseValue * i;
    tokens[tokenName] = {
      value: `${value}${unit}`,
      type: "spacing"
    };
  }
  return tokens;
};

// Function to convert px values to other units for spacing tokens
const convertPxToOtherUnits = (tokens, unit) => {
  const conversions = {
    pt: (value) => `${value * 0.75}pt`,
    rem: (value) => `${value / 16}rem`,
    em: (value) => `${value / 16}em`,
    percent: (value) => `${(value / 16) * 100}%`
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

// Function to save spacing tokens to a JSON file
const saveTokensToFile = (tokensData, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  
  // Ordena recursivamente las claves antes de stringify.
  const sortedTokensData = sortObjectRecursively(tokensData);
  const outputJSON = customStringify(sortedTokensData, 2);
  
  fs.writeFileSync(filePath, outputJSON);
  return fileExists;
};

// Function to convert tokens to CSS variables
const convertTokensToCSS = (tokens, name) => {
  let cssVariables = ':root {\n';
  
  // Ordenar las claves manualmente usando el mismo criterio.
  const sortedKeys = Object.keys(tokens).sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b);
  });
  
  sortedKeys.forEach(key => {
    cssVariables += `  --${name}-${key}: ${tokens[key].value};\n`;
  });
  cssVariables += '}';
  return cssVariables;
};

// Function to save CSS variables to a file
const saveCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const cssContent = convertTokensToCSS(tokens, name);
  fs.writeFileSync(filePath, cssContent);
  return fileExists;
};

// Function to convert tokens to SCSS variables
/**
 * Function to convert tokens to SCSS variable declarations with sorted keys.
 * @param {object} tokens - Tokens object.
 * @param {string} name - Naming prefix.
 * @returns {string} SCSS content.
 */
const convertTokensToSCSS = (tokens, name) => {
  let scssVariables = '';
  const sortedKeys = Object.keys(tokens).sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b);
  });
  sortedKeys.forEach(key => {
    scssVariables += `$${name}-${key}: ${tokens[key].value};\n`;
  });
  return scssVariables;
};

// Function to save SCSS variables to a file
const saveSCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const scssContent = convertTokensToSCSS(tokens, name);
  fs.writeFileSync(filePath, scssContent);
  return fileExists;
};

// Function to delete files for units that are not included
const deleteUnusedUnitFiles = (folder, selectedUnits, fileExtension) => {
  const unitFiles = {
    pt: `space_variables_pt.${fileExtension}`,
    rem: `space_variables_rem.${fileExtension}`,
    em: `space_variables_em.${fileExtension}`,
    percent: `space_variables_percent.${fileExtension}`
  };

  for (const [unit, fileName] of Object.entries(unitFiles)) {
    if (!selectedUnits.includes(unit)) {
      const filePath = path.join(folder, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted: ${filePath}`);
      }
    }
  }
};

/**
 * Recursively sorts an object by its keys using numeric order when possible.
 * @param {object} obj - The object to be sorted.
 * @returns {object} Sorted object.
 */
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

/**
 * Custom JSON stringify function that respects the key order.
 * It manually sorts the keys using a numeric comparison when possible.
 * @param {any} value - The value to stringify.
 * @param {number} indent - Current indentation level.
 * @returns {string} JSON string representation.
 */
const customStringify = (value, indent = 2) => {
  const spacer = ' '.repeat(indent);
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    const items = value.map(item => customStringify(item, indent + 2));
    return "[\n" + spacer + items.join(",\n" + spacer) + "\n" + ' '.repeat(indent - 2) + "]";
  }
  const keys = Object.keys(value).sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b);
  });
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

// Main function to orchestrate the spacing token generation process
const main = async () => {
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.black.bgMagentaBright("======================================="));

  await showLoader(chalk.bold.yellow("\n🧚 Casting the magic of tokens"), 2000);

  console.log(chalk.whiteBright("\n❤️ Welcome to the ") + chalk.bold.magenta("Spacing Tokens Wizard") + chalk.whiteBright(" script! \nLet this wizard 🧙 guide you through creating your spacing tokens step by step. \nGenerate your tokens and prepare them for using or syncing in ") + chalk.underline("Tokens Studio") + chalk.whiteBright("."));

  const input = await askForInput();
  if (!input) return;

  const { unit, name, numValues, namingChoice, scale, cardinalFormat, alphabeticalCase, incrementalStep } = input;

  // Generate spacing tokens data
  const tokensData = generateSpacingTokens(unit, numValues, namingChoice, scale, cardinalFormat, alphabeticalCase, incrementalStep);

  const outputsDir = path.join(__dirname, "..", "outputs");
  const tokensFolder = path.join(outputsDir, "tokens", "space");
  const cssFolder = path.join(outputsDir, "css", "space");
  const scssFolder = path.join(outputsDir, "scss", "space");

  // Create output directories if they don't exist
  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });

  const convertAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'convert',
      message: 'Would you like to convert the tokens to other units (pt, rem, em, %)?',
      default: true
    }
  ]);

  let unitsAnswer;
  let unitFileExists, unitCssFileExists, unitScssFileExists;

  if (convertAnswer.convert) {
    console.log(chalk.black.bgMagentaBright("\n======================================="));
    console.log(chalk.bold("🔄 CONVERTING SPACING TOKENS TO OTHER UNITS"));
    console.log(chalk.black.bgMagentaBright("=======================================\n"));

    // Ask the user to select the units to convert to
    unitsAnswer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'units',
        message: 'Please, select the units you want to use to convert your tokens:',
        choices: [
          { name: 'pt', value: 'pt' },
          { name: 'rem', value: 'rem' },
          { name: 'em', value: 'em' },
          { name: '%', value: 'percent' }
        ],
        validate: (input) => {
          if (input.length === 0) {
            return "❌ You must select at least one unit.";
          }
          return true;
        }
      }
    ]);

    // Convert and save tokens in selected units
    const units = unitsAnswer.units;
    for (const unit of units) {
      const convertedTokens = convertPxToOtherUnits(tokensData, unit);
      unitFileExists = saveTokensToFile({ [name]: convertedTokens }, tokensFolder, `space_tokens_${unit}.json`);
      unitCssFileExists = saveCSSTokensToFile(convertedTokens, name, cssFolder, `space_variables_${unit}.css`);
      unitScssFileExists = saveSCSSTokensToFile(convertedTokens, name, scssFolder, `space_variables_${unit}.scss`);
      console.log(chalk.whiteBright(`✅ ${unitFileExists ? 'Updated' : 'Saved'}: outputs/tokens/space/space_tokens_${unit}.json`));
      console.log(chalk.whiteBright(`✅ ${unitCssFileExists ? 'Updated' : 'Saved'}: outputs/css/space/space_variables_${unit}.css`));
      console.log(chalk.whiteBright(`✅ ${unitScssFileExists ? 'Updated' : 'Saved'}: outputs/scss/space/space_variables_${unit}.scss`));
    }

    // Delete unused unit files
    deleteUnusedUnitFiles(tokensFolder, units, 'json');
    deleteUnusedUnitFiles(cssFolder, units, 'css');
    deleteUnusedUnitFiles(scssFolder, units, 'scss');
  } else {
    // Delete all unit files if no conversion is selected
    deleteUnusedUnitFiles(tokensFolder, [], 'json');
    deleteUnusedUnitFiles(cssFolder, [], 'css');
    deleteUnusedUnitFiles(scssFolder, [], 'scss');
  }
  
  await showLoader(chalk.bold.yellow("\n🪄 Finalizing your spell..."), 2000);

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // Save the px tokens files
  const jsonFileExists = saveTokensToFile({ [name]: tokensData }, tokensFolder, `space_tokens_px.json`);
  const cssFileExists = saveCSSTokensToFile(tokensData, name, cssFolder, `space_variables_px.css`);
  const scssFileExists = saveSCSSTokensToFile(tokensData, name, scssFolder, `space_variables_px.scss`);

  console.log(chalk.whiteBright(`✅ ${jsonFileExists ? 'Updated' : 'Saved'}: outputs/tokens/space/space_tokens_px.json`));
  console.log(chalk.whiteBright(`✅ ${cssFileExists ? 'Updated' : 'Saved'}: outputs/css/space/space_variables_px.css`));
  console.log(chalk.whiteBright(`✅ ${scssFileExists ? 'Updated' : 'Saved'}: outputs/scss/space/space_variables_px.scss`));

  if (convertAnswer.convert) {
    const units = unitsAnswer.units;
    for (const unit of units) {
      console.log(chalk.whiteBright(`✅ ${unitFileExists ? 'Updated' : 'Saved'}: outputs/tokens/space/space_tokens_${unit}.json`));
      console.log(chalk.whiteBright(`✅ ${unitCssFileExists ? 'Updated' : 'Saved'}: outputs/css/space/space_variables_${unit}.css`));
      console.log(chalk.whiteBright(`✅ ${unitScssFileExists ? 'Updated' : 'Saved'}: outputs/scss/space/space_variables_${unit}.scss`));
    }
  }

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("✅🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.magentaBright("Spacing Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄📏\n"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
};

// Start the main function
main();