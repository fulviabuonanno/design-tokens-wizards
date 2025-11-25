import inquirer from "inquirer";
import chalk from "chalk";
import { CATEGORY_PRESETS, NAMING_LEVEL_PRESETS, VALIDATION_PATTERNS } from "../utils/constants.js";

/**
 * Displays existing colors in the tokens data
 * @param {Object} tokensData - The existing tokens data
 */
export const displayExistingColors = (tokensData) => {
  if (Object.keys(tokensData).length === 0) {
    return;
  }

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎨 EXISTING COLORS"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  let colorCount = 0;

  const processTokens = (obj, path = []) => {
    for (const key in obj) {
      const value = obj[key];
      if (value && typeof value === 'object') {
        // Check if this is a color token (cache property checks)
        const hasValue = '$value' in value;
        const hasType = '$type' in value;

        if (hasValue && hasType && value.$type === 'color') {
          const colorValue = value.$value;
          const colorBlock = chalk.bgHex(colorValue).white("      ");

          // Build path by mutating and restoring (avoids array spread)
          path.push(key);

          // Filter out null/undefined values from path before joining
          const colorPath = path.filter(p => p != null && p !== 'null').join('.');

          // Format: "category.namingLevel.colorName.stop: HEX [block]"
          console.log(`${chalk.bold(colorPath)}: ${chalk.whiteBright(colorValue)} ${colorBlock}`);
          colorCount++;
          path.pop();
        } else {
          // Recurse into nested objects
          path.push(key);
          processTokens(value, path);
          path.pop();
        }
      }
    }
  };

  processTokens(tokensData);
  console.log(chalk.gray(`\nTotal colors: ${colorCount}\n`));
};

/**
 * Detects existing token structure from tokensData
 * @param {Object} tokensData - The existing tokens data
 * @returns {Object} - { category, namingLevel }
 */
export const detectExistingStructure = (tokensData) => {
  let category = null;
  let namingLevel = null;
  let longestPath = [];

  const findSettings = (obj, path = []) => {
    for (const key in obj) {
      const value = obj[key];
      if (value && typeof value === 'object') {
        // Cache property checks
        const hasValue = '$value' in value;
        const hasType = '$type' in value;

        if (hasValue && hasType && value.$type === 'color') {
          // Found a color token, compare path length
          if (path.length > longestPath.length) {
            longestPath = [...path];
          }
        } else {
          // Avoid array spread - use push/pop pattern
          path.push(key);
          findSettings(value, path);
          path.pop();
        }
      }
    }
  };

  findSettings(tokensData);

  // Use the longest path found (most deeply nested structure)
  if (longestPath.length > 0) {
    if (longestPath.length >= 1) {
      category = longestPath[0];
    }
    if (longestPath.length >= 2) {
      const potentialNamingLevel = longestPath[1];
      const isNamingLevel = ['color', 'colour', 'palette', 'scheme'].includes(potentialNamingLevel);
      if (isNamingLevel) {
        namingLevel = potentialNamingLevel;
      } else {
        // If not a recognized naming level, treat it as part of the category structure
        namingLevel = potentialNamingLevel;
      }
    }
  }

  return { category, namingLevel };
};

/**
 * Prompts user for token structure (category and naming level)
 * @param {Object} tokensData - The existing tokens data
 * @returns {Promise<Object>} - { tokenType, category, namingLevel }
 */
export const promptForTokenStructure = async (tokensData) => {
  let tokenType = 'global';
  let category = null;
  let namingLevel = null;

  if (Object.keys(tokensData).length > 0) {
    displayExistingColors(tokensData);

    const existing = detectExistingStructure(tokensData);
    category = existing.category;
    namingLevel = existing.namingLevel;

    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("ℹ️ USING EXISTING SETTINGS"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    console.log(chalk.whiteBright(`Type: Global`));
    if (category) console.log(chalk.whiteBright(`Category: ${category}`));
    if (namingLevel) console.log(chalk.whiteBright(`Naming Level: ${namingLevel}`));
    console.log();

    console.log(chalk.yellowBright("📝 Note: New colors will maintain the same naming structure as existing ones."));
    console.log(chalk.yellowBright("   This ensures consistency across your design system.\n"));

    return { tokenType, category, namingLevel };
  }

  // Step 1: Token Type
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎨 STEP 1: TOKEN TYPE"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  let { tokenType: selectedTokenType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'tokenType',
      message: 'Select the type of color tokens you want to create:\n>>>',
      choices: [
        { name: 'Global Colors', value: 'global' },
        { name: 'Semantic Colors', value: 'semantic' }
      ]
    }
  ]);

  tokenType = selectedTokenType;

  if (tokenType === 'semantic') {
    console.log(chalk.yellow("\n⚠️  Semantic color tokens are coming soon!"));
    console.log(chalk.yellow("This feature will allow you to create color tokens based on their meaning and purpose in your design system."));
    console.log(chalk.yellow("For now, we recommend using Global Colors to create your color tokens."));
    console.log(chalk.yellow("Global Colors provide a solid foundation for your design system and can be used to build semantic tokens later.\n"));

    const { continueWithGlobal } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueWithGlobal',
        message: 'Would you like to continue with Global Colors instead?\n>>>',
        default: true
      }
    ]);

    if (!continueWithGlobal) {
      console.log(chalk.bold.red("\n🚫 Exiting the wizard. Please check back later for semantic color support."));
      process.exit(0);
    }

    tokenType = 'global';
  }

  if (tokenType === 'global') {
    // Step 2: Category
    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("📁 STEP 2: CATEGORY"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    console.log(chalk.whiteBright("Categories help organize your colors into logical groups and create a clear hierarchy in your design system."));
    console.log(chalk.whiteBright("\nExamples: primitives, foundation, core, basics, essentials, global, roots, custom \n"));

    const { includeCategory } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'includeCategory',
        message: 'Would you like to include a category in your color naming?\n>>>',
        default: true
      }
    ]);

    if (includeCategory) {
      const { globalCategory } = await inquirer.prompt([
        {
          type: 'list',
          name: 'globalCategory',
          message: 'Select a category for your global colors:\n>>>',
          choices: CATEGORY_PRESETS.map(cat => ({ name: cat, value: cat }))
        }
      ]);

      if (globalCategory === 'custom') {
        const { customCategory } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customCategory',
            message: 'Enter your custom category name:\n>>>',
            validate: (input) => {
              const trimmedInput = input.trim();
              if (!trimmedInput.match(VALIDATION_PATTERNS.COLOR_NAME)) {
                return "Category name should only contain letters, numbers, hyphens, and dots.";
              }
              return true;
            }
          }
        ]);
        category = customCategory.trim();
      } else {
        category = globalCategory;
      }

      const { confirmCategory } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmCategory',
          message: `Do you want to continue with the category "${category}"?\n>>>`,
          default: true
        }
      ]);

      if (!confirmCategory) {
        console.log(chalk.bold.greenBright("\nNo problem! Let's start over 🧩 since you didn't confirm the category."));
        return null; // Signal to restart
      }
    }

    // Step 3: Naming Level
    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("📝 STEP 3: NAMING LEVEL"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    console.log(chalk.whiteBright("The naming level provides context about how the color should be used in your design system."));
    console.log(chalk.whiteBright("\nExamples: color (single color), palette (group of colors), scheme (color combinations)\n"));

    const { includeNamingLevel } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'includeNamingLevel',
        message: 'Would you like to include a naming level in your color naming?\n>>>',
        default: true
      }
    ]);

    if (includeNamingLevel) {
      const { level } = await inquirer.prompt([
        {
          type: 'list',
          name: 'level',
          message: 'Select a naming level for your colors:\n>>>',
          choices: [
            { name: 'color', value: 'color' },
            { name: 'colour', value: 'colour' },
            { name: 'palette', value: 'palette' },
            { name: 'scheme', value: 'scheme' },
            { name: 'custom', value: 'custom' }
          ]
        }
      ]);

      if (level === 'custom') {
        const { customLevel } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customLevel',
            message: 'Enter your custom naming level:\n>>>',
            validate: (input) => {
              const trimmedInput = input.trim();
              if (!trimmedInput.match(/^[a-zA-Z0-9.-]*$/)) {
                return "Naming level should only contain letters, numbers, hyphens, and dots.";
              }
              return true;
            }
          }
        ]);
        namingLevel = customLevel.trim();
      } else {
        namingLevel = level;
      }

      const { confirmLevel } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmLevel',
          message: `Do you want to continue with the naming level "${namingLevel}"?\n>>>`,
          default: true
        }
      ]);

      if (!confirmLevel) {
        console.log(chalk.bold.greenBright("\nNo problem! Let's start over 🧩 since you didn't confirm the naming level."));
        return null; // Signal to restart
      }
    }
  }

  return { tokenType, category, namingLevel };
};
