/**
 * Token naming prompts
 * Handles all user prompts related to shadow token naming conventions
 */

import inquirer from "inquirer";
import chalk from "chalk";

/**
 * Prompts for token naming convention
 * @returns {Promise<Object>} Token naming configuration
 */
export const promptForTokenNaming = async () => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 STEP 1: TOKEN NAMING"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { tokenName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'tokenName',
      message: 'Select the token naming convention:',
      choices: [
        { name: 'shadow', value: 'shadow' },
        { name: 'boxShadow', value: 'boxShadow' },
        { name: 'elevation', value: 'elevation' },
        { name: 'depth', value: 'depth' },
        { name: 'Custom', value: 'custom' }
      ]
    }
  ]);

  let customTokenName = tokenName;
  if (tokenName === 'custom') {
    const { customName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customName',
        message: 'Enter your custom token name:',
        validate: (input) => {
          if (!input.trim()) return 'Name is required';
          if (!/^[a-zA-Z0-9-]+$/.test(input)) {
            return 'Name should only contain letters, numbers, and hyphens';
          }
          return true;
        }
      }
    ]);
    customTokenName = customName;
  }

  return customTokenName;
};

/**
 * Prompts for shadow type (outer or inner)
 * @returns {Promise<string>} Shadow type ('outer' or 'inner')
 */
export const promptForShadowType = async () => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 STEP 2: SHADOW TYPE"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { shadowType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'shadowType',
      message: 'Select the shadow type:',
      choices: [
        { name: 'Outer Shadow', value: 'outer' },
        { name: 'Inner Shadow', value: 'inner' }
      ]
    }
  ]);

  return shadowType;
};

/**
 * Prompts for naming approach
 * @returns {Promise<string>} Naming approach
 */
export const promptForNamingApproach = async () => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 STEP 3: NAMING APPROACH"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { namingApproach } = await inquirer.prompt([
    {
      type: 'list',
      name: 'namingApproach',
      message: 'Select the naming approach:',
      choices: [
        { name: 'T-shirt sizes (xs, sm, md, lg, xl)', value: 't-shirt' },
        { name: 'Levels (1, 2, 3, 4, 5)', value: 'level' },
        { name: 'Elevation (ground, low, medium, high, sky)', value: 'elevation' },
        { name: 'Material Design (dp-1 to dp-6)', value: 'material' },
        { name: 'Contextual (card, button, modal, etc.)', value: 'contextual' },
        { name: 'Interaction (hover, active, focus)', value: 'interaction' },
        { name: 'Custom', value: 'custom' }
      ]
    }
  ]);

  return namingApproach;
};

/**
 * Prompts for shadow count
 * @returns {Promise<number>} Number of shadows to create
 */
export const promptForShadowCount = async () => {
  const { shadowCount } = await inquirer.prompt([
    {
      type: 'number',
      name: 'shadowCount',
      message: 'How many shadows do you want to create?',
      default: 5,
      validate: (input) => {
        const num = Number(input);
        return num > 0 && num <= 10 ? true : 'Please enter a number between 1 and 10';
      }
    }
  ]);

  return shadowCount;
};

/**
 * Prompts for whether to include shadow type in token names
 * @returns {Promise<boolean>} Whether to include type in name
 */
export const promptForIncludeTypeInName = async () => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 STEP 4: TOKEN NAMING OPTIONS"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { includeTypeInName } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'includeTypeInName',
      message: 'Would you like to include the shadow type (outer/inner) in the token names?',
      default: false
    }
  ]);

  return includeTypeInName;
};

/**
 * Prompts for custom shadow name
 * @param {number} index - Shadow index (1-based)
 * @returns {Promise<string>} Custom shadow name
 */
export const promptForCustomShadowName = async (index) => {
  const { customShadowName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'customShadowName',
      message: `Enter name for shadow ${index}:`,
      validate: (input) => {
        if (!input.trim()) return 'Name is required';
        if (!/^[a-zA-Z0-9-]+$/.test(input)) {
          return 'Name should only contain letters, numbers, and hyphens';
        }
        return true;
      }
    }
  ]);

  return customShadowName;
};

/**
 * Prompts for additional shadow set configuration (reusing settings)
 * @param {Object} previousSettings - Previous configuration settings
 * @returns {Promise<Object>} Additional set configuration
 */
export const promptForAdditionalSet = async (previousSettings) => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 ADDITIONAL SHADOW SET"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { newShadowType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'newShadowType',
      message: 'What type of shadows do you want to add?',
      choices: [
        { name: 'Outer Shadow', value: 'outer' },
        { name: 'Inner Shadow', value: 'inner' }
      ]
    }
  ]);

  const { useSameNaming } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useSameNaming',
      message: `Use the same naming convention as before (${previousSettings.namingApproach})?`,
      default: true
    }
  ]);

  let tokenName, namingApproach, includeTypeInName;

  if (useSameNaming) {
    tokenName = previousSettings.tokenName;
    namingApproach = previousSettings.namingApproach;
    includeTypeInName = previousSettings.includeTypeInName;
  } else {
    tokenName = await promptForTokenNaming();
    namingApproach = await promptForNamingApproach();
    includeTypeInName = await promptForIncludeTypeInName();
  }

  const shadowCount = await promptForShadowCount();

  return {
    shadowType: newShadowType,
    tokenName,
    namingApproach,
    shadowCount,
    includeTypeInName
  };
};
