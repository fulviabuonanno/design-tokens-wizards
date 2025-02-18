import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from 'url';
import chalk from 'chalk';

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

// Function to handle user input for generating size tokens
const askForInput = async () => {
  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("⭐️ STEP 1: DEFINE UNIT"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  // Inform the user about the base unit
  console.log(chalk.blue("ℹ️ The base unit for size tokens is set to 'px'."));
  const unit = 'px';

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 2: NAME YOUR TOKENS"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  // Use inquirer to ask for a name for the size tokens
  const nameAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '📝 What name would you like to assign to your size tokens? \n(e.g., size, sizing, dimension): \n>>>',
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
  const name = nameAnswer.name;

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 3: DEFINE SCALE"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  // Use inquirer to ask for the scale
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
      filter: (input) => input.toUpperCase() // Convert input to uppercase to handle lowercase inputs
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

    // Ask for the scale again after showing information
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

  // Use inquirer to ask for the number of values
  const numValuesAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'numValues',
      message: '🔢 How many values would you like to define? \n>>>',
      validate: (input) => {
        const num = parseInt(input);
        if (isNaN(num) || num <= 0) {
          return `❌ Invalid number of values "${input}". Please provide a valid number.`;
        } else if (num > 30) {
          return `❌ Number of values "${input}" is too high. Please provide a number less than or equal to 30.`;
        }
        return true;
      }
    }
  ]);
  const numValues = parseInt(numValuesAnswer.numValues);

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 5: DEFINE SCALE NAMING CRITERIA"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  // Function to ask for naming criteria
  const askForNamingCriteria = async () => {
    const namingChoiceAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'namingChoice',
        message: 'Please choose scale naming criteria of your preference:',
        choices: [
          { name: 'A. T-shirt size (e.g., xs, sm, md, lg, xl)', value: 'A' },
          { name: 'B. Incremental (e.g., 100, 200, 300)', value: 'B' },
          { name: 'C. Cardinal (e.g., 1, 2, 3)', value: 'C' },
          { name: 'D. Alphabetical (e.g., A, B, C or a, b, c)', value: 'D' }
        ]
      }
    ]);
    return namingChoiceAnswer.namingChoice;
  };

  let namingChoice = await askForNamingCriteria();

  // Check if T-shirt size is selected and number of values is more than 20
  while ((namingChoice === 'A' && numValues > 20) || (namingChoice === 'D' && numValues > 26)) {
    if (namingChoice === 'A' && numValues > 20) {
      console.log(chalk.red("❌ T-shirt Size scale naming criteria is not recommended for more than 20 values. Please consider using Incremental or Cardinal naming criteria."));
    } else if (namingChoice === 'D' && numValues > 26) {
      console.log(chalk.red("❌ Alphabetical scale naming criteria is not recommended for more than 26 values."));
    }
    namingChoice = await askForNamingCriteria();
  }

  return { unit, name, numValues, namingChoice, scale };
};

// Function to generate size tokens based on user input
const generateSizeTokens = (unit, numValues, namingChoice, scale) => {
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
        name = ["3xs", "2xs", "xs", "s", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl","14xl","15xl","13xl"][i - 1] || `size${i}`;
        break;
      case "B":
        name = (i * 100).toString();
        break;
      case "C":
        name = i.toString();
        break;
      case "D":
        name = String.fromCharCode(64 + i).toUpperCase(); // Generate alphabetical names
        break;
    }
    const value = baseValue * i;
    tokens[name] = {
      value: `${value}${unit}`,
      type: "size"
    };
  }
  return tokens;
};

// Function to convert px values to other units
const convertPxToOtherUnits = (tokens, unit) => {
  const conversions = {
    pt: (value) => `${value * 0.75}pt`,
    rem: (value) => `${value / 16}rem`,
    em: (value) => `${value / 16}em`
  };

  const convertedTokens = {};
  for (const [key, token] of Object.entries(tokens)) {
    const numericValue = parseFloat(token.value);
    convertedTokens[key] = {
      value: conversions[unit](numericValue),
      type: "size"
    };
  }
  return convertedTokens;
};

// Function to save size tokens to a JSON file
const saveTokensToFile = (tokensData, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  fs.writeFileSync(filePath, JSON.stringify(tokensData, null, 2));
  return fileExists;
};

// Function to convert tokens to CSS variables
const convertTokensToCSS = (tokens, name) => {
  let cssVariables = ':root {\n';
  for (const key in tokens) {
    cssVariables += `  --${name}-${key}: ${tokens[key].value};\n`;
  }
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

// Main function to orchestrate the size token generation process
const main = async () => {
  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.black.bgBlueBright("======================================="));

  await showLoader(chalk.magenta("\n🧚 Casting the magic of tokens"), 2000);

  console.log(chalk.whiteBright("\n❤️ Welcome to the ") + chalk.bold.blue("Size Tokens Wizard") + chalk.whiteBright(" script! \nLet this wizard 🧙 guide you through creating your size tokens step by step. \nGenerate your tokens and prepare them ready for using or syncing in ") + chalk.underline("Tokens Studio") + chalk.whiteBright("."));

  const input = await askForInput();
  if (!input) return;

  const { unit, name, numValues, namingChoice, scale } = input;

  // Generate size tokens data
  const tokensData = generateSizeTokens(unit, numValues, namingChoice, scale);

  const outputsDir = path.join(__dirname, "outputs");
  const tokensFolder = path.join(outputsDir, "tokens", "size");
  const cssFolder = path.join(outputsDir, "css", "size");

  // Create output directories if they don't exist
  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder, { recursive: true });

  // Save size tokens in JSON format
  const jsonFileExists = saveTokensToFile({ [name]: tokensData }, tokensFolder, 'size_tokens_px.json');

  // Save CSS variables
  const cssFileExists = saveCSSTokensToFile(tokensData, name, cssFolder, 'size_variables.css');

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("🔄 CONVERTING SIZE TOKENS TO OTHER UNITS"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  // Ask if the user wants to convert tokens to other units
  const convertAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'convert',
      message: 'Would you like to convert the tokens to other units (pt, rem, em)?',
      default: true
    }
  ]);

  let unitsAnswer;
  if (convertAnswer.convert) {
    console.log(chalk.black.bgBlueBright("\n======================================="));
    console.log(chalk.bold("🔄 CONVERTING SIZE TOKENS TO OTHER UNITS"));
    console.log(chalk.black.bgBlueBright("=======================================\n"));

    // Ask the user to select the units to convert to
    unitsAnswer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'units',
        message: 'Please, select the units you want to use to convert your tokens:',
        choices: [
          { name: 'pt', value: 'pt' },
          { name: 'rem', value: 'rem' },
          { name: 'em', value: 'em' }
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
      const unitFileExists = saveTokensToFile({ [name]: convertedTokens }, tokensFolder, `size_tokens_${unit}.json`);
      const unitCssFileExists = saveCSSTokensToFile(convertedTokens, name, cssFolder, `size_variables_${unit}.css`);
      console.log(chalk.green(`✅ ${unitFileExists ? 'Updated' : 'Saved'}: outputs/tokens/size/size_tokens_${unit}.json`));
      console.log(chalk.green(`✅ ${unitCssFileExists ? 'Updated' : 'Saved'}: outputs/css/size/size_variables_${unit}.css`));
    }
  }
  
  await showLoader(chalk.magenta("\nFinalizing your spell..."), 2000);

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT JSON FILES"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  console.log(chalk.green(`✅ ${jsonFileExists ? 'Updated' : 'Saved'}: outputs/tokens/size/size_tokens_px.json`));
  console.log(chalk.green(`✅ ${cssFileExists ? 'Updated' : 'Saved'}: outputs/css/size/size_variables_px.css`));

  if (convertAnswer.convert) {
    const units = unitsAnswer.units;
    for (const unit of units) {
      console.log(chalk.green(`✅ ${unitFileExists ? 'Updated' : 'Saved'}: outputs/tokens/size/size_tokens_${unit}.json`));
      console.log(chalk.green(`✅ ${unitCssFileExists ? 'Updated' : 'Saved'}: outputs/css/size/size_variables_${unit}.css`));
    }
  }

  console.log(chalk.black.bgBlueBright("\n======================================="));
  console.log(chalk.bold("✅💪 SPELL COMPLETED"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));

  console.log(chalk.red("Thank you for summoning the power of the Size Tokens Wizard! ❤️🪄📏\n"));
  console.log(chalk.black.bgBlueBright("=======================================\n"));
};

// Start the main function
main();