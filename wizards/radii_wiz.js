import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from 'url';
import chalk from "chalk";

const versionArg = process.argv.find(arg => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Border Radius Tokens Wizard - Version ${version}`));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputsDir = path.join(__dirname, "..", "outputs");

/**
 * Displays a loading message with progressing dots.
 * @param {string} message - The message to show.
 * @param {number} duration - Duration (in ms) for the loader.
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
 * Prompts the user for configuration input.
 * Gathers details such as the token name, whether to include extreme (none and full)
 * values, scale naming for intermediate tokens, and the value scale (minimal or expressive).
 */
const askForInput = async () => {
  
  console.log(chalk.black.bgGreenBright("\n======================================="));
  console.log(chalk.bold("STEP 1: DEFINE TOKEN NAME"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));
  const tokenNameAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'tokenName',
      message: "How would you like to name your border radius tokens?",
      choices: [
        { name: 'border-radius', value: 'border-radius' },
        { name: 'corner-radius', value: 'corner-radius' },
        { name: 'radius', value: 'radius' },
        { name: 'radii', value: 'radii' },
        { name: 'br', value: 'br' },
        { name: 'borderRadius', value: 'borderRadius' },
        { name: 'custom', value: 'custom' }],
        loop: false
    }
  ]);
  let tokenName = tokenNameAnswer.tokenName;
  if (tokenName === 'custom') {
    const customTokenNameAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'customTokenName',
        message: '📝 Please provide a custom name for your border radius tokens:',
        validate: (input) => {
          if (!input) {
            return "❌ Name is required. Please provide a valid name.";
          }
          return true;
        }
      }
    ]);
    tokenName = customTokenNameAnswer.customTokenName;
  }

  let totalTokens = 6;

  console.log(chalk.black.bgGreenBright("\n======================================="));
  console.log(chalk.bold("STEP 2: DEFINE SCALE STRUCTURE"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));
  const noneFullAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'includeExtremes',
      message: "Would you like to include 'none' and 'full' border radius values?",
      default: true
    }
  ]);

  let noneLabel = "none";
  let fullLabel = "full";
  
  if (noneFullAnswer.includeExtremes) {
    const noneResponse = await inquirer.prompt([
      {
        type: 'list',
        name: 'noneWord',
        message: "How would you like to name the minimum border-radius token?",
        choices: [
          { name: 'none', value: 'none' },
          { name: 'flat', value: 'flat' },
          { name: 'square', value: 'square' },
          { name: 'plain', value: 'plain' },
          { name: 'custom', value: 'custom' }
        ]
      }
    ]);
    
    if (noneResponse.noneWord === 'custom') {
      const customNameAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'customName',
          message: '📝 Please provide a name for your border-radius token:',
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
      noneLabel = customNameAnswer.customName;
    } else {
      noneLabel = noneResponse.noneWord;
    }
    
    const fullResponse = await inquirer.prompt([
      {
        type: 'list',
        name: 'fullWord',
        message: "How would you like to name the maximum border-radius token?",
        choices: [
          { name: 'pill', value: 'pill' },
          { name: 'circle', value: 'circle' },
          { name: 'round', value: 'round' },
          { name: 'full', value: 'full' },
          { name: 'custom', value: 'custom' }
        ]
      }
    ]);
    
    if (fullResponse.fullWord === 'custom') {
      const customNameAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'customName',
          message: '📝 Please provide a name for your border-radius token:',
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
      fullLabel = customNameAnswer.customName;
    } else {
      fullLabel = fullResponse.fullWord;
    }
  } else {
    
    console.log(chalk.bold.yellow("\nLet's add intermediate values for your border radius tokens."));
    noneLabel = null;
    fullLabel = null;
    totalTokens = 4;
  }

  let intermediateAnswer = { includeIntermediate: true };
  if (noneFullAnswer.includeExtremes) {
    intermediateAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'includeIntermediate',
        message: "Would you like to add intermediate steps for border radius tokens? (Y/n)",
        default: true
      }
    ]);
    if (!intermediateAnswer.includeIntermediate) {
      console.log(chalk.yellow.bold(`\nYour output files will only include 2 border tokens: ${chalk.whiteBright.underline(noneLabel)} and ${chalk.whiteBright.underline(fullLabel)}.`));
      return { tokenName, unit: 'px', noneLabel, fullLabel, intermediateNaming: null, totalTokens: 2, valueScale: null };
    }
  }

  let intermediateNaming = null;
  while (true) {
    const scaleChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'scaleChoice',
        message: "Which border-radius scale naming do you want to use? Choose one:",
        choices: [
          { name: "T-shirt (e.g., xs, sm, md, lg, xl)", value: 'tshirt' },
          { name: "Ordinal (e.g., 01, 02, 03... or 1, 2, 3...)", value: 'ordinal' },
          { name: "Incremental (e.g., 100, 200, 300, 400)", value: 'incremental' },
          { name: "Alphabetical (e.g., A, B, C... or a, b, c...)", value: 'alphabetical' },
          { name: "Semantic (e.g., subtle, moderate, pronounced)", value: 'semantic' },
          { name: "More Info", value: 'info' }
        ]
      }
    ]);
    
    if (scaleChoice.scaleChoice === 'info') {
      console.log("\n=======================================");
      console.log("SCALE INFORMATION:");
      console.table([
        { scale: 'T-shirt', example: 'xs, sm, md, lg, xl' },
        { scale: 'Ordinal', example: '01, 02, 03.. or 1, 2, 3...' },
        { scale: 'Incremental', example: '100, 200, 300, 400' },
        { scale: 'Alphabetical', example: 'A, B, C... or a, b, c...' },
        { scale: 'Semantic', example: 'subtle, moderate, pronounced' }
      ]);
      console.log("=======================================\n");
    } else if (scaleChoice.scaleChoice === 'tshirt') {
      const tshirtchoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'tshirtoption',
          message: "For T-shirt scale, do you want abbreviated names or full names?",
          choices: [
            { name: "Abbreviated (e.g., xs, sm, md, lg)", value: 'abbr' },
            { name: "Full (e.g., extra small, small, medium, large)", value: 'full' }
          ]
        }
      ]);
      intermediateNaming = { scale: 'tshirt', option: tshirtchoice.tshirtoption };
      break;
    } else if (scaleChoice.scaleChoice === 'ordinal') {
      const ordinalChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'ordinalOption',
          message: "For Ordinal scale, choose the format:",
          choices: [
            { name: "Padded (e.g., 01, 02, 03)", value: 'padded' },
            { name: "Unpadded (e.g., 1, 2, 3)", value: 'unpadded' }
          ]
        }
      ]);
      intermediateNaming = { scale: 'ordinal', option: ordinalChoice.ordinalOption };
      break;
    } else if (scaleChoice.scaleChoice === 'alphabetical') {
      const alphabeticalChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'alphabeticalOption',
          message: "For Alphabetical scale, choose the format:",
          choices: [
            { name: "Uppercase (A, B, C)", value: 'uppercase' },
            { name: "Lowercase (a, b, c)", value: 'lowercase' }
          ]
        }
      ]);
      intermediateNaming = { scale: 'alphabetical', option: alphabeticalChoice.alphabeticalOption };
      break;
    } else if (scaleChoice.scaleChoice === 'incremental') {
      const incrementalChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'incrementalOption',
          message: "For Incremental scale, choose the step increment:",
          choices: [
            { name: "50 in 50 (e.g., 50, 100, 150, 200)", value: '50' },
            { name: "100 in 100 (e.g., 100, 200, 300, 400)", value: '100' }
          ]
        }
      ]);
      intermediateNaming = { scale: 'incremental', option: incrementalChoice.incrementalOption };
      break;
    } else {
      intermediateNaming = scaleChoice.scaleChoice;
      break;
    }
  }

  console.log(chalk.black.bgGreenBright("\n======================================="));
  console.log(chalk.bold("STEP 3: DEFINE VALUE SCALE"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));
  const valueScaleTypeAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'valueScaleType',
      message: "Which value scale would you like to use for the border radius scale?",
      choices: [
        { name: '4-Point Grid System', value: '4' },
        { name: '8-Point Grid System', value: '8' }
      ]
    }
  ]);
  const valueScaleType = valueScaleTypeAnswer.valueScaleType;
  const valueScale = valueScaleType === '4' ? 4 : 8;
  
  return { tokenName, unit: 'px', noneLabel, fullLabel, intermediateNaming, totalTokens, valueScale };
};

/**
 * Generates the border radius tokens using the user’s choices.
 * It creates an array of tokens based on intermediate steps or ranges defined by extreme values.
 */
const generateBorderRadiusTokens = (noneLabel, fullLabel, intermediateNaming, totalTokens, valueScale) => {
  const tokensArray = [];
  const base = valueScale; 

  if (noneLabel === null && fullLabel === null) {
    
    let intermediateNames = [];
    if (intermediateNaming !== null && intermediateNaming.scale === 'tshirt') {
      intermediateNames = intermediateNaming.option === 'abbr' ? ["xs", "sm", "md", "lg"] : ["extra-small", "small", "medium", "large"];
    } else if (intermediateNaming !== null && intermediateNaming.scale === 'ordinal') {
      intermediateNames = intermediateNaming.option === 'padded' ? ["01", "02", "03", "04"] : ["1", "2", "3", "4"];
    } else if (intermediateNaming !== null && intermediateNaming.scale === 'incremental') {
      intermediateNames = intermediateNaming.option === '50' ? ["50", "100", "150", "200"] : ["100", "200", "300", "400"];
    } else if (intermediateNaming !== null && intermediateNaming.scale === 'alphabetical') {
      intermediateNames = intermediateNaming.option === 'uppercase' ? ["A", "B", "C", "D"] : ["a", "b", "c", "d"];
    } else if (intermediateNaming === 'semantic') {
      intermediateNames = ["subtle", "soft", "moderate", "bold"];
    }
    for (let i = 0; i < totalTokens; i++) {
      const intermValue = `${base * (i + 1)}px`;
      const intermName = intermediateNames[i] || `step-${i + 1}`;
      tokensArray.push({ key: intermName.toLowerCase(), value: intermValue, type: "borderRadius" });
    }
  } else {
    
    tokensArray.push({ key: noneLabel.toLowerCase(), value: "0", type: "borderRadius" });
    for (let i = 2; i < totalTokens; i++) {
      const intermValue = `${base * (i - 1)}px`;
      let intermediateNames = [];
      if (intermediateNaming !== null && intermediateNaming.scale === 'tshirt') {
        intermediateNames = intermediateNaming.option === 'abbr' ? ["xs", "sm", "md", "lg"] : ["extra-small", "small", "medium", "large"];
      } else if (intermediateNaming !== null && intermediateNaming.scale === 'ordinal') {
        intermediateNames = intermediateNaming.option === 'padded' ? ["01", "02", "03", "04"] : ["1", "2", "3", "4"];
      } else if (intermediateNaming !== null && intermediateNaming.scale === 'incremental') {
        intermediateNames = intermediateNaming.option === '50' ? ["50", "100", "150", "200"] : ["100", "200", "300", "400"];
      } else if (intermediateNaming !== null && intermediateNaming.scale === 'alphabetical') {
        intermediateNames = intermediateNaming.option === 'uppercase' ? ["A", "B", "C", "D"] : ["a", "b", "c", "d"];
      } else if (intermediateNaming === 'semantic') {
        intermediateNames = ["subtle", "soft", "moderate", "bold"];
      }
      const intermName = intermediateNames[i - 2] || `step-${i}`;
      tokensArray.push({ key: intermName.toLowerCase(), value: intermValue, type: "borderRadius" });
    }
    
    tokensArray.push({ key: fullLabel.toLowerCase(), value: "50%", type: "borderRadius" });
  }
  
  const tokens = {};
  tokensArray.forEach(item => {
    tokens[item.key] = { value: item.value, type: item.type };
  });
  return tokens;
};

/**
 * Converts pixel (px) token values to other units.
 * Supports conversion to rem.
 */
const convertPxToOtherUnits = (tokens, unit) => {
  const conversions = {
    rem: (value) => `${value / 16}rem`
  };

  const convertedTokens = {};
  for (const [key, token] of Object.entries(tokens)) {
    const numericValue = parseFloat(token.value);
    convertedTokens[key] = {
      value: conversions[unit](numericValue),
      type: "borderRadius"
    };
  }
  return convertedTokens;
};

/**
 * Saves tokens data to a file in JSON format.
 */
const saveTokensToFile = (tokensData, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  fs.writeFileSync(filePath, JSON.stringify(tokensData, null, 2));
  return fileExists;
};

/**
 * Converts tokens into CSS custom property declarations.
 */
const convertTokensToCSS = (tokens, name) => {
  let cssVariables = ':root {\n';
  for (const key in tokens) {
    cssVariables += `  --${name}-${key}: ${tokens[key].value};\n`;
  }
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
  let scssVariables = '';
  for (const key in tokens) {
    scssVariables += `$${name}-${key}: ${tokens[key].value};\n`;
  }
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
 * Deletes token files for units that were not selected by the user.
 * It checks in the tokens, CSS, or SCSS folders to remove unwanted files.
 */
const deleteUnusedUnitFiles = (folder, selectedUnits, fileExtension) => {
  let unitFiles = {};
  if (folder.includes('tokens')) {
    unitFiles = {
      rem: `border_radius_tokens_rem.${fileExtension}`
    };
  } else if (folder.includes('css')) {
    unitFiles = {
      rem: `border_radius_variables_rem.${fileExtension}`
    };
  } else if (folder.includes('scss')) {
    unitFiles = {
      rem: `border_radius_variables_rem.${fileExtension}`
    };
  }
  for (const [unit, fileName] of Object.entries(unitFiles)) {
    if (!selectedUnits.includes(unit)) {
      const filePath = path.join(folder, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        const relativePath = path.relative(outputsDir, filePath);
        console.log(chalk.whiteBright(`🗑️ Deleted: /outputs/${relativePath}`));
      }
    }
  }
};

/**
 * Main function that orchestrates the wizard.
 *  - Displays loaders and welcomes the user.
 *  - Gets the user inputs for token configuration.
 *  - Generates border radius tokens.
 *  - Saves tokens in JSON, CSS, and SCSS formats.
 *  - Optionally converts tokens into other units and cleans up unused files.
 */
const main = async () => {
  console.log(chalk.black.bgGreenBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));

  await showLoader(chalk.bold.yellow("🧚 Casting the magic of tokens"), 2000);

  console.log(
    chalk.whiteBright("\n❤️ Welcome to the ") +
    chalk.bold.greenBright("Border Radius Tokens Wizard") +
    chalk.whiteBright(" script! \nLet this wizard 🧙 guide you through creating your border radius tokens step by step.\nGenerate your tokens and prepare them for using or syncing in ") +
    chalk.underline("Tokens Studio") +
    chalk.whiteBright(".")
  );

  const input = await askForInput();
  if (!input) return;
  const { tokenName, noneLabel, fullLabel, intermediateNaming, totalTokens, valueScale } = input;
  
  const tokensData = generateBorderRadiusTokens(noneLabel, fullLabel, intermediateNaming, totalTokens, valueScale);

  const tokensFolder = path.join(outputsDir, "tokens", "border-radius");
  const cssFolder = path.join(outputsDir, "css", "border-radius");
  const scssFolder = path.join(outputsDir, "scss", "border-radius");

  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder, { recursive: true });
  if (!fs.existsSync(scssFolder)) fs.mkdirSync(scssFolder, { recursive: true });

  const jsonFileExists = saveTokensToFile({ [tokenName]: tokensData }, tokensFolder, 'border_radius_tokens_px.json');
  const cssFileExists = saveCSSTokensToFile(tokensData, tokenName, cssFolder, 'border_radius_variables.css');
  const scssFileExists = saveSCSSTokensToFile(tokensData, tokenName, scssFolder, 'border_radius_variables.scss');

  console.log(chalk.black.bgGreenBright("\n======================================="));
  console.log(chalk.bold("🔄 CONVERTING BORDER RADIUS TOKENS TO OTHER UNITS"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));
  const convertAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'convert',
      message: 'Would you like to convert the tokens to other units (rem)?',
      default: false
    }
  ]);

  if (convertAnswer.convert) {
    const convertedTokens = convertPxToOtherUnits(tokensData, 'rem');
    const unitFileExists = saveTokensToFile({ [tokenName]: convertedTokens }, tokensFolder, `border_radius_tokens_rem.json`);
    const unitCssFileExists = saveCSSTokensToFile(convertedTokens, tokenName, cssFolder, `border_radius_variables_rem.css`);
    const unitScssFileExists = saveSCSSTokensToFile(convertedTokens, tokenName, scssFolder, `border_radius_variables_rem.scss`);

    await showLoader(chalk.bold.yellow("\n🪄 Finalizing your spell"), 2000);
    console.log(chalk.black.bgGreenBright("\n======================================="));
    console.log(chalk.bold("📄 OUTPUT FILES"));
    console.log(chalk.black.bgGreenBright("=======================================\n"));
    
    console.log(chalk.whiteBright(`✅ ${jsonFileExists ? 'Updated' : 'Saved'}: outputs/tokens/border-radius/border_radius_tokens_px.json`));
    console.log(chalk.whiteBright(`✅ ${cssFileExists ? 'Updated' : 'Saved'}: outputs/css/border-radius/border_radius_variables_px.css`));
    console.log(chalk.whiteBright(`✅ ${scssFileExists ? 'Updated' : 'Saved'}: outputs/scss/border-radius/border_radius_variables_px.scss`));  
    console.log(chalk.whiteBright(`✅ ${unitFileExists ? 'Updated' : 'Saved'}: outputs/tokens/border-radius/border_radius_tokens_rem.json`));
    console.log(chalk.whiteBright(`✅ ${unitCssFileExists ? 'Updated' : 'Saved'}: outputs/css/border-radius/border_radius_variables_rem.css`));
    console.log(chalk.whiteBright(`✅ ${unitScssFileExists ? 'Updated' : 'Saved'}: outputs/scss/border-radius/border_radius_variables_rem.scss`));

    deleteUnusedUnitFiles(tokensFolder, ['rem'], 'json');
    deleteUnusedUnitFiles(cssFolder, ['rem'], 'css');
    deleteUnusedUnitFiles(scssFolder, ['rem'], 'scss');

  }

  console.log(chalk.black.bgGreenBright("\n======================================="));
  console.log(chalk.bold("🎉🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));
  
  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.greenBright("Border Radius Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄📏\n"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));
};

main();
