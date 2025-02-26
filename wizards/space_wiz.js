// IMPORT NECESSARY MODULES
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from 'url';
import chalk from "chalk";

// CHECK IF THE "--VERSION=" ARGUMENT WAS PROVIDED AND DISPLAY VERSION IF EXISTS
const versionArg = process.argv.find(arg => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Space Tokens Wizard - Version ${version}`));
}

// GET THE CURRENT FILENAME AND DIRECTORY
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FUNCTION TO SHOW A LOADING ANIMATION FOR A GIVEN DURATION
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

// FUNCTION TO ASK FOR USER INPUT VIA THE COMMAND LINE
const askForInput = async () => {
  // DISPLAY DIVIDERS AND TITLE FOR STEP 1
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("⭐️ STEP 1: BASE UNIT"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // INFORM THE USER THAT THE BASE UNIT IS 'PX'
  console.log(chalk.magenta("ℹ️ The base unit for spacing tokens is set to 'px'."));
  const unit = 'px';

  // DISPLAY DIVIDERS AND TITLE FOR STEP 2 - NAMING TOKENS
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 2: NAME YOUR TOKENS"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // PROMPT THE USER TO SELECT A TOKEN NAME OR "CUSTOM"
  const nameAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: '📝 What name would you like to assign to your spacing tokens?',
      choices: ['space', 'spacing', 'sp', 'spc', 'custom']
    }
  ]);

  let name;
  if (nameAnswer.name === 'custom') {
    // IF CUSTOM IS SELECTED, ASK FOR A CUSTOM NAME WITH VALIDATION
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

  // DISPLAY DIVIDERS AND TITLE FOR STEP 3 - DEFINING SCALE
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 3: DEFINE SCALE"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // PROMPT THE USER TO SELECT A SCALE
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

  // IF USER CHOOSES "C", DISPLAY SCALE INFORMATION AND ASK AGAIN
  if (scaleAnswer.scale === 'C') {
    console.log(chalk.black.bgMagentaBright("\n======================================="));
    console.log(chalk.bold("📚 SCALE INFORMATION"));
    console.log(chalk.black.bgMagentaBright("=======================================\n"));
    console.log("Scale Name       | Description                                      | Examples");
    console.log("--------------------------------------------------------------------------------");
    console.log("4px-Grid         | A standard scale where each step is 4 units.     | 4, 8, 12, 16, ...");
    console.log("8-point Grid     | A standard scale where each step is 8 units.     | 8, 16, 24, 32, ...");
    console.log(chalk.black.bgMagentaBright("=======================================\n"));

    // ASK THE USER AGAIN FOR THE SCALE WITHOUT THE INFORMATION OPTION
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

  // DISPLAY DIVIDERS AND TITLE FOR STEP 4 - DEFINING NUMBER OF VALUES
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 4: DEFINE NUMBER OF VALUES"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // ASK THE USER HOW MANY TOKEN VALUES TO CREATE WITH VALIDATION
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

  // DISPLAY DIVIDERS AND TITLE FOR STEP 5 - DEFINING SCALE NAMING CRITERIA
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 5: DEFINE SCALE NAMING CRITERIA"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // FUNCTION TO ASK FOR THE NAMING CRITERIA BASED ON THE NUMBER OF VALUES
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
    
    // ASK THE USER TO CHOOSE THE NAMING STYLE
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
    let incrementalStep = 100; 
    
    // IF INCREMENTAL IS SELECTED, ASK FOR THE STEP VALUE
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
    // IF CARDINAL IS SELECTED, ASK FOR THE FORMAT (PADDED OR UNPADDED)
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
    // IF ALPHABETICAL IS SELECTED, ASK FOR THE CASE
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

  // GET THE NAMING CRITERIA FROM THE USER
  let { namingChoice, cardinalFormat, alphabeticalCase, incrementalStep } = await askForNamingCriteria();

  // ENSURE THE NAMING CRITERIA IS VALID BASED ON THE NUMBER OF VALUES
  while ((namingChoice === 'A' && numValues > 20) || (namingChoice === 'D' && numValues > 26)) {
    if (namingChoice === 'A' && numValues > 20) {
      console.log(chalk.red("❌ T-shirt Size naming criteria is not recommended for more than 20 values. Please choose Incremental or Cardinal naming criteria."));
    } else if (namingChoice === 'D' && numValues > 26) {
      console.log(chalk.red("❌ Alphabetical naming criteria is not recommended for more than 26 values."));
    }
    ({ namingChoice, cardinalFormat, alphabeticalCase } = await askForNamingCriteria());
  }

  // RETURN ALL THE USER INPUT DATA
  return { unit, name, numValues, namingChoice, cardinalFormat, alphabeticalCase, scale, incrementalStep };
};

// FUNCTION TO GENERATE SPACING TOKENS BASED ON THE GATHERED INPUT
const generateSpacingTokens = (unit, numValues, namingChoice, scale, cardinalFormat, alphabeticalCase, incrementalStep = 100) => {
  const tokens = {};
  let baseValue;
  // SET THE BASE VALUE BASED ON THE SELECTED SCALE
  switch (scale) {
    case "A":
      baseValue = 4;
      break;
    case "B":
      baseValue = 8;
      break;
  }
  // LOOP TO GENERATE EACH TOKEN BASED ON THE NAMING CRITERIA
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

// FUNCTION TO CONVERT PX VALUES TO OTHER UNITS (PT, REM, EM, %)
const convertPxToOtherUnits = (tokens, unit) => {
  const conversions = {
    pt: (value) => `${value * 0.75}pt`,
    rem: (value) => `${value / 16}rem`,
    em: (value) => `${value / 16}em`,
    percent: (value) => `${(value / 16) * 100}%`
  };

  const convertedTokens = {};
  // CONVERT EACH TOKEN USING THE SELECTED UNIT CONVERSION FUNCTION
  for (const [key, token] of Object.entries(tokens)) {
    const numericValue = parseFloat(token.value);
    convertedTokens[key] = {
      value: conversions[unit](numericValue),
      type: "spacing"
    };
  }
  return convertedTokens;
};

// FUNCTION TO SAVE TOKENS DATA TO A FILE IN JSON FORMAT
const saveTokensToFile = (tokensData, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  
  // SORT THE TOKENS DATA BEFORE STRINGIFYING
  const sortedTokensData = sortObjectRecursively(tokensData);
  const outputJSON = customStringify(sortedTokensData, 2);
  
  fs.writeFileSync(filePath, outputJSON);
  return fileExists;
};

// FUNCTION TO CONVERT TOKENS TO CSS VARIABLES FORMAT
const convertTokensToCSS = (tokens, name) => {
  let cssVariables = ':root {\n';
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
  // BUILD THE CSS VARIABLES STRING
  sortedKeys.forEach(key => {
    cssVariables += `  --${name}-${key}: ${tokens[key].value};\n`;
  });
  cssVariables += '}';
  return cssVariables;
};

// FUNCTION TO SAVE THE CSS VARIABLES TO A FILE
const saveCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const cssContent = convertTokensToCSS(tokens, name);
  fs.writeFileSync(filePath, cssContent);
  return fileExists;
};

// FUNCTION TO CONVERT TOKENS TO SCSS VARIABLES FORMAT
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
  // BUILD THE SCSS VARIABLES STRING
  sortedKeys.forEach(key => {
    scssVariables += `$${name}-${key}: ${tokens[key].value};\n`;
  });
  return scssVariables;
};

// FUNCTION TO SAVE THE SCSS VARIABLES TO A FILE
const saveSCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const scssContent = convertTokensToSCSS(tokens, name);
  fs.writeFileSync(filePath, scssContent);
  return fileExists;
};

// FUNCTION TO DELETE UNUSED FILES THAT WERE CONVERTED TO DIFFERENT UNITS
const deleteUnusedUnitFiles = (folder, selectedUnits, fileExtension, filePrefix = 'space_variables') => {
  const unitFiles = {
    pt: `${filePrefix}_pt.${fileExtension}`,
    rem: `${filePrefix}_rem.${fileExtension}`,
    em: `${filePrefix}_em.${fileExtension}`,
    percent: `${filePrefix}_percent.${fileExtension}`
  };

  // LOOP OVER ALL POSSIBLE UNITS AND DELETE THE ONES NOT SELECTED
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
 * RECURSIVELY SORT AN OBJECT BY ITS KEYS USING NUMERIC ORDER WHEN POSSIBLE.
 * @param {object} obj - THE OBJECT TO SORT.
 * @returns {object} SORTED OBJECT.
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
 * CUSTOM JSON STRINGIFY FUNCTION THAT PRESERVES KEY ORDER.
 * @param {any} value - THE VALUE TO STRINGIFY.
 * @param {number} indent - CURRENT INDENTATION LEVEL.
 * @returns {string} JSON STRING REPRESENTATION.
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
    
    // DEFINE A PREFERRED ORDER FOR KEYS
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

// MAIN FUNCTION THAT EXECUTES THE SCRIPT
const main = async () => {
  // DISPLAY THE START MESSAGE
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // SHOW LOADER WHILE "CASTING THE MAGIC" OF TOKENS
  await showLoader(chalk.bold.yellow("\n🧚 Casting the magic of tokens"), 2000);

  // GREETING MESSAGE TO THE USER
  console.log(chalk.whiteBright("\n❤️ Welcome to the ") + chalk.bold.magenta("Spacing Tokens Wizard") + chalk.whiteBright(" script! \nLet this wizard 🧙 guide you through creating your spacing tokens step by step. \nGenerate your tokens and prepare them for using or syncing in ") + chalk.underline("Tokens Studio") + chalk.whiteBright("."));

  // ASK THE USER FOR INPUT
  const input = await askForInput();
  if (!input) return;

  const { unit, name, numValues, namingChoice, scale, cardinalFormat, alphabeticalCase, incrementalStep } = input;

  // GENERATE THE SPACING TOKENS WITH THE PROVIDED INPUT
  const tokensData = generateSpacingTokens(unit, numValues, namingChoice, scale, cardinalFormat, alphabeticalCase, incrementalStep);

  // DEFINE OUTPUT FOLDERS FOR TOKENS, CSS, AND SCSS FILES
  const outputsDir = path.join(__dirname, "..", "outputs");
  const tokensFolder = path.join(outputsDir, "tokens", "space");
  const cssFolder = path.join(outputsDir, "css", "space");
  const scssFolder = path.join(outputsDir, "scss", "space");

  // CREATE OUTPUT FOLDERS IF THEY DO NOT EXIST
  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });

  // DISPLAY THE SECTION FOR CONVERTING TOKENS TO OTHER UNITS
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔄 CONVERTING SPACING TOKENS TO OTHER UNITS"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // ASK THE USER IF THEY WANT TO CONVERT TOKENS TO OTHER UNITS
  const convertTokensResp = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'convert',
      message: "Would you like to convert the tokens to other units (pt, rem, em, %)? (Y/n)",
      default: true,
    }
  ]);

  let unitsAnswer;
  if (convertTokensResp.convert) {
    // IF YES, ASK WHICH UNITS TO CONVERT TO (user can press enter to skip)
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
  }
  
  // SHOW A LOADER WHILE FINALIZING THE SPELL
  await showLoader(chalk.bold.yellow("\n🪄 Finalizing your spell..."), 2000);

  // DISPLAY THE OUTPUT FILES SECTION
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  // SAVE THE DEFAULT TOKENS (PX) TO FILES (JSON, CSS & SCSS)
  const jsonFileExists = saveTokensToFile({ [name]: tokensData }, tokensFolder, `space_tokens_px.json`);
  const cssFileExists = saveCSSTokensToFile(tokensData, name, cssFolder, `space_variables_px.css`);
  const scssFileExists = saveSCSSTokensToFile(tokensData, name, scssFolder, `space_variables_px.scss`);

  console.log(chalk.whiteBright(`✅ ${jsonFileExists ? 'Updated' : 'Saved'}: outputs/tokens/space/space_tokens_px.json`));
  console.log(chalk.whiteBright(`✅ ${cssFileExists ? 'Updated' : 'Saved'}: outputs/css/space/space_variables_px.css`));
  console.log(chalk.whiteBright(`✅ ${scssFileExists ? 'Updated' : 'Saved'}: outputs/scss/space/space_variables_px.scss`));

  // IF THE USER CHOSE TO CONVERT, PROCESS CONVERSION FOR EACH SELECTED UNIT
  if (convertTokensResp.convert) {
    const units = unitsAnswer.units;
    for (const unit of units) {
      
      const convertedTokens = convertPxToOtherUnits(tokensData, unit);
      const unitFileExists = saveTokensToFile({ [name]: convertedTokens }, tokensFolder, `space_tokens_${unit}.json`);
      const unitCssFileExists = saveCSSTokensToFile(convertedTokens, name, cssFolder, `space_variables_${unit}.css`);
      const unitScssFileExists = saveSCSSTokensToFile(convertedTokens, name, scssFolder, `space_variables_${unit}.scss`);
      
      console.log(chalk.whiteBright(`✅ ${unitFileExists ? 'Updated' : 'Saved'}: outputs/tokens/space/space_tokens_${unit}.json`));
      console.log(chalk.whiteBright(`✅ ${unitCssFileExists ? 'Updated' : 'Saved'}: outputs/css/space/space_variables_${unit}.css`));
      console.log(chalk.whiteBright(`✅ ${unitScssFileExists ? 'Updated' : 'Saved'}: outputs/scss/space/space_variables_${unit}.scss`));
    }
    
    // DELETE FILES FOR UNSELECTED UNITS
    deleteUnusedUnitFiles(tokensFolder, units, 'json', 'space_tokens');
    deleteUnusedUnitFiles(cssFolder, units, 'css', 'space_tokens');
    deleteUnusedUnitFiles(scssFolder, units, 'scss', 'space_tokens');
  }

  // DISPLAY THE COMPLETION MESSAGE
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("✅🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.magentaBright("Spacing Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄📏\n"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
};

// BEGIN EXECUTION OF THE MAIN FUNCTION
main();