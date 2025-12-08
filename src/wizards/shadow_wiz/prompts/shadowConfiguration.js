/**
 * Shadow configuration prompts
 * Handles all user prompts related to shadow property values
 */

import inquirer from "inquirer";
import chalk from "chalk";
import { validateShadowValues } from "../utils/shadowValidation.js";
import { printShadowTable } from "../utils/displayHelpers.js";

/**
 * Prompts for configuration type (standard or custom)
 * @returns {Promise<string>} Configuration type ('standard' or 'custom')
 */
export const promptForConfigType = async () => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 STEP 6: SHADOW CONFIGURATION"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { configType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'configType',
      message: 'Select configuration type:',
      choices: [
        { name: 'Prefilled Standard Values', value: 'standard' },
        { name: 'Custom Values', value: 'custom' }
      ]
    }
  ]);

  return configType;
};

/**
 * Shows a preview of standard shadow values and asks for confirmation
 * @param {Object} previewShadows - Shadow objects to preview
 * @returns {Promise<boolean>} Whether user confirmed standard values
 */
export const promptForStandardValuesConfirmation = async (previewShadows) => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("📋 STANDARD VALUES PREVIEW"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  printShadowTable(previewShadows);

  const { confirmStandard } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmStandard',
      message: 'Would you like to proceed with these standard values?',
      default: true
    }
  ]);

  return confirmStandard;
};

/**
 * Prompts for custom shadow values
 * @param {number} index - Shadow index (1-based)
 * @param {string} shadowType - Shadow type ('outer' or 'inner')
 * @returns {Promise<Object|null>} Shadow properties object, or null to retry
 */
export const promptForCustomShadowValues = async (index, shadowType) => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold(`🎨 CUSTOM VALUES FOR SHADOW ${index}`));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { x } = await inquirer.prompt([
    {
      type: 'number',
      name: 'x',
      message: 'Enter horizontal offset (in pixels):',
      default: 0
    }
  ]);

  const { y } = await inquirer.prompt([
    {
      type: 'number',
      name: 'y',
      message: 'Enter vertical offset (in pixels):',
      default: 4
    }
  ]);

  const { blur } = await inquirer.prompt([
    {
      type: 'number',
      name: 'blur',
      message: 'Enter blur radius (in pixels):',
      default: shadowType === 'outer' ? 24 : 40,
      validate: (input) => {
        const num = Number(input);
        return num >= 0 && num <= 100 ? true : 'Blur radius must be between 0 and 100 pixels';
      }
    }
  ]);

  const { spread } = await inquirer.prompt([
    {
      type: 'number',
      name: 'spread',
      message: 'Enter spread radius (in pixels):',
      default: 0,
      validate: (input) => {
        const num = Number(input);
        return num >= -50 && num <= 50 ? true : 'Spread radius must be between -50 and 50 pixels';
      }
    }
  ]);

  const shadowProperties = {
    x,
    y,
    blur,
    spread
  };

  // Validate with placeholder opacity
  const errors = validateShadowValues({ ...shadowProperties, opacity: 0.15 });
  if (errors.length > 0) {
    console.log(chalk.red('\n⚠️ Validation errors:'));
    errors.forEach(error => console.log(chalk.red(`   - ${error}`)));
    const { retry } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'retry',
        message: 'Would you like to retry with different values?',
        default: true
      }
    ]);
    if (retry) {
      return null; // Signal to retry
    }
  }

  return shadowProperties;
};

/**
 * Prompts for final save confirmation
 * @param {Object} allShadows - All shadow tokens to save
 * @returns {Promise<boolean>} Whether user confirmed to save
 */
export const promptForSaveConfirmation = async (allShadows) => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🔍 STEP 7: PREVIEW"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  printShadowTable(allShadows);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Would you like to save these shadow tokens?',
      default: true
    }
  ]);

  return confirm;
};

/**
 * Prompts for whether to generate another set of shadows
 * @returns {Promise<boolean>} Whether to generate more shadows
 */
export const promptForGenerateMore = async () => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🔄 GENERATE ANOTHER SET"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { generateMore } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'generateMore',
      message: 'Would you like to generate another set of shadow tokens?',
      default: false
    }
  ]);

  return generateMore;
};
