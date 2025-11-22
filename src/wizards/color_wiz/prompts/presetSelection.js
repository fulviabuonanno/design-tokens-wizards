/**
 * Preset selection prompts for color scale configuration
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { COLOR_SCALE_PRESETS, PRESET_CATEGORIES } from '../utils/constants.js';

/**
 * Ask user if they want to use a preset or custom configuration
 */
export const askPresetOrCustom = async () => {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎨 STEP 3: CONFIGURE COLOR SCALE"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'How would you like to configure your color scale?\n>>>',
      choices: [
        {
          name: '🎯 Use a preset (quick start with industry-standard configurations)',
          value: 'preset'
        },
        {
          name: '⚙️  Custom configuration (full control over all settings)',
          value: 'custom'
        }
      ]
    }
  ]);

  return choice;
};

/**
 * Let user select a preset category
 */
export const selectPresetCategory = async () => {
  const categoryChoices = Object.entries(PRESET_CATEGORIES).map(([key, category]) => ({
    name: `${category.name} - ${category.description}`,
    value: key
  }));

  const { category } = await inquirer.prompt([
    {
      type: 'list',
      name: 'category',
      message: 'Choose a preset category:',
      choices: categoryChoices,
      pageSize: 10
    }
  ]);

  return category;
};

/**
 * Display preset details in a formatted way
 */
const formatPresetDetails = (preset) => {
  const details = [];

  details.push(`  ${chalk.cyan('Type:')} ${preset.type}`);
  details.push(`  ${chalk.cyan('Stops:')} ${preset.stopsCount}`);

  if (preset.type === 'incremental') {
    details.push(`  ${chalk.cyan('Step:')} ${preset.incrementalOption}`);
    details.push(`  ${chalk.cyan('Start:')} ${preset.startValue}`);
  } else if (preset.type === 'ordinal') {
    details.push(`  ${chalk.cyan('Format:')} ${preset.padded ? 'Padded (01, 02...)' : 'Unpadded (1, 2...)'}`);
  } else if (preset.type === 'alphabetical') {
    details.push(`  ${chalk.cyan('Format:')} ${preset.alphabeticalOption || 'uppercase'}`);
  }

  details.push(`  ${chalk.cyan('Mix Range:')} ${preset.minMix}% - ${preset.maxMix}%`);
  details.push(`  ${chalk.cyan('Include Base:')} ${preset.includeBase ? 'Yes' : 'No'}`);

  return details.join('\n');
};

/**
 * Let user select a specific preset from a category
 */
export const selectPreset = async (categoryKey) => {
  const category = PRESET_CATEGORIES[categoryKey];
  const presetChoices = category.presets.map(presetKey => {
    const preset = COLOR_SCALE_PRESETS[presetKey];
    return {
      name: `${preset.name} - ${preset.description}`,
      value: presetKey
    };
  });

  // Add a back option
  presetChoices.push({
    name: chalk.gray('← Back to categories'),
    value: 'back'
  });

  const { presetKey } = await inquirer.prompt([
    {
      type: 'list',
      name: 'presetKey',
      message: 'Choose a preset:',
      choices: presetChoices,
      pageSize: 12
    }
  ]);

  if (presetKey === 'back') {
    return null;
  }

  return presetKey;
};

/**
 * Show preview of selected preset and ask for confirmation
 */
export const confirmPreset = async (presetKey) => {
  const preset = COLOR_SCALE_PRESETS[presetKey];

  console.log(chalk.bold(`\n📋 ${preset.name} Configuration Preview:\n`));
  console.log(formatPresetDetails(preset));

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Use this preset configuration?',
      default: true
    }
  ]);

  return confirm;
};

/**
 * Convert preset configuration to scale settings format
 */
export const presetToScaleSettings = (presetKey) => {
  const preset = COLOR_SCALE_PRESETS[presetKey];

  const scaleSettings = {
    type: preset.type,
    stopsCount: preset.stopsCount,
    minMix: preset.minMix,
    maxMix: preset.maxMix,
    includeMiddleTone: preset.includeBase
  };

  // Add type-specific settings
  if (preset.type === 'incremental') {
    scaleSettings.incrementalOption = preset.incrementalOption;
    scaleSettings.startValue = preset.startValue;
  } else if (preset.type === 'ordinal') {
    scaleSettings.padded = preset.padded;
  } else if (preset.type === 'alphabetical') {
    scaleSettings.alphabeticalOption = preset.alphabeticalOption || 'uppercase';
  }

  return scaleSettings;
};

/**
 * Main function to handle preset selection flow
 * Returns null if user goes back or cancels, otherwise returns scale settings
 */
export const handlePresetSelection = async () => {
  while (true) {
    const categoryKey = await selectPresetCategory();

    while (true) {
      const presetKey = await selectPreset(categoryKey);

      // User chose to go back to categories
      if (presetKey === null) {
        break;
      }

      const confirmed = await confirmPreset(presetKey);

      if (confirmed) {
        return presetToScaleSettings(presetKey);
      }

      // If not confirmed, loop back to preset selection in same category
    }
  }
};
