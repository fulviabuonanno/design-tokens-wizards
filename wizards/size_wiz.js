import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// If version argument is provided, display the version.
const versionArg = process.argv.find(arg => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Size Tokens Wizard - Version ${version}`));
}

// Get the current file and directory using file URL.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Displays a loader with progressing dots for the specified duration.
 * @param {string} message - The message to display.
 * @param {number} duration - Duration in milliseconds.
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
 * Prompts the user for input configuration to generate size tokens.
 * Returns an object containing unit, token name, number of values, naming choice, scale, and cardinal format.
 */
const askForInput = async () => {
  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("⭐️ STEP 1: BASE UNIT"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  // Inform the user about the base unit (px).
  console.log(chalk.blue("ℹ️ The base unit for size tokens is set to 'px'."));
  const unit = 'px';

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 2: NAME YOUR TOKENS"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  // Prompt the user to select a name for the tokens.
  const nameAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: '📝 What name would you like to assign to your size tokens?',
      choices: ['size', 'sizing', 'dimension', 'custom']
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

  // Prompt the user to choose a scale.
  const scaleAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'scale',
      message: '🔢 Select the scale to use for your values: \n>>>',
      choices: [
        { name: 'A. 4px-Grid', value: 'A' },
        { name: 'B. 8-Point Grid', value: 'B' },
        { name: 'C. More information about Scales', value: 'C' }
      ],
      filter: (input) => input.toUpperCase() // Convert input to uppercase.
    }
  ]);

  if (scaleAnswer.scale === 'C') {
    console.log(chalk.black.bgBlueBright("\n======================================="));
    console.log(chalk.bold("📚 SCALE INFORMATION"));
    console.log(chalk.black.bgBlueBright("=======================================\n"));
    console.log("Scale Name       | Description                                      | Examples");
    console.log("--------------------------------------------------------------------------------");
    console.log("4px-Grid         | A standard scale where each step is 4 units.     | 4, 8, 12, 16, ...");
    console.log("8-point Grid     | A standard scale where each step is 8 units.     | 8, 16, 24, 32, ...");
    console.log(chalk.black.bgBlueBright("=======================================\n"));

    // Prompt the user to choose the scale again after showing the scale information.
    const newScaleAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'scale',
        message: '🔢 Select the scale to use for your values: \n>>>',
        choices: [
          { name: 'A. 4px-Grid', value: 'A' },
          { name: 'B. 8-Point Grid', value: 'B' }
        ]
      }
    ]);
    scaleAnswer.scale = newScaleAnswer.scale;
  }

  const scale = scaleAnswer.scale;

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 4: DEFINE NUMBER OF VALUES"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  // Prompt the user to define how many values they wish to generate.
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

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 5: DEFINE SCALE NAMING CRITERIA"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  /**
   * Prompts the user to select the naming criteria for the scale.
   * If the Cardinal naming is selected, it further asks for the format (padded or unpadded).
   */
  const askForNamingCriteria = async () => {
    let choices = [];
    if (numValues <= 20) {
      choices = [
        { name: 'T-shirt size (e.g., xs, sm, md, lg, xl)', value: 'A' },
        { name: 'Incremental (e.g., 100, 200, 300)', value: 'B' },
        { name: 'Cardinal (e.g., 1, 2, 3)', value: 'C' },
        { name: 'Alphabetical (e.g., A, B, C or a, b, c)', value: 'D' }
      ];
    } else if (numValues < 27) {
      choices = [
        { name: 'Incremental (e.g., 100, 200, 300)', value: 'B' },
        { name: 'Cardinal (e.g., 1, 2, 3)', value: 'C' },
        { name: 'Alphabetical (e.g., A, B, C or a, b, c)', value: 'D' }
      ];
    } else { // numValues >= 27
      choices = [
        { name: 'Incremental (e.g., 100, 200, 300)', value: 'B' },
        { name: 'Cardinal (e.g., 1, 2, 3)', value: 'C' }
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

    let cardinalFormat = 'unpadded';
    let alphabeticalCase = 'uppercase';
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
    } else if (namingChoiceAnswer.namingChoice === 'D') {
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
    }

    return { 
      namingChoice: namingChoiceAnswer.namingChoice, 
      cardinalFormat, 
      alphabeticalCase 
    };
  };

  let namingChoice = await askForNamingCriteria();
  let cardinalFormat = namingChoice.cardinalFormat;
  let alphabeticalCase = namingChoice.alphabeticalCase;

  // Validate naming criteria for T-shirt and Alphabetical choices given the number of values.
  while ((namingChoice.namingChoice === 'A' && numValues > 20) || (namingChoice.namingChoice === 'D' && numValues > 26)) {
    if (namingChoice.namingChoice === 'A' && numValues > 20) {
      console.log(chalk.red("❌ T-shirt Size scale naming criteria is not recommended for more than 20 values. Please consider using Incremental or Cardinal naming criteria."));
    } else if (namingChoice.namingChoice === 'D' && numValues > 26) {
      console.log(chalk.red("❌ Alphabetical scale naming criteria is not recommended for more than 26 values."));
    }
    namingChoice = await askForNamingCriteria();
    cardinalFormat = namingChoice.cardinalFormat;
    alphabeticalCase = namingChoice.alphabeticalCase;
  }

  return { unit, name, numValues, namingChoice: namingChoice.namingChoice, scale, cardinalFormat, alphabeticalCase };
};

/**
 * Generates size tokens based on the provided parameters.
 * @param {string} unit - The base unit (e.g., "px").
 * @param {number} numValues - Total number of token values to generate.
 * @param {string} namingChoice - Naming criteria chosen by the user.
 * @param {string} scale - Selected scale type ("A" or "B").
 * @param {string} cardinalFormat - Format for Cardinal naming ("padded" or "unpadded").
 * @param {string} alphabeticalCase - Case for Alphabetical naming ("uppercase" or "lowercase").
 * @returns {object} tokens - Generated tokens object.
 */
const generateSizeTokens = (unit, numValues, namingChoice, scale, cardinalFormat, alphabeticalCase) => {
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
    let name;
    switch (namingChoice) {
      case "A":
        name = ["3xs", "2xs", "xs", "s", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"][i - 1] || `size${i}`;
        break;
      case "B":
        name = (i * 100).toString();
        break;
      case "C":
        name = cardinalFormat === 'padded' ? i.toString().padStart(2, '0') : i.toString();
        break;
      case "D":
        // Para Alphabetical, genera la letra según el case seleccionado.
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
 * Converts tokens from the base unit (px) to another unit using defined conversion functions.
 * @param {object} tokens - The original tokens in px.
 * @param {string} unit - The target unit (pt, rem, em, percent).
 * @returns {object} convertedTokens - Tokens converted to the target unit.
 */
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
      type: "sizing"
    };
  }
  return convertedTokens;
};

/**
 * Recursively sorts an object by its keys using numeric order when possible.
 * @param {object} obj - The object to be sorted.
 * @returns {object} Sorted object.
 */
const sortObjectRecursively = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectRecursively);
  }
  const sortedKeys = Object.keys(obj).sort((a, b) => {
    // If both keys can be converted to numbers, sort numerically.
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    // Otherwise, use localeCompare.
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
 * It manually sorts the keys of objects using numeric order when possible.
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
  } else {
    // Manually sort the keys using numeric comparison when possible.
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
  }
};

/**
 * Saves token data as a JSON file.
 * The entire object is sorted recursively to ensure proper numeric order.
 * Then a custom stringify function is used so that keys remain in the desired order.
 * @param {object} tokensData - The tokens data to write.
 * @param {string} folder - Target folder.
 * @param {string} fileName - Name of the JSON file.
 * @returns {boolean} Whether the file existed prior to saving.
 */
const saveTokensToFile = (tokensData, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);

  // Sort the tokens recursively.
  const sortedTokensData = sortObjectRecursively(tokensData);

  // Use the custom stringify to preserve order.
  const outputJSON = customStringify(sortedTokensData, 2);
  fs.writeFileSync(filePath, outputJSON);
  return fileExists;
};

/**
 * Converts tokens to CSS variable declarations.
 * @param {object} tokens - The tokens object.
 * @param {string} name - The naming prefix.
 * @returns {string} CSS content.
 */
const convertTokensToCSS = (tokens, name) => {
    // Ordena las claves numéricamente cuando sean valores numéricos
    const sortedKeys = Object.keys(tokens).sort((a, b) => {
        const numA = Number(a);
        const numB = Number(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return a.localeCompare(b);
    });
    let cssVariables = ':root {\n';
    sortedKeys.forEach(key => {
        cssVariables += `  --${name}-${key}: ${tokens[key].value};\n`;
    });
    cssVariables += '}';
    return cssVariables;
};

/**
 * Saves CSS variables to a file.
 * @param {object} tokens - The tokens object.
 * @param {string} name - The naming prefix.
 * @param {string} folder - Target folder.
 * @param {string} fileName - Name of the CSS file.
 * @returns {boolean} Whether the file existed prior to saving.
 */
const saveCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const cssContent = convertTokensToCSS(tokens, name);
  fs.writeFileSync(filePath, cssContent);
  return fileExists;
};

/**
 * Converts tokens to SCSS variable declarations.
 * @param {object} tokens - The tokens object.
 * @param {string} name - The naming prefix.
 * @returns {string} SCSS content.
 */
const convertTokensToSCSS = (tokens, name) => {
    // Ordena las claves para asegurar que se genere de forma correcta
    const sortedKeys = Object.keys(tokens).sort((a, b) => {
        const numA = Number(a);
        const numB = Number(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return a.localeCompare(b);
    });
    let scssVariables = '';
    sortedKeys.forEach(key => {
        scssVariables += `$${name}-${key}: ${tokens[key].value};\n`;
    });
    return scssVariables;
};

/**
 * Saves SCSS variables to a file.
 * @param {object} tokens - The tokens object.
 * @param {string} name - The naming prefix.
 * @param {string} folder - Target folder.
 * @param {string} fileName - Name of the SCSS file.
 * @returns {boolean} Whether the file existed prior to saving.
 */
const saveSCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const scssContent = convertTokensToSCSS(tokens, name);
  fs.writeFileSync(filePath, scssContent);
  return fileExists;
};

/**
 * Deletes files corresponding to units that were not selected.
 * @param {string} folder - The target folder.
 * @param {Array} selectedUnits - Array of selected unit strings.
 * @param {string} fileExtension - The extension of the files (e.g., "json", "css", "scss").
 */
const deleteUnusedUnitFiles = (folder, selectedUnits, fileExtension) => {
  const unitFiles = {
    pt: `size_variables_pt.${fileExtension}`,
    rem: `size_variables_rem.${fileExtension}`,
    em: `size_variables_em.${fileExtension}`,
    percent: `size_variables_percent.${fileExtension}`
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
 * Main function orchestrating the token generation process:
 * - Prompts the user for inputs.
 * - Generates tokens.
 * - Saves tokens in JSON, CSS, and SCSS formats.
 * - Optionally converts tokens to additional units.
 */
const main = async () => {
  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  await showLoader(chalk.bold.magenta("🧚 Casting the magic of tokens"), 2000);

  console.log(chalk.whiteBright("\n❤️ Welcome to the ") + chalk.bold.blue("Size Tokens Wizard") + chalk.whiteBright(" script! \nLet this wizard 🧙 guide you through creating your size tokens step by step. \nGenerate your tokens and prepare them ready for using or syncing in ") + chalk.underline("Tokens Studio") + chalk.whiteBright("."));

  const input = await askForInput();
  if (!input) return;

  const { unit, name, numValues, namingChoice, scale, cardinalFormat, alphabeticalCase } = input;

  // Generate token data based on the user configuration.
  const tokensData = generateSizeTokens(unit, numValues, namingChoice, scale, cardinalFormat, alphabeticalCase);

  const outputsDir = path.join(__dirname, "..", "outputs");
  const tokensFolder = path.join(outputsDir, "tokens", "size");
  const cssFolder = path.join(outputsDir, "css", "size");
  const scssFolder = path.join(outputsDir, "scss", "size");

  // Ensure output directories exist.
  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder, { recursive: true });
  if (!fs.existsSync(scssFolder)) fs.mkdirSync(scssFolder, { recursive: true });

  // Save size tokens in JSON format.
  const jsonFileExists = saveTokensToFile({ [name]: tokensData }, tokensFolder, 'size_tokens_px.json');

  // Save CSS variables.
  const cssFileExists = saveCSSTokensToFile(tokensData, name, cssFolder, 'size_variables.css');

  // Save SCSS variables.
  const scssFileExists = saveSCSSTokensToFile(tokensData, name, scssFolder, 'size_variables.scss');

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔄 CONVERTING SIZE TOKENS TO OTHER UNITS"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  // Ask if the user wants to convert tokens to other units.
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
    console.log(chalk.black.bgBlueBright("\n======================================="));
    console.log(chalk.bold("🔄 CONVERTING SIZE TOKENS TO OTHER UNITS"));
    console.log(chalk.black.bgBlueBright("=======================================\n"));

    // Prompt the user to select the units for conversion.
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

    // For each selected unit, convert and save the tokens.
    const units = unitsAnswer.units;
    for (const unit of units) {
      const convertedTokens = convertPxToOtherUnits(tokensData, unit);
      unitFileExists = saveTokensToFile({ [name]: convertedTokens }, tokensFolder, `size_tokens_${unit}.json`);
      unitCssFileExists = saveCSSTokensToFile(convertedTokens, name, cssFolder, `size_variables_${unit}.css`);
      unitScssFileExists = saveSCSSTokensToFile(convertedTokens, name, scssFolder, `size_variables_${unit}.scss`);
      console.log(chalk.whiteBright(`✅ ${unitFileExists ? 'Updated' : 'Saved'}: outputs/tokens/size/size_tokens_${unit}.json`));
      console.log(chalk.whiteBright(`✅ ${unitCssFileExists ? 'Updated' : 'Saved'}: outputs/css/size/size_variables_${unit}.css`));
      console.log(chalk.whiteBright(`✅ ${unitScssFileExists ? 'Updated' : 'Saved'}: outputs/scss/size/size_variables_${unit}.scss`));
    }

    // Delete unit files for unselected units.
    deleteUnusedUnitFiles(tokensFolder, units, 'json');
    deleteUnusedUnitFiles(cssFolder, units, 'css');
    deleteUnusedUnitFiles(scssFolder, units, 'scss');
  } else {
    // If conversion was not selected, delete all additional unit files.
    deleteUnusedUnitFiles(tokensFolder, [], 'json');
    deleteUnusedUnitFiles(cssFolder, [], 'css');
    deleteUnusedUnitFiles(scssFolder, [], 'scss');
  }
  
  await showLoader(chalk.bold.magenta("\n🪄 Finalizing your spell..."), 2000);

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  console.log(chalk.whiteBright(`✅ ${jsonFileExists ? 'Updated' : 'Saved'}: outputs/tokens/size/size_tokens_px.json`));
  console.log(chalk.whiteBright(`✅ ${cssFileExists ? 'Updated' : 'Saved'}: outputs/css/size/size_variables_px.css`));
  console.log(chalk.whiteBright(`✅ ${scssFileExists ? 'Updated' : 'Saved'}: outputs/scss/size/size_variables_px.scss`));

  if (convertAnswer.convert) {
    const units = unitsAnswer.units;
    for (const unit of units) {
      console.log(chalk.whiteBright(`✅ ${unitFileExists ? 'Updated' : 'Saved'}: outputs/tokens/size/size_tokens_${unit}.json`));
      console.log(chalk.whiteBright(`✅ ${unitCssFileExists ? 'Updated' : 'Saved'}: outputs/css/size/size_variables_${unit}.css`));
      console.log(chalk.whiteBright(`✅ ${unitScssFileExists ? 'Updated' : 'Saved'}: outputs/scss/size/size_variables_${unit}.scss`));
    }
  }

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("✅🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.blueBright("Size Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄📏\n"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
};

// Start the main function.
main();