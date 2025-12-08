/**
 * Color selection prompts
 * Handles all user prompts related to shadow color selection
 */

import inquirer from "inquirer";
import chalk from "chalk";
import tinycolor from "tinycolor2";

/**
 * Prompts for whether to use custom color
 * @returns {Promise<boolean>} Whether to use custom color
 */
export const promptForUseCustomColor = async () => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 STEP 5: COLOR CONFIGURATION"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { useCustomColor } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useCustomColor',
      message: 'Would you like to use a custom color for your shadows?',
      default: false
    }
  ]);

  return useCustomColor;
};

/**
 * Prompts for custom color selection
 * @returns {Promise<Object>} Color configuration with color and opacity
 */
export const promptForCustomColor = async () => {
  const { colorFormat } = await inquirer.prompt([
    {
      type: 'list',
      name: 'colorFormat',
      message: 'Select color format:',
      choices: [
        { name: 'HEX', value: 'hex' },
        { name: 'RGB/RGBA', value: 'rgb' },
        { name: 'HSL/HSLA', value: 'hsl' }
      ]
    }
  ]);

  let colorInput;
  switch (colorFormat) {
    case 'hex':
      const { hexColor } = await inquirer.prompt([
        {
          type: 'input',
          name: 'hexColor',
          message: 'Enter HEX color (e.g., #000000):',
          validate: (input) => {
            const color = tinycolor(input);
            return color.isValid() ? true : 'Please enter a valid HEX color';
          }
        }
      ]);
      colorInput = hexColor;
      break;

    case 'rgb':
      const { rgbColor } = await inquirer.prompt([
        {
          type: 'input',
          name: 'rgbColor',
          message: 'Enter RGB/RGBA color (e.g., rgb(0,0,0) or rgba(0,0,0,0.5)):',
          validate: (input) => {
            const color = tinycolor(input);
            return color.isValid() ? true : 'Please enter a valid RGB/RGBA color';
          }
        }
      ]);
      colorInput = rgbColor;
      break;

    case 'hsl':
      const { hslColor } = await inquirer.prompt([
        {
          type: 'input',
          name: 'hslColor',
          message: 'Enter HSL/HSLA color (e.g., hsl(0,0%,0%) or hsla(0,0%,0%,0.5)):',
          validate: (input) => {
            const color = tinycolor(input);
            return color.isValid() ? true : 'Please enter a valid HSL/HSLA color';
          }
        }
      ]);
      colorInput = hslColor;
      break;
  }

  const color = tinycolor(colorInput);
  const { opacity } = await inquirer.prompt([
    {
      type: 'number',
      name: 'opacity',
      message: 'Enter shadow opacity (0-1):',
      default: 0.15,
      validate: (input) => {
        const num = Number(input);
        return num >= 0 && num <= 1 ? true : 'Please enter a number between 0 and 1';
      }
    }
  ]);

  return {
    color: color.toRgbString(),
    opacity
  };
};

/**
 * Gets color preferences (either default or custom)
 * @returns {Promise<Object>} Color preferences with color and opacity
 */
export const getColorPreferences = async () => {
  const useCustomColor = await promptForUseCustomColor();

  if (!useCustomColor) {
    return {
      color: 'rgba(0, 0, 0, 0.15)',
      opacity: 0.15
    };
  }

  return await promptForCustomColor();
};
