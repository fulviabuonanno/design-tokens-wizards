import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from 'url';
import chalk from "chalk";
import Table from "cli-table3";

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
          { name: "T-shirt (e.g., xs, sm, md, lg)", value: 'tshirt' },
          { name: "Ordinal (e.g., 1, 2, 3, 4)", value: 'ordinal' },
          { name: "Incremental (e.g., 100, 200, 300, 400)", value: 'incremental' },
          { name: "Alphabetical (e.g., A, B, C, D)", value: 'alphabetical' },
          { name: "Semantic (e.g., subtle, moderate, pronounced)", value: 'semantic' },
        ]
      }
    ]);
    
  if (scaleChoice.scaleChoice === 'tshirt') {
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
            { name: "Padded (e.g., 01, 02, 03, 04)", value: 'padded' },
            { name: "Unpadded (e.g., 1, 2, 3, 4)", value: 'unpadded' }
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
            { name: "Uppercase (A, B, C, D)", value: 'uppercase' },
            { name: "Lowercase (a, b, c, d)", value: 'lowercase' }
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
            { name: "10 in 10 (e.g., 10, 20, 30, 40)", value: '10' },
            { name: "25 in 25 (e.g., 25, 50, 75, 100)", value: '25' },
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

  const scaleAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'scale',
      message: 'Select the scale to use for the border radius values:',
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
    console.log(chalk.black.bgGreenBright("\n======================================="));
    console.log(chalk.bold("📚 SCALE INFORMATION"));
    console.log(chalk.black.bgGreenBright("=======================================\n"));
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
    console.log(chalk.black.bgGreenBright("\n=======================================\n"));
    
    const newScaleAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'scale',
        message: 'Select the scale to use for the border radius values:',
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
        message: 'Enter the starting value for your modular scale (e.g. 4):',
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

  let valueScale;
  if (scaleAnswer.scale === '4' || scaleAnswer.scale === '8') {
    valueScale = scaleAnswer.scale === '4' ? 4 : 8;
  }

  return { 
    tokenName, 
    unit: 'px', 
    noneLabel, 
    fullLabel, 
    intermediateNaming, 
    totalTokens, 
    valueScale,
    scale: scaleAnswer.scale,            
    multiplier: scaleAnswer.multiplier,      
    factor: scaleAnswer.factor,              
    customIntervals: scaleAnswer.customIntervals,
    fibonacciBase: scaleAnswer.fibonacciBase
  };
};

const generateBorderRadiusTokens = (
  noneLabel,
  fullLabel,
  intermediateNaming,
  totalTokens,
  scale,            
  valueScale,       
  multiplier,       
  factor,           
  customIntervals,  
  fibonacciBase     
) => {
  const tokensArray = [];
  let prev; 

  const tshirtAbbr = ["xs", "sm", "md", "lg", "xl", "2xl"];
  const tshirtFull = ["extra small", "small", "medium", "large", "extra large", "xx large"];
  
  for (let i = 1; i <= totalTokens; i++) {
    let tokenName = "";
    
    if (noneLabel !== null && fullLabel !== null) {
      if (i === 1) {
        tokenName = noneLabel.toLowerCase();
      } else if (i === totalTokens) {
        tokenName = fullLabel.toLowerCase();
      } else {
        
        const intermediateIndex = i - 1; 
        switch (intermediateNaming?.scale) {
          case 'tshirt': {
            const names = intermediateNaming.option === 'full' ? tshirtFull : tshirtAbbr;
            tokenName = names[intermediateIndex - 1] || `tshirt-${i}`;
            break;
          }
          case 'ordinal': {
            tokenName =
              intermediateNaming.option === 'padded'
                ? String(intermediateIndex).padStart(2, "0")
                : String(intermediateIndex);
            break;
          }
          case 'incremental': {
            
            tokenName = (parseInt(intermediateNaming.option) * intermediateIndex).toString();
            break;
          }
          case 'alphabetical': {
            tokenName =
              intermediateNaming.option === 'uppercase'
                ? String.fromCharCode(64 + intermediateIndex)  
                : String.fromCharCode(96 + intermediateIndex); 
            break;
          }
          case 'semantic': {
            
            tokenName = `semantic-${intermediateIndex}`;
            break;
          }
          default: {
            tokenName = `step-${i}`;
          }
        }
      }
    } else {
      
      const intermediateIndex = i;
      switch (intermediateNaming?.scale) {
        case 'tshirt': {
          const names = intermediateNaming.option === 'full' ? tshirtFull : tshirtAbbr;
          tokenName = names[intermediateIndex - 1] || `tshirt-${i}`;
          break;
        }
        case 'ordinal': {
          tokenName =
            intermediateNaming.option === 'padded'
              ? String(intermediateIndex).padStart(2, "0")
              : String(intermediateIndex);
          break;
        }
        case 'incremental': {
          tokenName = (parseInt(intermediateNaming.option) * intermediateIndex).toString();
          break;
        }
        case 'alphabetical': {
          tokenName =
            intermediateNaming.option === 'uppercase'
              ? String.fromCharCode(64 + intermediateIndex)
              : String.fromCharCode(96 + intermediateIndex);
          break;
        }
        case 'semantic': {
          tokenName = `semantic-${intermediateIndex}`;
          break;
        }
        default: {
          tokenName = `step-${i}`;
        }
      }
    }

    let value;
    if (scale === "custom") {
      value = customIntervals.base + customIntervals.step * (i - 1);
    } else if (scale === "modular") {
      value = multiplier * Math.pow(factor, i - 1);
    } else if (scale === "fibonacci") {
      if (i === 1) {
        value = fibonacciBase;
      } else {
        const phi = 1.618;
        value = prev * phi;
      }
      prev = value;
    } else {
      
      if (valueScale == null) {
        
        value = i === 1 ? 0 : 9999 ;
      } else {
        value = valueScale * i;
      }
    }
    value = Math.round(value * 100) / 100;

    tokensArray.push({ key: tokenName, value: `${value}px`, type: "borderRadius" });
  }

  const tokens = {};
  tokensArray.forEach(item => {
    tokens[item.key] = { value: item.value, type: item.type };
  });
  return tokens;
};

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

const main = async () => {
  console.log(chalk.black.bgGreenBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE BORDER RADIUS TOKENS WIZARD'S MAGIC"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));

  await showLoader(chalk.bold.yellow("🧚 Casting the magic of tokens"), 1500);

  console.log(
    chalk.whiteBright("\n❤️ Welcome to the Border Radius Tokens Wizard script! Let this wizard 🧙 guide you through \ncreating your border radius tokens step by step.") +
    chalk.whiteBright("Generate your tokens and prepare them for using or syncing in ") +
    chalk.underline("Tokens Studio") +
    chalk.whiteBright(". \n✨ As a delightful bonus, you'll receive magical files in ") +
    chalk.underline("SCSS") +
    chalk.whiteBright(" and ") +
    chalk.underline("CSS") +
    chalk.whiteBright(" to test in your implementation!")
  );
  
  const input = await askForInput();
  if (!input) return;
  const { tokenName, noneLabel, fullLabel, intermediateNaming, totalTokens, valueScale, scale, multiplier, factor, customIntervals, fibonacciBase } = input;
  
  const tokensData = generateBorderRadiusTokens(noneLabel, fullLabel, intermediateNaming, totalTokens, scale, valueScale, multiplier, factor, customIntervals, fibonacciBase);

  const outputsDir = path.join(__dirname, "..", "..", "output_files");
  const tokensFolder = path.join(outputsDir, "tokens/json/border-radius");
  const cssFolder = path.join(outputsDir, "tokens/css/border-radius");
  const scssFolder = path.join(outputsDir, "tokens/scss/border-radius");

  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder, { recursive: true });
  if (!fs.existsSync(scssFolder)) fs.mkdirSync(scssFolder, { recursive: true });

  const jsonFileExists = saveTokensToFile({ [tokenName]: tokensData }, tokensFolder, 'border_radius_tokens_px.json');
  const cssFileExists = saveCSSTokensToFile(tokensData, tokenName, cssFolder, 'border_radius_variables_px.css');
  const scssFileExists = saveSCSSTokensToFile(tokensData, tokenName, scssFolder, 'border_radius_variables_px.scss');

  console.log(chalk.black.bgGreenBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 2.5: BORDER RADIUS TOKENS PREVIEW"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));

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
    chalk.bold.green("Token Name: ") + chalk.whiteBright(tokenName) + "\n" +
    chalk.bold.green("Nº of Values: ") + chalk.whiteBright(totalTokens.toString()) + "\n" +
    chalk.bold.green("Scale: ") + chalk.whiteBright(scaleNames[scale] || scale) + "\n" 
  );
 
   const noneKey = noneLabel ? noneLabel.toLowerCase() : null;
  const fullKey = fullLabel ? fullLabel.toLowerCase() : null;
  const tshirtOrder = ["xs", "sm", "md", "lg", "xl", "2xl"];
    
  const sortedEntries = Object.entries(tokensData).sort((a, b) => {
      const keyA = a[0].toLowerCase();
      const keyB = b[0].toLowerCase();
      
      const weight = (key) => {
          if (key === noneKey) return -Infinity;  
          if (key === fullKey) return Infinity;     
          const index = tshirtOrder.indexOf(key);
          return index !== -1 ? index : 0;
      };
      
      const diff = weight(keyA) - weight(keyB);
      return diff !== 0 ? diff : keyA.localeCompare(keyB, undefined, { numeric: true });
  });

  const table = new Table({
    head: [chalk.bold("Scale"), chalk.bold("Value")],
    style: { head: ["green"], border: ["green"] }
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

  const units = convertAnswer.convert ? ['rem'] : [];

  if (convertAnswer.convert) {
    const convertedTokens = convertPxToOtherUnits(tokensData, 'rem');
    const unitFileExists = saveTokensToFile({ [tokenName]: convertedTokens }, tokensFolder, `border_radius_tokens_rem.json`);
    const unitCssFileExists = saveCSSTokensToFile(convertedTokens, tokenName, cssFolder, `border_radius_variables_rem.css`);
    const unitScssFileExists = saveSCSSTokensToFile(convertedTokens, tokenName, scssFolder, `border_radius_variables_rem.scss`);

    await showLoader(chalk.bold.yellow("\n🪄 Finalizing your spell"), 1500);

    console.log(chalk.black.bgGreenBright("\n======================================="));
    console.log(chalk.bold("📄 OUTPUT FILES"));
    console.log(chalk.black.bgGreenBright("=======================================\n"));

    if (jsonFileExists || cssFileExists || scssFileExists) {
      console.log(chalk.whiteBright("🆕 Updated:"));
    } else {
      console.log(chalk.whiteBright("🪄 Created:"));
    }
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(tokensFolder, 'border_radius_tokens_px.json'))}`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(cssFolder, 'border_radius_variables_px.css'))}`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(scssFolder, 'border_radius_variables_px.scss'))}`));

    if (units.length > 0) {
      for (const unit of units) {
        const unitSuffix = `_${unit}`;
        console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(tokensFolder, `${tokenName}_tokens${unitSuffix}.json`))}`));
        console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(cssFolder, `${tokenName}_variables${unitSuffix}.css`))}`));
        console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(scssFolder, `${tokenName}_variables${unitSuffix}.scss`))}`));
      }
    }

    deleteUnusedUnitFiles(tokensFolder, units, 'json');
    deleteUnusedUnitFiles(cssFolder, units, 'css');
    deleteUnusedUnitFiles(scssFolder, units, 'scss');

  } else {
    
    const deletedFiles = [];
    const deleteFileIfExists = (folder, fileName) => {
      const filePath = path.join(folder, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deletedFiles.push(path.relative(process.cwd(), filePath));
      }
    };

    deleteFileIfExists(tokensFolder, 'border_radius_tokens_rem.json');
    deleteFileIfExists(cssFolder, 'border_radius_variables_rem.css');
    deleteFileIfExists(scssFolder, 'border_radius_variables_rem.scss');

    if (deletedFiles.length > 0) {
      console.log(chalk.black.bgGreenBright("\n======================================="));
      console.log(chalk.bold("📄 OUTPUT FILES"));
      console.log(chalk.black.bgGreenBright("=======================================\n"));
    } else {
      console.log(chalk.black.bgGreenBright("\n======================================="));
      console.log(chalk.bold("📄 OUTPUT FILES"));
      console.log(chalk.black.bgGreenBright("=======================================\n"));
    }

    console.log(chalk.whiteBright("🪄 Created:"));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(tokensFolder, 'border_radius_tokens_px.json'))}`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(cssFolder, 'border_radius_variables_px.css'))}`));
    console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(scssFolder, 'border_radius_variables_px.scss'))}`));

    if (deletedFiles.length > 0) {
      console.log(chalk.whiteBright("🗑️ Deleted:"));
      deletedFiles.forEach(deletedFile => {
        console.log(chalk.whiteBright(`   -> ${deletedFile}`));
      });
    }
  }

  console.log(chalk.black.bgGreenBright("\n======================================="));
  console.log(chalk.bold("🎉🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));
  
  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.greenBright("Border Radius Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄📏\n"));
  console.log(chalk.black.bgGreenBright("=======================================\n"));
};

main();
