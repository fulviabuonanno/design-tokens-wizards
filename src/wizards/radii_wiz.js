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
      message: "How would you like to name your border radius tokens?\n>>>",
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
        message: '\ud83d\udcdd Please provide a custom name for your border radius tokens:\n>>>',
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
      message: "Would you like to include 'none' and 'full' border radius values?\n>>>",
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
        message: "How would you like to name the minimum border-radius token?\n>>>",
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
          message: '\ud83d\udcdd Please provide a name for your border-radius token:\n>>>',
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
        message: "How would you like to name the maximum border-radius token?\n>>>",
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
          message: '\ud83d\udcdd Please provide a name for your border-radius token:\n>>>',
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
        message: "Would you like to add intermediate steps for border radius tokens? (Y/n)\n>>>",
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
        message: "Which border-radius scale naming do you want to use? Choose one:\n>>>",
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
          message: "For T-shirt scale, do you want abbreviated names or full names?\n>>>",
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
          message: "For Ordinal scale, choose the format:\n>>>",
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
          message: "For Alphabetical scale, choose the format:\n>>>",
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
          message: "For Incremental scale, choose the step increment:\n>>>",
          choices: [
            { name: "100 in 100 (e.g., 100, 200, 300, 400)", value: '100' },
            { name: "50 in 50 (e.g., 50, 100, 150, 200)", value: '50' },
            { name: "25 in 25 (e.g., 25, 50, 75, 100)", value: '25' },
            { name: "10 in 10 (e.g., 10, 20, 30, 40)", value: '10' }
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
      message: 'Select the scale to use for the border radius values:\n>>>',
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

    const scaleInfoTable = new Table({
      head: [
        chalk.bold("Scale Name"),
        chalk.bold("Description"),
        chalk.bold("Examples")
      ],
      wordWrap: true,
      wrapOnWordBoundary: true,
      style: { head: ["green"], border: ["green"] },
      colWidths: [25, 50, 30]
    });

    scaleInfoTable.push(
      [
        "4-Point Grid System",
        "Increments by 4 units to maintain consistency. Perfect for maintaining visual rhythm and alignment.",
        "4, 8, 12, 16, ...\nGreat for UI components."
      ],
      [
        "8-Point Grid System",
        "Increments by 8 units for more spacious designs. Ideal for larger components and breathing room.",
        "8, 16, 24, 32, ...\nCommon in modern web design."
      ],
      [
        "Modular Scale",
        "Uses a multiplier for a harmonious flow. Creates a musical, proportional relationship between values using a constant ratio.",
        "4, 6.4, 10.24, ...\nBased on musical intervals."
      ],
      [
        "Custom Intervals",
        "User-defined intervals for complete customization. Complete control over the progression of values.",
        "4, 10, 16, 22, ...\nGreat for specific needs."
      ],
      [
        "Fibonacci Scale",
        "Uses Golden Ratio (≈1.618) for natural progression. Creates an organic sequence found in nature and art. Each value is 1.618 times the previous one.",
        "4, 6.47, 10.47, ...\nPerfect for organic UIs."
      ]
    );

    console.log(scaleInfoTable.toString());
    console.log(chalk.black.bgGreenBright("\n=======================================\n"));
    
    const newScaleAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'scale',
        message: 'Select the scale to use for the border radius values:\n>>>',
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
    console.log(chalk.yellowBright("\nℹ️ The modular scale creates a harmonious progression of values using a consistent ratio."));
    console.log(chalk.yellowBright("Each value is multiplied by the chosen ratio to create the next value in the sequence."));
    console.log(chalk.yellowBright("This creates a musical, proportional relationship between values, similar to musical intervals."));
    
    const { scaleRatio } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scaleRatio',
        message: 'Choose a ratio for the modular scale:\n>>>',
        choices: [
          { name: 'Minor Second (1.067) - Subtle, gentle progression', value: '1.067' },
          { name: 'Major Second (1.125) - Balanced, natural progression', value: '1.125' },
          { name: 'Minor Third (1.2) - Moderate, comfortable steps', value: '1.2' },
          { name: 'Major Third (1.25) - Strong, noticeable progression', value: '1.25' },
          { name: 'Perfect Fourth (1.333) - Classic, musical harmony', value: '1.333' },
          { name: 'Augmented Fourth (1.414) - Dynamic, energetic steps', value: '1.414' },
          { name: 'Perfect Fifth (1.5) - Bold, dramatic progression', value: '1.5' },
          { name: 'Minor Sixth (1.6) - Expressive, wide steps', value: '1.6' },
          { name: 'Major Sixth (1.667) - Powerful, impactful progression', value: '1.667' },
          { name: 'Minor Seventh (1.778) - Dramatic, large steps', value: '1.778' },
          { name: 'Major Seventh (1.875) - Bold, significant progression', value: '1.875' },
          { name: 'Octave (2.0) - Doubling, dramatic contrast', value: '2.0' },

        ]
      }
    ]);

    console.log(chalk.yellowBright("\nℹ️ The base value determines where your scale begins."));
    console.log(chalk.yellowBright("This will be the first value in your sequence, and all subsequent values will be calculated from it."));
    
    const modularBaseAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'multiplier',
        message: 'Enter the starting value to build your modular scale (e.g. 4):\n>>>',
        validate: (input) => {
          const num = parseFloat(input);
          return (isNaN(num) || num <= 0) ? "Please enter a valid positive number." : true;
        }
      }
    ]);
    
    let factor;
    if (scaleRatio === 'custom') {
      console.log(chalk.yellowBright("\nℹ️ The multiplication factor determines how quickly your values increase."));
      console.log(chalk.yellowBright("A larger factor creates bigger jumps between values, while a smaller factor creates more subtle progression."));
      
      const customFactorAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'factor',
          message: 'Enter the multiplication factor (e.g. 1.5):\n>>>',
          validate: (input) => {
            const num = parseFloat(input);
            return (isNaN(num) || num <= 0) ? "Please enter a valid positive number." : true;
          }
        }
      ]);
      factor = parseFloat(customFactorAnswer.factor);
    } else {
      factor = parseFloat(scaleRatio);
    }

    scaleAnswer.multiplier = parseFloat(modularBaseAnswer.multiplier);
    scaleAnswer.factor = factor;
  } else if (scaleAnswer.scale === 'custom') {
    console.log(chalk.yellowBright("\nℹ️ Custom intervals allow you to define your own progression of values."));
    console.log(chalk.yellowBright("You'll set a starting value and a step interval to create your unique scale."));
    console.log(chalk.yellowBright("This gives you complete control over the spacing between values."));
    
    const customBaseAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'base',
        message: 'Enter the starting value for your custom intervals (e.g. 4):\n>>>',
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
        message: 'Enter the step interval (e.g. 6):\n>>>',
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
    console.log(chalk.yellowBright("\nℹ️ The Fibonacci scale uses the Golden Ratio (≈1.618) to create a natural progression."));
    console.log(chalk.yellowBright("This ratio is found throughout nature and is considered aesthetically pleasing."));
    console.log(chalk.yellowBright("Each value is approximately 1.618 times the previous value, creating a harmonious sequence."));
    console.log(chalk.yellowBright("This scale is perfect for creating organic, natural-feeling designs."));
    
    const fibonacciBaseAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'fibonacciBase',
        message: 'Enter a base value for your Fibonacci scale:\n>>>',
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
    tokens[item.key] = { $value: item.value, $type: item.type };
  });
  return tokens;
};

const convertPxToOtherUnits = (tokens, unit) => {
  const conversions = {
    rem: (value) => `${value / 16}rem`,
    em: (value) => `${value / 16}em`
  };
  
  const convertedTokens = {};
  for (const [key, token] of Object.entries(tokens)) {
    const numericValue = parseFloat(token.$value);
    convertedTokens[key] = {
      $value: conversions[unit](numericValue),
      $type: "borderRadius"
    };
  }
  return convertedTokens;
};

const saveTokensToFile = (tokensObject, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const tshirtOrder = [
    "3xs", "2xs", "xs", "sm", "md", "lg", "xl",
    "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl",
    "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"
  ];
  const sortKeys = (obj) => {
    let keys = Object.keys(obj);
    const allNumeric = keys.every(k => /^\d+$/.test(k));
    const allTshirt = keys.every(k => tshirtOrder.includes(k));
    if (allNumeric) {
      keys = keys.map(Number).sort((a, b) => a - b).map(String);
    } else if (allTshirt) {
      keys = keys.sort((a, b) => tshirtOrder.indexOf(a) - tshirtOrder.indexOf(b));
    } else {
      keys = keys.sort((a, b) => a.localeCompare(b));
    }
    const sortedObj = {};
    for (const key of keys) {
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        sortedObj[key] = sortKeys(obj[key]);
      } else {
        sortedObj[key] = obj[key];
      }
    }
    return sortedObj;
  };
  const sortedTokens = sortKeys(tokensObject);
  fs.writeFileSync(filePath, JSON.stringify(sortedTokens, null, 2));
  return fs.existsSync(filePath);
};

const customStringify = (obj, indent = 2) => {
  const spacer = " ".repeat(indent);
  const stringify = (value, currentIndent) => {
    if (value === null || typeof value !== "object") {
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      const items = value.map(item => stringify(item, currentIndent + indent));
      return "[\n" + " ".repeat(currentIndent + indent) + items.join(",\n" + " ".repeat(currentIndent + indent)) + "\n" + " ".repeat(currentIndent) + "]";
    }
    let keys = Object.keys(value);
    
    keys.sort((a, b) => {
      if (a === "$value") return -1;
      if (b === "$value") return 1;
      if (a === "$type") return -1;
      if (b === "$type") return 1;
      return a.localeCompare(b);
    });

    let result = "{\n";
    keys.forEach((key, idx) => {
      result += " ".repeat(currentIndent + indent) + JSON.stringify(key) + ": " + stringify(value[key], currentIndent + indent);
      if (idx < keys.length - 1) result += ",\n";
    });
    result += "\n" + " ".repeat(currentIndent) + "}";
    return result;
  };
  return stringify(obj, 0);
};

const convertTokensToCSS = (tokens, prefix = "") => {
  let cssVariables = ":root {\n";
  const tshirtOrder = [
    "3xs", "2xs", "xs", "sm", "md", "lg", "xl",
    "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl",
    "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"
  ];
  const processTokens = (obj, currentPrefix = "") => {
    let keys = Object.keys(obj);
    if (keys.length) {
      const allNumeric = keys.every(k => /^\d+$/.test(k));
      const allTshirt = keys.every(k => tshirtOrder.includes(k));
      if (allNumeric) {
        keys = keys.map(Number).sort((a, b) => a - b).map(String);
      } else if (allTshirt) {
        keys = keys.sort((a, b) => tshirtOrder.indexOf(a) - tshirtOrder.indexOf(b));
      } else {
        keys = keys.sort((a, b) => a.localeCompare(b));
      }
      for (const key of keys) {
        if (obj[key] && typeof obj[key] === "object" && "$value" in obj[key]) {
          cssVariables += `  --${currentPrefix}${key}: ${obj[key].$value};\n`;
        } else {
          processTokens(obj[key], `${currentPrefix}${key}-`);
        }
      }
    }
  };
  processTokens(tokens, prefix);
  cssVariables += "}";
  return cssVariables;
};

const saveCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const cssContent = convertTokensToCSS(tokens, name ? name + '-' : '');
  fs.writeFileSync(filePath, cssContent);
  return fileExists;
};

const convertTokensToSCSS = (tokens) => {
  let scssVariables = "";
  const tshirtOrder = [
    "3xs", "2xs", "xs", "sm", "md", "lg", "xl",
    "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl",
    "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"
  ];
  const processTokens = (obj, prefix = "") => {
    let keys = Object.keys(obj);
    if (keys.length) {
      const allNumeric = keys.every(k => /^\d+$/.test(k));
      const allTshirt = keys.every(k => tshirtOrder.includes(k));
      if (allNumeric) {
        keys = keys.map(Number).sort((a, b) => a - b).map(String);
      } else if (allTshirt) {
        keys = keys.sort((a, b) => tshirtOrder.indexOf(a) - tshirtOrder.indexOf(b));
      } else {
        keys = keys.sort((a, b) => a.localeCompare(b));
      }
      for (const key of keys) {
        if (obj[key] && typeof obj[key] === "object" && "$value" in obj[key]) {
          scssVariables += `$${prefix}${key}: ${obj[key].$value};\n`;
        } else {
          processTokens(obj[key], `${prefix}${key}-`);
        }
      }
    }
  };
  processTokens(tokens);
  return scssVariables;
};

const saveSCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const scssContent = convertTokensToSCSS(tokens);
  fs.writeFileSync(filePath, scssContent);
  return fileExists;
};

const deleteUnusedUnitFiles = (folder, selectedUnits, fileExtension) => {
  let unitFiles = {};
  if (folder.includes('tokens')) {
    unitFiles = {
      rem: `border_radius_tokens_rem.${fileExtension}`,
      em: `border_radius_tokens_em.${fileExtension}`
    };
  } else if (folder.includes('css')) {
    unitFiles = {
      rem: `border_radius_variables_rem.${fileExtension}`,
      em: `border_radius_variables_em.${fileExtension}`
    };
  } else if (folder.includes('scss')) {
    unitFiles = {
      rem: `border_radius_variables_rem.${fileExtension}`,
      em: `border_radius_variables_em.${fileExtension}`
    };
  }
  for (const [unit, fileName] of Object.entries(unitFiles)) {
    if (!selectedUnits.includes(unit)) {
      const filePath = path.join(folder, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(chalk.whiteBright(`🗑️ Deleted: ${relativePath}`));
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
    chalk.whiteBright("\n✨ Welcome to the Border Radius Tokens Wizard! 🧙✨ Ready to create some beautiful border radius tokens? Let's get started!") +
    chalk.whiteBright("\n\n🎨 Your tokens will be ready to sync with ") +
    chalk.underline("JSON format for Tokens Studio in Figma") +
    chalk.whiteBright(" in a snap! 🌟 And here's the magical bonus: you'll get ") +
    chalk.underline("CSS") +
    chalk.whiteBright(" and ") +
    chalk.underline("SCSS") +
    chalk.whiteBright(" files to bring your border radius tokens to life! ✨")
  );
  
  const input = await askForInput();
  if (!input) return;
  const { tokenName, noneLabel, fullLabel, intermediateNaming, totalTokens, valueScale, scale, multiplier, factor, customIntervals, fibonacciBase } = input;
  
  const tokensData = generateBorderRadiusTokens(noneLabel, fullLabel, intermediateNaming, totalTokens, scale, valueScale, multiplier, factor, customIntervals, fibonacciBase);

  const outputsDir = path.join(__dirname, "..", "..", "output_files");
  const tokensFolder = path.join(outputsDir, "tokens", "json", "border-radius");
  const cssFolder = path.join(outputsDir, "tokens", "css", "border-radius");
  const scssFolder = path.join(outputsDir, "tokens", "scss", "border-radius");

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
    table.push([tokenName, token.$value]);
  });

  console.log(table.toString());

  const { confirmSpacing } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmSpacing",
      message: "Would you like to continue with this nomenclature?\n>>>",
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
      message: 'Would you like to convert the tokens to other units (rem, em)? (y/N)\n>>>',
      default: false
    }
  ]);

  const units = convertAnswer.convert ? ['rem', 'em'] : [];

  if (convertAnswer.convert) {
    for (const unit of units) {
      const convertedTokens = convertPxToOtherUnits(tokensData, unit);
      const unitFileExists = saveTokensToFile({ [tokenName]: convertedTokens }, tokensFolder, `border_radius_tokens_${unit}.json`);
      const unitCssFileExists = saveCSSTokensToFile(convertedTokens, tokenName, cssFolder, `border_radius_variables_${unit}.css`);
      const unitScssFileExists = saveSCSSTokensToFile(convertedTokens, tokenName, scssFolder, `border_radius_variables_${unit}.scss`);
    }

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
        console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(tokensFolder, `border_radius_tokens_${unit}.json`))}`));
        console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(cssFolder, `border_radius_variables_${unit}.css`))}`));
        console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(scssFolder, `border_radius_variables_${unit}.scss`))}`));
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
    deleteFileIfExists(tokensFolder, 'border_radius_tokens_em.json');
    deleteFileIfExists(cssFolder, 'border_radius_variables_rem.css');
    deleteFileIfExists(cssFolder, 'border_radius_variables_em.css');
    deleteFileIfExists(scssFolder, 'border_radius_variables_rem.scss');
    deleteFileIfExists(scssFolder, 'border_radius_variables_em.scss');

    console.log(chalk.black.bgGreenBright("\n======================================="));
    console.log(chalk.bold("📄 OUTPUT FILES"));
    console.log(chalk.black.bgGreenBright("=======================================\n"));

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
