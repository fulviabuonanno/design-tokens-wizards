import inquirer from "inquirer";
import chalk from "chalk";
import { validateColorName, validateHexColor, normalizeHexColor, isValidHexCached } from "../utils/colorValidation.js";

/**
 * Prompts user for color mode (single or batch)
 * @returns {Promise<string>} - 'single' or 'batch'
 */
export const promptForColorMode = async () => {
  console.log(chalk.whiteBright("\nYou can add a single color or multiple colors at once."));
  console.log(chalk.whiteBright("When adding multiple colors, they will all use the same scale configuration.\n"));

  const { colorMode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'colorMode',
      message: 'How many colors would you like to add?\n>>>',
      choices: [
        { name: 'Single color', value: 'single' },
        { name: 'Multiple colors (batch mode)', value: 'batch' }
      ],
      default: 'single'
    }
  ]);

  return colorMode;
};

/**
 * Collects a single color from the user
 * @param {Object} tokensData - The existing tokens data
 * @param {string} category - The category (if any)
 * @param {string} namingLevel - The naming level (if any)
 * @returns {Promise<Object>} - { hex, name }
 */
export const collectSingleColor = async (tokensData, category, namingLevel) => {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎨 STEP 5: COLOR INPUT"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  const hexResponse = await inquirer.prompt([
    {
      type: "input",
      name: "hex",
      message: "Enter a HEX value to use as base color (e.g., #FABADA or FABADA):\n>>>",
      validate: validateHexColor
    }
  ]);
  const hex = normalizeHexColor(hexResponse.hex);

  const baseColorPreview = chalk.bgHex(hex).white("  Sample  ");
  console.log(`\n${chalk.bold("Selected color:")}`);
  console.log(`   HEX: ${chalk.whiteBright(hex)}`);
  console.log(`   Preview: ${baseColorPreview}\n`);

  const nameResponse = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: `Enter a name for the ${namingLevel || 'color'} (e.g., blue, yellow, red):\n>>>`,
      validate: (input) => validateColorName(input, tokensData, category, namingLevel)
    }
  ]);

  return {
    hex: hex,
    name: nameResponse.name.trim()
  };
};

/**
 * Collects multiple colors in batch mode
 * @param {Object} tokensData - The existing tokens data
 * @param {string} category - The category (if any)
 * @param {string} namingLevel - The naming level (if any)
 * @returns {Promise<Array>} - Array of { hex, name } objects
 */
export const collectBatchColors = async (tokensData, category, namingLevel) => {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎨 STEP 5: COLOR INPUT"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  console.log(chalk.yellowBright("💡 You can add multiple colors at once. They will all use the same scale configuration."));
  console.log(chalk.gray("   You can enter HEX values with or without the # symbol."));
  console.log(chalk.gray("   Format: Separate multiple values with commas (,) or semicolons (;)"));
  console.log(chalk.gray("   Example: #FF5733, 3498DB; 2ECC71 or FF5733,3498DB,2ECC71\n"));

  const { batchMethod } = await inquirer.prompt([
    {
      type: 'list',
      name: 'batchMethod',
      message: 'How would you like to add colors?\n>>>',
      choices: [
        { name: 'Enter multiple HEX codes at once (comma or semicolon separated)', value: 'bulk' },
        { name: 'Add one color at a time', value: 'individual' }
      ]
    }
  ]);

  const allColors = [];

  if (batchMethod === 'bulk') {
    // Bulk entry mode
    const { hexValues } = await inquirer.prompt([
      {
        type: 'input',
        name: 'hexValues',
        message: 'Enter HEX values separated by commas or semicolons (e.g., #FF5733, 3498DB; 2ECC71):\n>>>',
        validate: (input) => {
          if (!input || input.trim().length === 0) {
            return "Please provide at least one HEX value.";
          }

          const hexCodes = input.split(/[,;]/).map(h => h.trim()).filter(h => h.length > 0);

          if (hexCodes.length === 0) {
            return "Please provide at least one valid HEX value.";
          }

          // Use cached validation to avoid redundant checks
          const invalidCodes = hexCodes.filter(hex => !isValidHexCached(hex));

          if (invalidCodes.length > 0) {
            return `Invalid HEX code(s): ${invalidCodes.join(', ')}. Please check and try again.`;
          }

          return true;
        }
      }
    ]);

    // Split and normalize - validation already done and cached
    const hexCodes = hexValues.split(/[,;]/)
      .map(h => h.trim())
      .filter(h => h.length > 0)
      .map(h => normalizeHexColor(h));

    console.log(chalk.greenBright(`\n✅ Found ${hexCodes.length} valid HEX code(s)!\n`));

    for (let i = 0; i < hexCodes.length; i++) {
      const currentHex = hexCodes[i];
      const colorPreview = chalk.bgHex(currentHex).white("  Sample  ");

      console.log(chalk.bold(`Color ${i + 1} of ${hexCodes.length}:`));
      console.log(`   HEX: ${chalk.whiteBright(currentHex)} ${colorPreview}`);

      const { colorName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'colorName',
          message: `Enter a name for this color (e.g., blue, yellow, red):\n>>>`,
          validate: (input) => validateColorName(input, tokensData, category, namingLevel, allColors)
        }
      ]);

      allColors.push({
        hex: currentHex,
        name: colorName.trim()
      });

      console.log(chalk.greenBright(`   ✓ Added: ${colorName.trim()}\n`));
    }

  } else {
    // Individual entry mode
    let addingMore = true;
    while (addingMore) {
      const colorInput = await inquirer.prompt([
        {
          type: "input",
          name: "hex",
          message: "Enter a HEX value (with or without #, e.g., #FABADA or FABADA):\n>>>",
          validate: validateHexColor
        },
        {
          type: "input",
          name: "name",
          message: `Enter a name for this ${namingLevel || 'color'} (e.g., blue, yellow, red):\n>>>`,
          validate: (input) => validateColorName(input, tokensData, category, namingLevel, allColors)
        }
      ]);

      const finalHex = normalizeHexColor(colorInput.hex);

      const colorPreview = chalk.bgHex(finalHex).white("  Sample  ");
      console.log(`\n${chalk.bold("Color added:")}`);
      console.log(`   Name: ${chalk.whiteBright(colorInput.name.trim())}`);
      console.log(`   HEX: ${chalk.whiteBright(finalHex)}`);
      console.log(`   Preview: ${colorPreview}\n`);

      allColors.push({
        hex: finalHex,
        name: colorInput.name.trim()
      });

      const { addAnother } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'addAnother',
          message: '➕ Add another color?\n>>>',
          default: true
        }
      ]);

      addingMore = addAnother;
    }
  }

  console.log(chalk.greenBright(`\n✅ Total colors collected: ${allColors.length}`));
  console.log(chalk.yellowBright("All colors will use the same scale settings you configure next.\n"));

  return allColors;
};
