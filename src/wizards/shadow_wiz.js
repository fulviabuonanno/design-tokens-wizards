import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import inquirer from "inquirer";

// Import utility modules
import { getNamingOptions } from "./shadow_wiz/utils/constants.js";
import { generateShadowName, getDefaultValues } from "./shadow_wiz/utils/shadowGeneration.js";
import {
  setupOutputDirectories,
  saveTokensToFile,
  saveCSSTokensToFile,
  saveSCSSTokensToFile
} from "./shadow_wiz/utils/fileOperations.js";
import {
  showLoader,
  printShadowTable,
  printOutputFiles
} from "./shadow_wiz/utils/displayHelpers.js";

// Import prompt modules
import {
  promptForTokenNaming,
  promptForShadowType,
  promptForNamingApproach,
  promptForShadowCount,
  promptForIncludeTypeInName,
  promptForCustomShadowName,
  promptForAdditionalSet
} from "./shadow_wiz/prompts/tokenNaming.js";
import {
  promptForConfigType,
  promptForStandardValuesConfirmation,
  promptForCustomShadowValues,
  promptForSaveConfirmation,
  promptForGenerateMore
} from "./shadow_wiz/prompts/shadowConfiguration.js";
import { getColorPreferences } from "./shadow_wiz/prompts/colorSelection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Version display
const versionArg = process.argv.find((arg) => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Box Shadow Tokens Wizard - Version ${version}`));
}

/**
 * Main shadow generation function
 * @param {Object} allShadows - Existing shadows collection
 * @param {boolean} isAdditionalSet - Whether this is an additional set
 * @param {Object|null} previousSettings - Previous configuration settings
 * @returns {Promise<Object>} Result with continue flag and settings
 */
const generateShadows = async (allShadows, isAdditionalSet = false, previousSettings = null) => {
  // Show existing shadows if any
  if (Object.keys(allShadows).length > 0) {
    console.log(chalk.whiteBright.bgBlackBright("\n======================================="));
    console.log(chalk.bold("📋 EXISTING SHADOWS"));
    console.log(chalk.whiteBright.bgBlackBright("=======================================\n"));
    printShadowTable(allShadows);
  }

  let tokenName, shadowType, namingApproach, shadowCount, includeTypeInName;

  if (isAdditionalSet && previousSettings) {
    // For additional sets, use streamlined prompts
    const additionalConfig = await promptForAdditionalSet(previousSettings);
    tokenName = additionalConfig.tokenName;
    shadowType = additionalConfig.shadowType;
    namingApproach = additionalConfig.namingApproach;
    shadowCount = additionalConfig.shadowCount;
    includeTypeInName = additionalConfig.includeTypeInName;
  } else {
    // First time - collect all settings
    tokenName = await promptForTokenNaming();
    shadowType = await promptForShadowType();
    namingApproach = await promptForNamingApproach();
    shadowCount = await promptForShadowCount();
    includeTypeInName = await promptForIncludeTypeInName();
  }

  const shadows = {};
  const namingOptions = namingApproach === 'custom' ? [] : getNamingOptions(namingApproach);

  // Get color preferences
  const colorPreferences = await getColorPreferences();

  // Get configuration type
  let configType = await promptForConfigType();

  // Preview standard values if selected
  let standardPreviewShown = false;
  if (configType === 'standard') {
    const previewShadows = {};
    for (let i = 0; i < shadowCount; i++) {
      const baseName = namingApproach === 'custom' ? `shadow-${i + 1}` : (namingOptions[i] || `shadow-${i + 1}`);
      const shadowName = generateShadowName(baseName, shadowType, includeTypeInName, tokenName, allShadows);
      const defaultValues = getDefaultValues(shadowType, shadowName);
      previewShadows[shadowName] = {
        $type: "boxShadow",
        $value: {
          ...defaultValues,
          color: colorPreferences.color,
          opacity: colorPreferences.opacity,
          type: shadowType === 'inner' ? 'innerShadow' : 'dropShadow'
        }
      };
    }

    const confirmStandard = await promptForStandardValuesConfirmation(previewShadows);
    if (!confirmStandard) {
      console.log(chalk.yellow("\nSwitching to custom values configuration..."));
      configType = 'custom';
    } else {
      standardPreviewShown = true;
    }
  }

  // Generate shadows
  for (let i = 0; i < shadowCount; i++) {
    let shadowName;
    if (namingApproach === 'custom') {
      const customName = await promptForCustomShadowName(i + 1);
      shadowName = generateShadowName(customName, shadowType, includeTypeInName, tokenName, allShadows);
    } else {
      const baseName = namingOptions[i] || `shadow-${i + 1}`;
      shadowName = generateShadowName(baseName, shadowType, includeTypeInName, tokenName, allShadows);
    }

    let shadowProperties;
    if (configType === 'standard') {
      const defaultValues = getDefaultValues(shadowType, shadowName);
      shadowProperties = {
        ...defaultValues,
        color: colorPreferences.color,
        opacity: colorPreferences.opacity,
        type: shadowType === 'inner' ? 'innerShadow' : 'dropShadow'
      };
    } else {
      // Custom values
      let customValues = null;
      while (customValues === null) {
        customValues = await promptForCustomShadowValues(i + 1, shadowType);
        if (customValues === null) {
          i--; // Retry this shadow
          break;
        }
      }

      if (customValues) {
        shadowProperties = {
          ...customValues,
          color: colorPreferences.color,
          opacity: colorPreferences.opacity,
          type: shadowType === 'inner' ? 'innerShadow' : 'dropShadow'
        };
      } else {
        continue; // Skip to next iteration
      }
    }

    shadows[shadowName] = {
      $type: "boxShadow",
      $value: {
        ...shadowProperties,
        type: shadowType === 'inner' ? 'innerShadow' : 'dropShadow'
      }
    };
  }

  // Add new shadows to the collection
  Object.assign(allShadows, shadows);

  // Preview and save confirmation (skip preview if already shown for standard values)
  let confirm;
  if (standardPreviewShown) {
    // Already previewed, just ask for confirmation
    confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Would you like to save these shadow tokens?',
        default: true
      }
    ]).then(answers => answers.confirm);
  } else {
    // Show preview and ask for confirmation
    confirm = await promptForSaveConfirmation(allShadows);
  }

  if (confirm) {
    const tokens = {
      [tokenName]: allShadows
    };

    await showLoader(chalk.bold.cyan("\n🌟 Finalizing your spell"), 1500);

    const { tokensFolder, cssFolder, scssFolder } = setupOutputDirectories(path.join(__dirname, '..', '..'));

    const updatedFiles = [];
    const savedNewFiles = [];

    // Save JSON tokens
    const jsonPath = path.join(tokensFolder, 'shadow_tokens.json');
    if (fs.existsSync(jsonPath)) {
      updatedFiles.push('tokens/json/shadow/shadow_tokens.json');
    } else {
      savedNewFiles.push('tokens/json/shadow/shadow_tokens.json');
    }
    saveTokensToFile(tokens, tokensFolder, 'shadow_tokens.json');

    // Save CSS tokens
    const cssPath = path.join(cssFolder, 'shadow_tokens.css');
    if (fs.existsSync(cssPath)) {
      updatedFiles.push('tokens/css/shadow/shadow_tokens.css');
    } else {
      savedNewFiles.push('tokens/css/shadow/shadow_tokens.css');
    }
    saveCSSTokensToFile(tokens, cssFolder, 'shadow_tokens.css');

    // Save SCSS tokens
    const scssPath = path.join(scssFolder, 'shadow_tokens.scss');
    if (fs.existsSync(scssPath)) {
      updatedFiles.push('tokens/scss/shadow/shadow_tokens.scss');
    } else {
      savedNewFiles.push('tokens/scss/shadow/shadow_tokens.scss');
    }
    saveSCSSTokensToFile(tokens, scssFolder, 'shadow_tokens.scss');

    printOutputFiles(updatedFiles, savedNewFiles);

    // Ask if user wants to generate more
    const generateMore = await promptForGenerateMore();

    if (!generateMore) {
      console.log(chalk.whiteBright.bgBlackBright("\n======================================="));
      console.log(chalk.bold("🎉🪄 SPELL COMPLETED"));
      console.log(chalk.whiteBright.bgBlackBright("=======================================\n"));

      console.log(
        chalk.bold.whiteBright("Thank you for summoning the ") +
        chalk.bold.cyan("Shadow Tokens Wizard") +
        chalk.bold.whiteBright("! ❤️🧙✨\n")
      );
      console.log(chalk.whiteBright.bgBlackBright("=======================================\n"));

      return { continue: false, settings: null };
    }
    return { continue: true, settings: { tokenName, shadowType, namingApproach, includeTypeInName } };
  } else {
    console.log(chalk.yellow("\nNo changes were saved. Feel free to run the wizard again!"));
    return { continue: false, settings: null };
  }
};

/**
 * Main function - orchestrates the entire wizard flow
 */
const main = async () => {
  console.log(chalk.whiteBright.bgBlackBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE SHADOW TOKENS WIZARD'S MAGIC"));
  console.log(chalk.whiteBright.bgBlackBright("=======================================\n"));

  await showLoader(chalk.bold.yellow("🧚 Casting the magic of tokens"), 1500);

  console.log(
    chalk.whiteBright("\n❤️ Welcome to the Shadow Tokens Wizard script! Let this wizard 🧙 guide you through \ncreating your shadow tokens step by step.") +
    chalk.whiteBright(" Generate your tokens and prepare them for using or syncing in ") +
    chalk.underline("Tokens Studio") +
    chalk.whiteBright(". \n✨ As a delightful bonus, you'll receive magical files in ") +
    chalk.underline("SCSS") +
    chalk.whiteBright(" and ") +
    chalk.underline("CSS") +
    chalk.whiteBright(" to test in your implementation!\n")
  );

  let allShadows = {};
  let continueGenerating = true;
  let currentSettings = null;

  while (continueGenerating) {
    const result = await generateShadows(
      allShadows,
      continueGenerating && currentSettings !== null,
      currentSettings
    );
    continueGenerating = result.continue;
    if (result.settings) {
      currentSettings = result.settings;
    }
  }
};

main();
