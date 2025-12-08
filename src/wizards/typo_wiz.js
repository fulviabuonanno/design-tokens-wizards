import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { showLoader, generateCSSVariables, generateSCSSVariables, sortKeysForJSON } from './typo_wiz/utils.js';
import { setupFontFamily, setupFontSize, setupFontWeight, setupLetterSpacing, setupLineHeight, setupCompositeStyles } from './typo_wiz/prompts.js';

async function typographyWiz() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const versionArg = process.argv.find(arg => arg.startsWith("--version="));
  if (versionArg) {
    const version = versionArg.split("=")[1];
    console.log(chalk.bold.whiteBright.bgGray(`Typography Tokens Wizard - Version ${version}`));
  }

  console.log(chalk.bold.bgRedBright("\n========================================"));
  console.log(chalk.bold("🪄 STARTING THE TYPOGRAPHY TOKENS WIZARD'S MAGIC"));
  console.log(chalk.bold.bgRedBright("========================================\n"));

  await showLoader(chalk.bold.yellowBright("🦄 Casting the magic of tokens..."), 1500);
  console.log(
    chalk.whiteBright("\n✨ Welcome to the Typography Tokens Wizard! 🧙✨ Ready to create some beautiful typography tokens? Let's get started!") +
    chalk.whiteBright("\n\n🎨 Your tokens will be ready to sync with ") +
    chalk.underline("JSON format for Tokens Studio in Figma") +
    chalk.whiteBright(" in a snap! 🌟 And here's the magical bonus: you'll get ") +
    chalk.underline("SCSS") +
    chalk.whiteBright(" and ") +
    chalk.underline("CSS") +
    chalk.whiteBright(" files to bring your typography tokens to life! ✨\n")
  );

  const { selectedProperties } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedProperties',
      message: 'Which typography tokens would you like to create? (Use space to select, enter to confirm):\n>>>',
      choices: [
        { name: 'Font Family ', value: 'fontFamily' },
        { name: 'Font Size ', value: 'fontSize' },
        { name: 'Font Weight ', value: 'fontWeight' },
        { name: 'Letter Spacing ', value: 'letterSpacing' },
        { name: 'Line Height ', value: 'lineHeight' }
      ],
      validate: (answer) => {
        if (answer.length < 1) {
          return chalk.bold.red('🚫 Please select at least one token category to generate your typography tokens');
        }
        return true;
      }
    }
  ]);

  if (selectedProperties.length === 0) {
    console.log(chalk.bold.red("🚫 The spell cannot be cast without properties! Please try again and select at least one."));
    return typographyWiz();
  }
  
  let currentStep = 1;
  let fontFamilies = {};
  let fontNames = [];
  let fontFamilyName = '';
  let fontSizeName = '';
  let fontWeightName = '';
  let letterSpacingName = '';
  let lineHeightName = '';
  
  let fontSize = {};
  let fontWeight = {};
  let letterSpacing = {};
  let lineHeight = {};

  const propertySetups = {
    fontFamily: async () => {
      const result = await setupFontFamily(currentStep);
      fontFamilies = result.fontFamilies;
      fontNames = result.fontNames;
      fontFamilyName = result.propertyName;
    },
    fontSize: async () => {
      const result = await setupFontSize(currentStep);
      fontSize = result.fontSizes;
      fontSizeName = result.propertyName;
    },
    fontWeight: async () => {
      const result = await setupFontWeight(currentStep);
      fontWeight = result.fontWeight;
      fontWeightName = result.propertyName;
    },
    letterSpacing: async () => {
      const result = await setupLetterSpacing(currentStep);
      letterSpacing = result.letterSpacing;
      letterSpacingName = result.propertyName;
    },
    lineHeight: async () => {
      const result = await setupLineHeight(currentStep);
      lineHeight = result.lineHeight;
      lineHeightName = result.propertyName;
    }
  };

  let remainingProperties = [...selectedProperties];
  
  while (remainingProperties.length > 0) {
    const currentProperty = remainingProperties.shift();
    
    if (propertySetups[currentProperty]) {
      await propertySetups[currentProperty]();
    }
    
    currentStep++;
    
    const allProperties = Object.keys(propertySetups);
    const unselectedProperties = allProperties.filter(prop => 
      !selectedProperties.includes(prop)
    );
    
    if (unselectedProperties.length > 0) {
      console.log(chalk.bold.bgRedBright("\n========================================"));
      console.log(chalk.bold("🔍 ADD MORE PROPERTIES"));
      console.log(chalk.bold.bgRedBright("========================================\n"));
      
      console.log(chalk.yellowBright("You've completed setting up: ") + 
                  chalk.bold(selectedProperties.map(p => {
                    if (p === 'fontFamily') return 'Font Family';
                    if (p === 'fontSize') return 'Font Size';
                    if (p === 'fontWeight') return 'Font Weight';
                    if (p === 'letterSpacing') return 'Letter Spacing';
                    if (p === 'lineHeight') return 'Line Height';
                    return p;
                  }).join(', ')));
      
      const { addMore } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'addMore',
          message: 'Would you like to add more typography properties?\n>>>',
          default: false
        }
      ]);
      
      if (addMore) {
        const { additionalProperties } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'additionalProperties',
            message: 'Select additional properties to include:\n>>>',
            choices: unselectedProperties.map(prop => 
              ({
                name: prop === 'fontFamily' ? 'Font Family' :
                     prop === 'fontSize' ? 'Font Size' :
                     prop === 'fontWeight' ? 'Font Weight' :
                     prop === 'letterSpacing' ? 'Letter Spacing' :
                     prop === 'lineHeight' ? 'Line Height' : prop,
                value: prop 
              })
            )
          }
        ]);
        
        if (additionalProperties.length > 0) {
          selectedProperties.push(...additionalProperties);
          remainingProperties.push(...additionalProperties);
          console.log(chalk.bold.greenBright(`✅ Added ${additionalProperties.length} more properties to configure.`));
        }
      }
    }
  }
  
  const tokens = { typography: {} };
  if(selectedProperties.includes('fontFamily')){
    tokens.typography[fontFamilyName] = fontFamilies;
  }
  if(selectedProperties.includes('fontSize')){
    tokens.typography[fontSizeName] = fontSize;
  }
  if(selectedProperties.includes('fontWeight')){
    tokens.typography[fontWeightName] = fontWeight;
  }
  if(selectedProperties.includes('letterSpacing')){
    tokens.typography[letterSpacingName] = letterSpacing;
  }
  if(selectedProperties.includes('lineHeight')){
    tokens.typography[lineHeightName] = lineHeight;
  }

  // Offer composite text styles if at least 2 properties are configured
  let compositeStylesName = '';
  let compositeStyles = {};
  if (selectedProperties.length >= 2) {
    const availableTokens = {
      fontFamily: fontFamilies,
      fontFamilyName: fontFamilyName,
      fontSize: fontSize,
      fontSizeName: fontSizeName,
      fontWeight: fontWeight,
      fontWeightName: fontWeightName,
      letterSpacing: letterSpacing,
      letterSpacingName: letterSpacingName,
      lineHeight: lineHeight,
      lineHeightName: lineHeightName
    };

    const compositeResult = await setupCompositeStyles(currentStep, availableTokens);
    if (compositeResult) {
      compositeStyles = compositeResult.compositeStyles;
      compositeStylesName = compositeResult.propertyName;
      tokens.typography[compositeStylesName] = compositeStyles;
      currentStep++;
    }
  }

  const finalTokens = tokens.typography; 
  
  const outputsDir = path.join(__dirname, "..", "..", "output_files");
  const tokensFolder = path.join(outputsDir, "tokens", "json", "typography");
  const cssFolder = path.join(outputsDir, "tokens", "css", "typography");
  const scssFolder = path.join(outputsDir, "tokens", "scss", "typography");

  [outputsDir, tokensFolder, cssFolder, scssFolder].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const jsonFilePath = path.join(tokensFolder, "typography_tokens.json");
  const cssFilePath = path.join(cssFolder, "typography_variables.css");
  const scssFilePath = path.join(scssFolder, "typography_variables.scss");

  const jsonFileExists = fs.existsSync(jsonFilePath);
  const cssFileExists = fs.existsSync(cssFilePath);
  const scssFileExists = fs.existsSync(scssFilePath);

  const jsonContent = JSON.stringify(sortKeysForJSON(finalTokens), null, 2);
  const cssContent = generateCSSVariables(finalTokens, "typography");
  const scssContent = generateSCSSVariables(finalTokens, "typography");

  fs.writeFileSync(jsonFilePath, jsonContent, 'utf-8');
  fs.writeFileSync(cssFilePath, cssContent, 'utf-8');
  fs.writeFileSync(scssFilePath, scssContent, 'utf-8');

  await showLoader(chalk.bold.yellowBright("\n🪄 Finalizing your spell..."), 1500);

  console.log(chalk.black.bgRedBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.black.bgRedBright("=======================================\n"));

  let statusLabel = (jsonFileExists || cssFileExists || scssFileExists) ? "Updated" : "Created";
  const labelIcon = statusLabel === "Created" ? "🪄" : "🆕";

  console.log(chalk.whiteBright(`${labelIcon} ${statusLabel}:`));
  console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), jsonFilePath)}`));
  console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), cssFilePath)}`));
  console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), scssFilePath)}`));
  
  console.log(chalk.black.bgRedBright("\n======================================="));
  console.log(chalk.bold("🎉🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgRedBright("=======================================\n"));
  
  console.log(chalk.bold.whiteBright("Thank you for summoning the power of the ") + chalk.bold.redBright("Typography Tokens Wizard") + chalk.bold.whiteBright("! ❤️🪄📝\n"));
  console.log(chalk.black.bgRedBright("=======================================\n"));
}

typographyWiz();
