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

// Define outputsDir globally so it can be used by deleteUnusedUnitFiles.
const outputsDir = path.join(__dirname, "..", "outputs");

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
  // STEP 1: DEFINE TOKEN NAME
  console.log(chalk.black.bgGreenBright("\n======================================="));
  console.log(chalk.bold("STEP 1: DEFINE TOKEN NAME"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));

  const tokenNameAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'tokenName',
      message: "How would you like to name your border radius tokens?",
      choices: [
        { name: 'Border-radius', value: 'border-radius' },
        { name: 'Corner-radius', value: 'corner-radius' },
        { name: 'Corner', value: 'corner' },
        { name: 'Radius', value: 'radius' },
        { name: 'Radii', value: 'radii' },
        { name: 'Br', value: 'br' },
        { name: 'BorderRadius', value: 'borderRadius' }
      ]
    }
  ]);
  const tokenName = tokenNameAnswer.tokenName;

  // STEP 2: DEFINE SCALE STRUCTURE
  // Initialize totalTokens with default (with extremes)
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
    // For the minimal value
    const noneResponse = await inquirer.prompt([
      {
        type: 'list',
        name: 'noneWord',
        message: "How would you like to name the minimum border-radius token?",
        choices: [
          { name: 'None', value: 'none' },
          { name: 'Flat', value: 'flat' },
          { name: 'Square', value: 'square' },
          { name: 'Plain', value: 'plain' }
        ]
      }
    ]);
    noneLabel = noneResponse.noneWord;

    // For the maximal value
    const fullResponse = await inquirer.prompt([
      {
        type: 'list',
        name: 'fullWord',
        message: "How would you like to name the maximum border-radius token?",
        choices: [
          { name: 'Pill', value: 'pill' },
          { name: 'Circle', value: 'circle' },
          { name: 'Round', value: 'round' },
          { name: 'Full', value: 'full' }
        ]
      }
    ]);
    fullLabel = fullResponse.fullWord;
  } else {
    console.log(chalk.bold.yellow("\nLet's add intermediate values for your border radius tokens."));
    noneLabel = null;
    fullLabel = null;
    totalTokens = 4;
  }

  // -- Moved from STEP 3 to STEP 2 --
  // Instead of asking a yes/no question for intermediate steps when extremes were omitted,
  // we assume they are required.
  let intermediateAnswer = { includeIntermediate: true };
  // When extremes are included, ask normally:
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
        message: "which border-radius scale naming do you want to use? choose one:",
        choices: [
          { name: "T-shirt scale (e.g., xs, sm, md, lg, xl)", value: 'tshirt' },
          { name: "Cardinal scale (e.g., 01, 02, 03... or 1, 2, 3...)", value: 'cardinal' },
          { name: "Incremental scale (e.g., 100, 200, 300, 400)", value: 'incremental' },
          { name: "Alphabetical scale (e.g., A, B, C... or a, b, c...)", value: 'alphabetical' },
          { name: "Semantic scale (e.g., subtle, moderate, pronounced)", value: 'semantic' },
          { name: "More info: show scale definitions", value: 'info' }
        ]
      }
    ]);
    if (scaleChoice.scaleChoice === 'info') {
      console.log("\n=======================================");
      console.log("SCALE INFORMATION:");
      console.table([
        { scale: 'T-shirt', example: 'xs, sm, md, lg, xl' },
        { scale: 'Cardinal', example: '01, 02, 03.. or 1, 2, 3...' },
        { scale: 'Incremental', example: '100, 200, 300, 400' },
        { scale: 'Alphabetical', example: 'a, b, c... or a, b, c...' },
        { scale: 'Semantic', example: 'subtle, moderate, etc' }
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
    } else if (scaleChoice.scaleChoice === 'cardinal') {
      const cardinalChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'cardinalOption',
          message: "For Cardinal scale, choose the format:",
          choices: [
            { name: "Padded (e.g., 01, 02, 03)", value: 'padded' },
            { name: "Unpadded (e.g., 1, 2, 3)", value: 'unpadded' }
          ]
        }
      ]);
      intermediateNaming = { scale: 'cardinal', option: cardinalChoice.cardinalOption };
      break;
    } else if (scaleChoice.scaleChoice === 'alphabetical') {
      const alphabeticalChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'alphabeticalOption',
          message: "For Alphabetical scale, choose the case:",
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
  // Ask for the value scale type
  const valueScaleTypeAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'valueScaleType',
      message: "Which value scale would you like to use for the border radius scale?",
      choices: [
        { name: 'Minimal scale (base 4px)', value: 'minimal' },
        { name: 'Expressive scale (base 8px)', value: 'expressive' }
      ]
    }
  ]);
  const valueScaleType = valueScaleTypeAnswer.valueScaleType;
  // Define the base value based on the selected scale type
  const valueScale = valueScaleType === 'minimal' ? 4 : 8;
  // Force a total of 6 tokens (always: none + 4 intermediates + full)
  return { tokenName, unit: 'px', noneLabel, fullLabel, intermediateNaming, totalTokens, valueScale };
};

const generateBorderRadiusTokens = (noneLabel, fullLabel, intermediateNaming, totalTokens, valueScale) => {
  const tokensArray = [];
  const base = valueScale; // either 4 or 8
  // If totalTokens is 2, only "none" and "full" tokens are generated.
  if (noneLabel === null && fullLabel === null) {
    // Only generate intermediate tokens
    let intermediateNames = [];
    if (intermediateNaming !== null && intermediateNaming.scale === 'tshirt') {
      if (intermediateNaming.option === 'abbr') {
        intermediateNames = ["xs", "sm", "md", "lg"];
      } else {
        intermediateNames = ["extra-small", "small", "medium", "large"];
      }
    } else if (intermediateNaming !== null && intermediateNaming.scale === 'cardinal') {
      intermediateNames = intermediateNaming.option === 'padded' ? ["01", "02", "03", "04"] : ["1", "2", "3", "4"];
    } else if (intermediateNaming !== null && intermediateNaming.scale === 'incremental') {
      intermediateNames = intermediateNaming.option === '50' ? ["50", "100", "150", "200"] : ["100", "200", "300", "400"];
    } else if (intermediateNaming !== null && intermediateNaming.scale === 'alphabetical') {
      intermediateNames = intermediateNaming.option === 'uppercase' ? ["A", "B", "C", "D"] : ["a", "b", "c", "d"];
    } else if (intermediateNaming === 'semantic') {
      intermediateNames = ["subtle", "soft", "moderate", "bold"];
    }
    // totalTokens here equals number of intermediate tokens (expected 4)
    for (let i = 0; i < totalTokens; i++) {
      const intermValue = `${base * (i + 1)}px`;
      const intermName = intermediateNames[i] || `step-${i + 1}`;
      tokensArray.push({ key: intermName.toLowerCase(), value: intermValue, type: "borderRadius" });
    }
  } else {
    // Generate tokens with extremes: "none" first and "full" last.
    tokensArray.push({ key: noneLabel.toLowerCase(), value: "0", type: "borderRadius" });
    for (let i = 2; i < totalTokens; i++) {
      const intermValue = `${base * (i - 1)}px`;
      let intermediateNames = [];
      if (intermediateNaming !== null && intermediateNaming.scale === 'tshirt') {
        if (intermediateNaming.option === 'abbr') {
          intermediateNames = ["xs", "sm", "md", "lg"];
        } else {
          intermediateNames = ["extra-small", "small", "medium", "large"];
        }
      } else if (intermediateNaming !== null && intermediateNaming.scale === 'cardinal') {
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

// Conversion function: only pt, rem, and em
const convertPxToOtherUnits = (tokens, unit) => {
  const conversions = {
    pt: (value) => `${value * 0.75}pt`,
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

const saveTokensToFile = (tokensData, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  fs.writeFileSync(filePath, JSON.stringify(tokensData, null, 2));
  return fileExists;
};

const convertTokensToCSS = (tokens, name) => {
  let cssVariables = ':root {\n';
  for (const key in tokens) {
    cssVariables += `  --${name}-${key}: ${tokens[key].value};\n`;
  }
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
  for (const key in tokens) {
    scssVariables += `$${name}-${key}: ${tokens[key].value};\n`;
  }
  return scssVariables;
};

const saveSCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const scssContent = convertTokensToSCSS(tokens, name);
  fs.writeFileSync(filePath, scssContent);
  return fileExists;
};

// Update the deleteUnusedUnitFiles function to remove percent:
const deleteUnusedUnitFiles = (folder, selectedUnits, fileExtension) => {
  let unitFiles = {};
  if (folder.includes('tokens')) {
    unitFiles = {
      pt: `border_radius_tokens_pt.${fileExtension}`,
      rem: `border_radius_tokens_rem.${fileExtension}`
    };
  } else if (folder.includes('css')) {
    unitFiles = {
      pt: `border_radius_variables_pt.${fileExtension}`,
      rem: `border_radius_variables_rem.${fileExtension}`
    };
  } else if (folder.includes('scss')) {
    unitFiles = {
      pt: `border_radius_variables_pt.${fileExtension}`,
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

const main = async () => {
  console.log(chalk.black.bgGreenBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));

  await showLoader(chalk.bold.yellow("🧚 Casting the magic of tokens"), 2000);

  console.log(chalk.whiteBright("\n❤️ Welcome to the ") + chalk.bold.greenBright("Border Radius Tokens Wizard") + chalk.whiteBright(" script! \nLet this wizard 🧙 guide you through creating your border radius tokens step by step.\nGenerate your tokens and prepare them for using or syncing in ") + chalk.underline("Tokens Studio") + chalk.whiteBright("."));

  const input = await askForInput();
  if (!input) return;

  const { tokenName, noneLabel, fullLabel, intermediateNaming, totalTokens, valueScale } = input;
  const tokensData = generateBorderRadiusTokens(noneLabel, fullLabel, intermediateNaming, totalTokens, valueScale);

  const outputsDir = path.join(__dirname, "..", "outputs");
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
      message: 'Would you like to convert the tokens to other units (pt,rem)?',
      default: false
    }
  ]);

  let unitsAnswer;
  let unitFileExists, unitCssFileExists, unitScssFileExists;

  if (convertAnswer.convert) {
    console.log(chalk.black.bgGreenBright("\n======================================="));
    console.log(chalk.bold("🔄 CONVERTING BORDER RADIUS TOKENS TO OTHER UNITS"));
    console.log(chalk.black.bgGreenBright("=======================================\n"));
    unitsAnswer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'units',
        message: 'Please, select the units you want to use for conversion:',
        choices: [
          { name: 'pt', value: 'pt' },
          { name: 'rem', value: 'rem' }
          // Removed 'em' option
        ],
        validate: (input) => {
          if (input.length === 0) {
            return "❌ You must select at least one unit.";
          }
          return true;
        }
      }
    ]);
    const units = unitsAnswer.units;
    for (const unitConv of units) {
      const convertedTokens = convertPxToOtherUnits(tokensData, unitConv);
      unitFileExists = saveTokensToFile({ [tokenName]: convertedTokens }, tokensFolder, `border_radius_tokens_${unitConv}.json`);
      unitCssFileExists = saveCSSTokensToFile(convertedTokens, tokenName, cssFolder, `border_radius_variables_${unitConv}.css`);
      unitScssFileExists = saveSCSSTokensToFile(convertedTokens, tokenName, scssFolder, `border_radius_variables_${unitConv}.scss`);
      console.log(chalk.whiteBright(`✅ ${unitFileExists ? 'Updated' : 'Saved'}: outputs/tokens/border-radius/border_radius_tokens_${unitConv}.json`));
      console.log(chalk.whiteBright(`✅ ${unitCssFileExists ? 'Updated' : 'Saved'}: outputs/css/border-radius/border_radius_variables_${unitConv}.css`));
      console.log(chalk.whiteBright(`✅ ${unitScssFileExists ? 'Updated' : 'Saved'}: outputs/scss/border-radius/border_radius_variables_${unitConv}.scss`));
    }
    deleteUnusedUnitFiles(tokensFolder, units, 'json');
    deleteUnusedUnitFiles(cssFolder, units, 'css');
    deleteUnusedUnitFiles(scssFolder, units, 'scss');
  } else {
    console.log(chalk.yellow("No conversion units selected. Previous output files for 'pt' and 'rem' have been removed."));
    // Explicitly delete conversion files for tokens, CSS and SCSS
    const conversionFiles = [
      path.join(tokensFolder, 'border_radius_tokens_pt.json'),
      path.join(tokensFolder, 'border_radius_tokens_rem.json'),
      path.join(cssFolder, 'border_radius_variables_pt.css'),
      path.join(cssFolder, 'border_radius_variables_rem.css'),
      path.join(scssFolder, 'border_radius_variables_pt.scss'),
      path.join(scssFolder, 'border_radius_variables_rem.scss')
    ];
    conversionFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        const relativePath = path.relative(outputsDir, file);
        console.log(chalk.whiteBright(`🗑️ Deleted: /outputs/${relativePath}`));
      }
    });
  }

  console.log(chalk.black.bgGreenBright("\n======================================="));
  console.log(chalk.bold("✅🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));
  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.greenBright("Border Radius Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄\n"));
  console.log(chalk.black.bgGreenBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));
  console.log(chalk.whiteBright(`✅ ${jsonFileExists ? 'Updated' : 'Saved'}: outputs/tokens/border-radius/border_radius_tokens_px.json`));
  console.log(chalk.whiteBright(`✅ ${cssFileExists ? 'Updated' : 'Saved'}: outputs/css/border-radius/border_radius_variables.css`));
  console.log(chalk.whiteBright(`✅ ${scssFileExists ? 'Updated' : 'Saved'}: outputs/scss/border-radius/border_radius_variables.scss`));
  await showLoader(chalk.bold.yellow("\n💚 Finalizing your spell..."), 2000);
};

main();
