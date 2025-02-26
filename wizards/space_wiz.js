// Import modules for file operations, path handling, CLI prompts, URL handling, and terminal styling.
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from 'url';
import chalk from "chalk";

// Check if a version flag argument was provided (e.g., --version=1.0.0). If so, display the version.
const versionArg = process.argv.find(arg => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Space Tokens Wizard - Version ${version}`));
}

// Resolve the filename and directory name for ES Modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a loader function to simulate progress (prints dots over the duration).
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

// ==================================================================
// Ask for user input specific to spacing tokens.
// This function guides the user through several prompts to define token properties.
const askForInput = async () => {
  
  // STEP 1: Define base unit. For spacing tokens, this script always uses pixels.
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("⭐️ STEP 1: BASE UNIT"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  console.log(chalk.magenta("ℹ️ The base unit for spacing tokens is set to 'px'."));
  const unit = 'px';

  // STEP 2: Ask the user for a name to assign to the spacing tokens.
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
  // If the user selects "custom", prompt for a custom name and validate it.
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

  // STEP 3: Ask the user to choose a scale for spacing values. Scale options define the grid used.
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 3: DEFINE SCALE"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
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
  
  // If the user selects "More information", display additional details about each scale choice.
  if (scaleAnswer.scale === 'C') {
    console.log(chalk.black.bgMagentaBright("\n======================================="));
    console.log(chalk.bold("📚 SCALE INFORMATION"));
    console.log(chalk.black.bgMagentaBright("=======================================\n"));
    console.log("Scale Name       | Description                                      | Examples");
    console.log("--------------------------------------------------------------------------------");
    console.log("4px-Grid         | A standard scale where each step is 4 units.     | 4, 8, 12, 16, ...");
    console.log("8-point Grid     | A standard scale where each step is 8 units.     | 8, 16, 24, 32, ...");
    console.log(chalk.black.bgMagentaBright("=======================================\n"));
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

  // STEP 4: Ask the user to define how many spacing token values to generate.
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 4: DEFINE NUMBER OF VALUES"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
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

  // STEP 5: Ask the user to choose a naming criteria for the scale.
  // Options include T-shirt sizes, Incremental values, Cardinal (numbered), or Alphabetical values.
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 5: DEFINE SCALE NAMING CRITERIA"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  const askForNamingCriteria = async () => {
    let choices = [];
    // When the number of values is 20 or less, allow all naming options.
    if (numValues <= 20) {
      choices = [
        { name: 'T-shirt size (e.g., xs, sm, md, lg, xl)', value: 'A' },
        { name: 'Incremental (e.g., 50, 100, 150, 200)', value: 'B' },
        { name: 'Cardinal (e.g., 1, 2, 3)', value: 'C' },
        { name: 'Alphabetical (e.g., A, B, C or a, b, c)', value: 'D' }
      ];
    } else if (numValues >= 27) {
      // For higher value counts, restrict to incremental or cardinal naming.
      choices = [
        { name: 'Incremental (e.g., 50, 100, 150, 200)', value: 'B' },
        { name: 'Cardinal (e.g., 1, 2, 3)', value: 'C' }
      ];
    } else {
      choices = [
        { name: 'Incremental (e.g., 50, 100, 150, 200)', value: 'B' },
        { name: 'Cardinal (e.g., 1, 2, 3)', value: 'C' },
        { name: 'Alphabetical (e.g., A, B, C or a, b, c)', value: 'D' }
      ];
    }
    // Prompt for the naming criteria.
    const namingChoiceAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'namingChoice',
        message: 'Please choose your scale naming criteria:',
        choices: choices
      }
    ]);
    // Set default additional options.
    let cardinalFormat = 'unpadded';
    let alphabeticalCase;
    let incrementalStep = 100; 
    // For incremental naming, choose the step increment.
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
    // For cardinal naming, choose padded or unpadded format.
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
    // For alphabetical naming, choose between uppercase or lowercase.
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

  // Prompt the naming criteria.
  let { namingChoice, cardinalFormat, alphabeticalCase, incrementalStep } = await askForNamingCriteria();

  // Validate naming criteria when the number of values exceeds recommended limits.
  while ((namingChoice === 'A' && numValues > 20) || (namingChoice === 'D' && numValues > 26)) {
    if (namingChoice === 'A' && numValues > 20) {
      console.log(chalk.red("❌ T-shirt Size naming criteria is not recommended for more than 20 values. Please choose Incremental or Cardinal naming criteria."));
    } else if (namingChoice === 'D' && numValues > 26) {
      console.log(chalk.red("❌ Alphabetical naming criteria is not recommended for more than 26 values."));
    }
    ({ namingChoice, cardinalFormat, alphabeticalCase } = await askForNamingCriteria());
  }

  // Return all user input data to be used in token generation.
  return { unit, name, numValues, namingChoice, cardinalFormat, alphabeticalCase, scale, incrementalStep };
};


// ==================================================================
// Generate spacing tokens using the input information.
// Tokens are generated based on the chosen numeric scale and naming criteria.
const generateSpacingTokens = (unit, numValues, namingChoice, scale, cardinalFormat, alphabeticalCase, incrementalStep = 100) => {
  const tokens = {};
  let baseValue;
  
  // Determine the base multiplication value depending on the scale.
  switch (scale) {
    case "A":
      baseValue = 4;
      break;
    case "B":
      baseValue = 8;
      break;
  }
  
  // Loop through the number of values to generate tokens.
  for (let i = 1; i <= numValues; i++) {
    let tokenName;
    // Determine token name based on chosen naming criteria.
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
    // Calculate the spacing value.
    const value = baseValue * i;
    tokens[tokenName] = {
      value: `${value}${unit}`,
      type: "spacing"
    };
  }
  return tokens;
};


// ==================================================================
// Token Conversion and File Saving Functions:

// Convert tokens from pixels to another selected unit (pt, rem, em, or percent).
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

// Save tokens to a JSON file. The tokens are first recursively sorted and then stringified.
const saveTokensToFile = (tokensData, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  
  const sortedTokensData = sortObjectRecursively(tokensData);
  const outputJSON = customStringify(sortedTokensData, 2);
  
  fs.writeFileSync(filePath, outputJSON);
  return fileExists;
};

// Convert tokens into CSS custom property declarations.
const convertTokensToCSS = (tokens, name) => {
  let cssVariables = ':root {\n';
  const tshirtOrder = ["3xs", "2xs", "xs", "s", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"];
  // Sort tokens based on a predefined T-shirt order.
  const sortedKeys = Object.keys(tokens).sort((a, b) => {
    const indexA = tshirtOrder.indexOf(a);
    const indexB = tshirtOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });
  sortedKeys.forEach(key => {
    cssVariables += `  --${name}-${key}: ${tokens[key].value};\n`;
  });
  cssVariables += '}';
  return cssVariables;
};

// Save CSS tokens to a file.
const saveCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const cssContent = convertTokensToCSS(tokens, name);
  fs.writeFileSync(filePath, cssContent);
  return fileExists;
};

// Convert tokens into SCSS variable declarations.
const convertTokensToSCSS = (tokens, name) => {
  let scssVariables = '';
  const tshirtOrder = ["3xs", "2xs", "xs", "s", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"];
  const sortedKeys = Object.keys(tokens).sort((a, b) => {
    const indexA = tshirtOrder.indexOf(a);
    const indexB = tshirtOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });
  sortedKeys.forEach(key => {
    scssVariables += `$${name}-${key}: ${tokens[key].value};\n`;
  });
  return scssVariables;
};

// Save SCSS tokens to a file.
const saveSCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const scssContent = convertTokensToSCSS(tokens, name);
  fs.writeFileSync(filePath, scssContent);
  return fileExists;
};

// Delete files that were generated for units that were not selected by the user.
const deleteUnusedUnitFiles = (folder, selectedUnits, fileExtension, filePrefix = 'space_variables') => {
  const unitFiles = {
    pt: `${filePrefix}_pt.${fileExtension}`,
    rem: `${filePrefix}_rem.${fileExtension}`,
    em: `${filePrefix}_em.${fileExtension}`,
    percent: `${filePrefix}_percent.${fileExtension}`
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

// ==================================================================
// Utility: Recursively sort an object by its keys (using numeric ordering when possible).
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

// Utility: Custom stringify function that preserves key order.
const customStringify = (value, indent = 2) => {
    const spacer = ' '.repeat(indent);
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        const items = value.map(item => customStringify(item, indent + 2));
        return "[\n" + spacer + items.join(",\n" + spacer) + "\n" + ' '.repeat(indent - 2) + "]";
    }
    const tshirtOrder = ["3xs", "2xs", "xs", "s", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"];
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

// ==================================================================
// Main function that orchestrates the wizard process.
const main = async () => {
  
  // Display starting messages.
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // Show a loader animation to simulate process startup.
  await showLoader(chalk.bold.yellow("\n🧚 Casting the magic of tokens"), 2000);

  // Display a welcome message with instructions.
  console.log(chalk.whiteBright("\n❤️ Welcome to the ") + chalk.bold.magenta("Spacing Tokens Wizard") + chalk.whiteBright(" script! \nLet this wizard 🧙 guide you through creating your spacing tokens step by step. \nGenerate your tokens and prepare them for using or syncing in ") + chalk.underline("Tokens Studio") + chalk.whiteBright("."));

  // Prompt for required input from the user.
  const input = await askForInput();
  if (!input) return;
  const { unit, name, numValues, namingChoice, scale, cardinalFormat, alphabeticalCase, incrementalStep } = input;

  // Generate the spacing tokens based on the user input.
  const tokensData = generateSpacingTokens(unit, numValues, namingChoice, scale, cardinalFormat, alphabeticalCase, incrementalStep);

  // Define output directories for tokens, CSS, and SCSS files.
  const outputsDir = path.join(__dirname, "..", "outputs");
  const tokensFolder = path.join(outputsDir, "tokens", "space");
  const cssFolder = path.join(outputsDir, "css", "space");
  const scssFolder = path.join(outputsDir, "scss", "space");

  // Ensure output directories exist.
  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });

  //====================================================================
  // UNIT CONVERSION:
  // Ask the user whether to convert tokens into other units (pt, rem, em, percent).
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔄 CONVERTING SPACING TOKENS TO OTHER UNITS"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  const convertTokensResp = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'convert',
      message: "Would you like to convert the tokens to other units (pt, rem, em, %)? (Y/n)",
      default: true,
    }
  ]);

  let units = [];
  let unitsAnswer = { units: [] }; 

  // If conversion is selected, prompt for the units.
  if (convertTokensResp.convert) {
    unitsAnswer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'units',
        message: 'Please, select the units you want to use to convert your tokens (leave empty to skip):',
        choices: [
          { name: 'pt', value: 'pt' },
          { name: 'rem', value: 'rem' },
          { name: 'em', value: 'em' },
          { name: '%', value: 'percent' }
        ]
      }
    ]);
    units = unitsAnswer.units; 
    // If units are selected, convert tokens and save files for each.
    if (units.length > 0) {
      for (const unit of units) {
        const unitSuffix = `_${unit}`;
        const convertedTokens = convertPxToOtherUnits(tokensData, unit);
        const unitJsonFileExists = saveTokensToFile({ [name]: convertedTokens }, tokensFolder, `space_tokens${unitSuffix}.json`);
        const unitCssFileExists = saveCSSTokensToFile(convertedTokens, name, cssFolder, `space_variables${unitSuffix}.css`);
        const unitScssFileExists = saveSCSSTokensToFile(convertedTokens, name, scssFolder, `space_variables${unitSuffix}.scss`);
        console.log(chalk.whiteBright(`✅ ${unitJsonFileExists ? 'Updated' : 'Saved'}: outputs/tokens/space/space_tokens${unitSuffix}.json`));
        console.log(chalk.whiteBright(`✅ ${unitCssFileExists ? 'Updated' : 'Saved'}: outputs/css/space/space_variables${unitSuffix}.css`));
        console.log(chalk.whiteBright(`✅ ${unitScssFileExists ? 'Updated' : 'Saved'}: outputs/scss/space/space_variables${unitSuffix}.scss`));
      }
    }
  } 

  //====================================================================
  // FINAL FILE SAVING:
  // After conversions, display a final loader before saving primary files in base (px) unit.
  await showLoader(chalk.bold.yellow("\n🪄 Finalizing your spell..."), 2000);
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // Save primary tokens in px to JSON, CSS, and SCSS formats.
  const jsonFileExists = saveTokensToFile({ [name]: tokensData }, tokensFolder, `space_tokens_px.json`);
  const cssFileExists = saveCSSTokensToFile(tokensData, name, cssFolder, `space_variables_px.css`);
  const scssFileExists = saveSCSSTokensToFile(tokensData, name, scssFolder, `space_variables_px.scss`);

  console.log(chalk.whiteBright(`✅ ${jsonFileExists ? 'Updated' : 'Saved'}: outputs/tokens/space/space_tokens_px.json`));
  console.log(chalk.whiteBright(`✅ ${cssFileExists ? 'Updated' : 'Saved'}: outputs/css/space/space_variables_px.css`));
  console.log(chalk.whiteBright(`✅ ${scssFileExists ? 'Updated' : 'Saved'}: outputs/scss/space/space_variables_px.scss`));

  // If conversion units were selected, output update messages.
  if (convertTokensResp.convert) {
    const units = unitsAnswer.units;
    for (const unit of units) {
      console.log(chalk.whiteBright(`✅ ${unit} converted tokens have been saved.`));
    }
  }
  
  // Clean up any unused unit files.
  deleteUnusedUnitFiles(tokensFolder, units, 'json', 'space_tokens');
  deleteUnusedUnitFiles(cssFolder, units, 'css', 'space_variables');
  deleteUnusedUnitFiles(scssFolder, units, 'scss', 'space_variables');

  // Display finalization messages.
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("✅🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.magentaBright("Spacing Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄📏\n"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
};

// Run the main wizard function.
main();