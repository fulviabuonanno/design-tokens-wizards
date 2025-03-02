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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("⭐️ STEP 1: BASE UNIT"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  console.log(chalk.yellowBright("ℹ️ The base unit for spacing tokens is set to 'px'."));
  const unit = 'px';

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

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 3: DEFINE SCALE"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  const scaleAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'scale',
      message: '🔢 Select the scale to use for your spacing values:',
      choices: [
        { name: '4-Point Grid System', value: '4' },
        { name: '8-Point Grid System', value: '8' },
        { name: 'More Info', value: 'info' }
      ],
      filter: (input) => input.toUpperCase()
    }
  ]);
  
  if (scaleAnswer.scale === 'info') {
    console.log(chalk.black.bgMagentaBright("\n======================================="));
    console.log(chalk.bold("📚 SCALE INFORMATION"));
    console.log(chalk.black.bgMagentaBright("=======================================\n"));
    console.log("Scale Name       | Description                                      | Examples");
    console.log("--------------------------------------------------------------------------------");
    console.log("4-Point Grid System         | A standard scale where each step is 4 units.     | 4, 8, 12, 16, ...");
    console.log("8-Point Grid System     | A standard scale where each step is 8 units.     | 8, 16, 24, 32, ...");
    console.log(chalk.black.bgMagentaBright("=======================================\n"));
    const newScaleAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'scale',
        message: '🔢 Select the scale to use for your spacing values: \n',
        choices: [
          { name: '4-Point Grid System', value: '4' },
          { name: '8-Point Grid System', value: '8' }
        ]
      }
    ]);
    scaleAnswer.scale = newScaleAnswer.scale;
  }
  const scale = scaleAnswer.scale;

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔢 STEP 4: DEFINE NUMBER OF VALUES"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
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

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 5: DEFINE SCALE NAMING CRITERIA"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  const askForNamingCriteria = async () => {
    let choices = [];
    
    if (numValues <= 20) {
      choices = [
        { name: 'T-shirt size (e.g., xs, sm, md, lg, xl)', value: 't-shirt' },
        { name: 'Incremental (e.g., 50, 100, 150, 200)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3)', value: 'ordinal' },
        { name: 'Alphabetical (e.g., A, B, C or a, b, c)', value: 'alphabetical' }
      ];
    } else if (numValues >= 27) {
      
      choices = [
        { name: 'Incremental (e.g., 50, 100, 150, 200)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3)', value: 'ordinal' }
      ];
    } else {
      choices = [
        { name: 'Incremental (e.g., 50, 100, 150, 200)', value: 'incremental' },
        { name: 'Ordinal (e.g., 1, 2, 3)', value: 'ordinal' },
        { name: 'Alphabetical (e.g., A, B, C or a, b, c)', value: 'alphabetical' }
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
    
    let ordinalFormat = 'unpadded';
    let alphabeticalCase;
    let incrementalStep = 100; 
    
    if (namingChoiceAnswer.namingChoice === 'incremental') {
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
    }
    
    if (namingChoiceAnswer.namingChoice === 'alphabetical') {
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
      ordinalFormat, 
      alphabeticalCase,
      incrementalStep 
    };
  };

  let { namingChoice, ordinalFormat, alphabeticalCase, incrementalStep } = await askForNamingCriteria();

  while ((namingChoice === 'A' && numValues > 20) || (namingChoice === 'D' && numValues > 26)) {
    if (namingChoice === 'A' && numValues > 20) {
      console.log(chalk.red("❌ T-shirt Size naming criteria is not recommended for more than 20 values. Please choose Incremental or ordinal naming criteria."));
    } else if (namingChoice === 'D' && numValues > 26) {
      console.log(chalk.red("❌ Alphabetical naming criteria is not recommended for more than 26 values."));
    }
    ({ namingChoice, ordinalFormat, alphabeticalCase } = await askForNamingCriteria());
  }

  return { unit, name, numValues, namingChoice, ordinalFormat, alphabeticalCase, scale, incrementalStep };
};

const generateSpacingTokens = (unit, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep = 100) => {
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
    let tokenName;
    
    switch (namingChoice) {
      case "t-shirt":
        tokenName = ["3xs", "2xs", "xs", "s", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"][i - 1] || `space${i}`;
        break;
      case "incremental":
        tokenName = (i * incrementalStep).toString();
        break;
      case "ordinal":
        tokenName = ordinalFormat === 'padded' ? i.toString().padStart(2, '0') : i.toString();
        break;
      case "alphabetical":
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

const convertPxToOtherUnits = (tokens, unit) => {
  const conversions = {
    rem: (value) => `${value / 16}rem`,
    em: (value) => `${value / 16}em`,
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

const saveTokensToFile = (tokensData, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  
  const sortedTokensData = sortObjectRecursively(tokensData);
  const outputJSON = customStringify(sortedTokensData, 2);
  
  fs.writeFileSync(filePath, outputJSON);
  return fileExists;
};

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
  sortedKeys.forEach(key => {
    cssVariables += `  --${name}-${key}: ${tokens[key].value};\n`;
  });
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

const saveSCSSTokensToFile = (tokens, name, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  const fileExists = fs.existsSync(filePath);
  const scssContent = convertTokensToSCSS(tokens, name);
  fs.writeFileSync(filePath, scssContent);
  return fileExists;
};

const deleteUnusedUnitFiles = (folder, selectedUnits, fileExtension, filePrefix = 'space_variables') => {
  const unitFiles = {
    rem: `${filePrefix}_rem.${fileExtension}`,
    em: `${filePrefix}_em.${fileExtension}`
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

const main = async () => {
  
  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));

  await showLoader(chalk.bold.yellow("🧚 Casting the magic of tokens"), 2000);

  console.log(chalk.whiteBright("\n❤️ Welcome to the ") + chalk.bold.magenta("Spacing Tokens Wizard") + chalk.whiteBright(" script! \nLet this wizard 🧙 guide you through creating your spacing tokens step by step. \nGenerate your tokens and prepare them for using or syncing in ") + chalk.underline("Tokens Studio") + chalk.whiteBright("."));

  const input = await askForInput();
  if (!input) return;
  const { unit, name, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep } = input;

  const tokensData = generateSpacingTokens(unit, numValues, namingChoice, scale, ordinalFormat, alphabeticalCase, incrementalStep);

  const outputsDir = path.join(__dirname, "..", "outputs");
  const tokensFolder = path.join(outputsDir, "tokens", "space");
  const cssFolder = path.join(outputsDir, "css", "space");
  const scssFolder = path.join(outputsDir, "scss", "space");

  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });

  const jsonFileExists = saveTokensToFile({ [name]: tokensData }, tokensFolder, 'space_tokens_px.json');
  const cssFileExists = saveCSSTokensToFile(tokensData, name, cssFolder, 'space_variables_px.css');
  const scssFileExists = saveSCSSTokensToFile(tokensData, name, scssFolder, 'space_variables_px.scss');

      console.log(chalk.black.bgMagentaBright("\n======================================="));
      console.log(chalk.bold("🔄 CONVERTING SPACING TOKENS TO OTHER UNITS"));
      console.log(chalk.black.bgMagentaBright("=======================================\n"));
      const convertTokensResp = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'convert',
          message: "Would you like to convert the tokens to other units (rem, em) (Y/n)",
          default: true,
        }
      ]);

      let units = [];
      let unitsAnswer = { units: [] }; 

      if (convertTokensResp.convert) {
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
            const convertedTokens = convertPxToOtherUnits(tokensData, unit);
            const unitJsonFileExists = saveTokensToFile({ [name]: convertedTokens }, tokensFolder, `space_tokens${unitSuffix}.json`);
            const unitCssFileExists = saveCSSTokensToFile(convertedTokens, name, cssFolder, `space_variables${unitSuffix}.css`);
            const unitScssFileExists = saveSCSSTokensToFile(convertedTokens, name, scssFolder, `space_variables${unitSuffix}.scss`);          }
        }
      } 

      await showLoader(chalk.bold.yellowBright("\n🪄 Finalizing your spell"), 2000);

      const hasChanges = jsonFileExists || cssFileExists || scssFileExists || (units.length > 0);
    
      if (hasChanges) {
        console.log(chalk.black.bgMagentaBright("\n======================================="));
        console.log(chalk.bold("🚧 CHANGES IN OUTPUT FILES"));
        console.log(chalk.black.bgMagentaBright("=======================================\n"));
        console.log(chalk.whiteBright(`🆕 ${jsonFileExists ? 'Updated' : 'Saved'}: ${path.relative(process.cwd(), path.join(tokensFolder, 'space_tokens_px.json'))}`));
        console.log(chalk.whiteBright(`🆕 ${cssFileExists ? 'Updated' : 'Saved'}: ${path.relative(process.cwd(), path.join(cssFolder, 'space_variables_px.css'))}`));
        console.log(chalk.whiteBright(`🆕 ${scssFileExists ? 'Updated' : 'Saved'}: ${path.relative(process.cwd(), path.join(scssFolder, 'space_variables_px.scss'))}`));
      
        if (units.length > 0) {
          console.log(chalk.black.bgMagentaBright("\n======================================="));
          console.log(chalk.bold("🔄 CONVERTED UNITS"));
          console.log(chalk.black.bgMagentaBright("=======================================\n"));
          for (const unit of units) {
            const unitSuffix = `_${unit}`;
            console.log(chalk.whiteBright(`✅ Converted (${unit}):`));
            console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(tokensFolder, `${name}_tokens${unitSuffix}.json`))}`));
            console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(cssFolder, `${name}_variables${unitSuffix}.css`))}`));
            console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(scssFolder, `${name}_variables${unitSuffix}.scss`))}`));
          }
        }
        
        deleteUnusedUnitFiles(tokensFolder, units, 'json', 'space_tokens');
        deleteUnusedUnitFiles(cssFolder, units, 'css', 'space_variables');
        deleteUnusedUnitFiles(scssFolder, units, 'scss', 'space_variables');
      
      } else {
        
        console.log(chalk.black.bgMagentaBright("\n======================================="));
        console.log(chalk.bold("📄 OUTPUT FILES"));
        console.log(chalk.black.bgMagentaBright("=======================================\n"));
        console.log(chalk.whiteBright(`✅ Saved: ${path.relative(process.cwd(), path.join(tokensFolder, 'space_tokens_px.json'))}`));
        console.log(chalk.whiteBright(`✅ Saved: ${path.relative(process.cwd(), path.join(cssFolder, 'space_variables_px.css'))}`));
        console.log(chalk.whiteBright(`✅ Saved: ${path.relative(process.cwd(), path.join(scssFolder, 'space_variables_px.scss'))}`));
        
        if (units.length > 0) {
          console.log(chalk.black.bgMagentaBright("\n======================================="));
          console.log(chalk.bold("🔄 CONVERTED UNITS"));
          console.log(chalk.black.bgMagentaBright("=======================================\n"));
          for (const unit of units) {
            const unitSuffix = `_${unit}`;
            console.log(chalk.whiteBright(`✅ Converted (${unit}):`));
            console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(tokensFolder, `${name}_tokens${unitSuffix}.json`))}`));
            console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(cssFolder, `${name}_variables${unitSuffix}.css`))}`));
            console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), path.join(scssFolder, `${name}_variables${unitSuffix}.scss`))}`));
          }
        }
      }

  console.log(chalk.black.bgMagentaBright("\n======================================="));
  console.log(chalk.bold("🎉🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.magentaBright("Spacing Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄📏\n"));
  console.log(chalk.black.bgMagentaBright("=======================================\n"));
};

main();