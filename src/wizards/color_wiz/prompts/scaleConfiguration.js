import inquirer from "inquirer";
import chalk from "chalk";
import Table from "cli-table3";
import {
  generateStops,
  calculateMiddleKeys,
  semanticOrder,
  MIN_MIX,
  MAX_MIX
} from "../utils/colorGeneration.js";

/**
 * Prompts user to customize color mix ranges
 * @returns {Promise<Object>} - { minMix, maxMix }
 */
export const customizeColorRanges = async () => {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎨 CUSTOMIZE COLOR RANGES"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  console.log(chalk.whiteBright("Default range is between 10% and 90%:"));
  console.log(chalk.whiteBright("  • 10% minimum ensures colors never get too close to pure white/black"));
  console.log(chalk.whiteBright("  • 90% maximum ensures middle steps maintain good contrast with the base color"));
  console.log(chalk.whiteBright("\nYou can customize these values between 0% and 100%:"));
  console.log(chalk.whiteBright("  • Lower minimum values will create more extreme light/dark variations"));
  console.log(chalk.whiteBright("  • Higher maximum values will create more subtle variations\n"));

  const { customizeRanges } = await inquirer.prompt([
    {
      type: "confirm",
      name: "customizeRanges",
      message: "Would you like to customize the color mix ranges?\n>>>",
      default: false
    }
  ]);

  let minMix = MIN_MIX;
  let maxMix = MAX_MIX;

  if (customizeRanges) {
    const ranges = await inquirer.prompt([
      {
        type: "number",
        name: "minMix",
        message: "Enter minimum mix percentage (0-100):\n>>>",
        default: MIN_MIX,
        validate: (input) => {
          const num = Number(input);
          if (num === 0) {
            console.log(chalk.yellow("\n⚠️  Warning: Using 0% will result in pure white/black colors at the extremes."));
          }
          return num >= 0 && num <= 100 ? true : "Enter a number between 0 and 100.";
        }
      },
      {
        type: "number",
        name: "maxMix",
        message: "Enter maximum mix percentage (0-100):\n>>>",
        default: MAX_MIX,
        validate: (input) => {
          const num = Number(input);
          if (num === 100) {
            console.log(chalk.yellow("\n⚠️  Warning: Using 100% will result in pure white/black colors at the extremes."));
          }
          return num >= 0 && num <= 100 ? true : "Enter a number between 0 and 100.";
        }
      }
    ]);
    minMix = ranges.minMix;
    maxMix = ranges.maxMix;
  }

  return { minMix, maxMix };
};

/**
 * Displays a visual preview of color stops with color blocks in table format
 * @param {Object} stops - The color stops object
 * @param {Object} scaleSettings - The scale settings
 * @param {string} colorName - Name of the color (optional)
 */
export const previewColorScale = (stops, scaleSettings, colorName = null) => {
  console.log(chalk.bold(`\n${colorName ? colorName + ' - ' : ''}Color Scale Preview:`));

  let entries = Object.entries(stops);

  // Sort entries based on scale type
  if (scaleSettings.type === "semanticStops") {
    entries.sort((a, b) => {
      const aIndex = semanticOrder.indexOf(a[0]);
      const bIndex = semanticOrder.indexOf(b[0]);
      return aIndex - bIndex;
    });
  } else if (scaleSettings.type === "ordinal" || scaleSettings.type === "incremental") {
    entries.sort((a, b) => {
      if (a[0] === "base") return -1;
      if (b[0] === "base") return 1;
      return Number(a[0]) - Number(b[0]);
    });
  } else if (scaleSettings.type === "alphabetical") {
    entries.sort((a, b) => {
      if (a[0] === "base") return -1;
      if (b[0] === "base") return 1;
      return a[0].localeCompare(b[0]);
    });
  }

  // Create table with color previews
  const table = new Table({
    head: [chalk.bold('Stop'), chalk.bold('HEX'), chalk.bold('Preview')],
    colWidths: [15, 12, 20],
    style: {
      head: ['cyan'],
      border: ['gray']
    }
  });

  // Add rows with color blocks
  entries.forEach(([key, value]) => {
    const colorBlock = chalk.bgHex(value).white("      ");
    table.push([
      chalk.whiteBright(key),
      chalk.whiteBright(value),
      colorBlock
    ]);
  });

  console.log(table.toString());
  console.log();
};

/**
 * Applies middle tone logic to stops (prompts user or auto-applies)
 * @param {Object} stops - The color stops object
 * @param {Object} scaleSettings - The scale settings
 * @param {boolean} autoApply - If true, automatically applies first middle key without prompting
 * @returns {Promise<Object>} - Modified stops object
 */
export const applyMiddleToneLogic = async (stops, scaleSettings, autoApply = false) => {
  const middleKeys = calculateMiddleKeys(stops, scaleSettings);

  if (middleKeys.length === 0 || !stops["base"]) {
    return stops;
  }

  if (autoApply) {
    // Automatically apply first middle key (for batch processing)
    stops[middleKeys[0]] = stops["base"];
    delete stops["base"];
    return stops;
  }

  // Ask user if they want 'base' to be one of the middle tones
  const { useMiddleToneAsBase } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useMiddleToneAsBase",
      message: `Do you want the value 'base' to be one of the middle tones (${middleKeys.join(', ')})?\n>>>`,
      default: false
    }
  ]);

  if (useMiddleToneAsBase) {
    let chosenMiddleTone = middleKeys[0];

    if (middleKeys.length > 1) {
      // Show preview of middle tone options with color blocks
      console.log(chalk.bold("\nMiddle tone options:"));
      middleKeys.forEach(k => {
        const colorBlock = chalk.bgHex(stops[k]).white("      ");
        console.log(`  ${chalk.bold(k.padEnd(12))} ${chalk.whiteBright(stops[k])} ${colorBlock}`);
      });
      console.log();

      const { selectedMiddleTone } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedMiddleTone",
          message: "Which of the middle tones do you want to use as 'base'?\n>>>",
          choices: middleKeys.map(k => ({
            name: `${k} (${stops[k]})`,
            value: k
          })),
          default: middleKeys[1]
        }
      ]);
      chosenMiddleTone = selectedMiddleTone;
    }

    // Swap: assign the original hex (from base) to the middle tone and remove base
    stops[chosenMiddleTone] = stops["base"];
    delete stops["base"];
  }

  return stops;
};

/**
 * Prompts user for scale configuration
 * @param {Object} existingSettings - Existing scale settings to reuse (if any)
 * @param {string} hex - The base color hex value
 * @returns {Promise<Object>} - { stops, scaleSettings }
 */
export const promptForScaleConfiguration = async (existingSettings, hex) => {
  let newScaleSettings;
  let stops;

  if (existingSettings) {
    newScaleSettings = existingSettings;
    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("➡️ STEP 7: SCALE CONFIGURATION"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    // Display scale information in a more visually appealing way
    console.log(chalk.bold("📊 Scale Information:"));
    console.log(`  ${chalk.bold("Type:")} ${chalk.whiteBright(existingSettings.type)}`);

    // Add additional details based on scale type
    if (existingSettings.type === "ordinal") {
      console.log(`  ${chalk.bold("Format:")} ${chalk.whiteBright(existingSettings.padded ? 'Padded (01, 02...)' : 'Unpadded (1, 2...)')}`);
    } else if (existingSettings.type === "incremental") {
      console.log(`  ${chalk.bold("Step size:")} ${chalk.whiteBright(existingSettings.incrementalOption)}`);
      console.log(`  ${chalk.bold("Start value:")} ${chalk.whiteBright(existingSettings.startValue || 100)}`);
    }

    console.log(`  ${chalk.bold("Number of stops:")} ${chalk.whiteBright(existingSettings.stopsCount)}`);
    console.log();

    // Use factory function to generate stops
    stops = generateStops(hex, existingSettings);

  } else {
    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("🔢 STEP 7: SCALE CONFIGURATION"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    const { scaleType } = await inquirer.prompt([
      {
        type: "list",
        name: "scaleType",
        message: "Select the scale type for your color:\n>>>",
        choices: [
          { name: "Incremental (e.g., 100, 200, 300, 400)", value: "incremental" },
          { name: "Ordinal (e.g., 1, 2, 3, 4)", value: "ordinal" },
          { name: 'Alphabetical (e.g., A, B, C, D)', value: 'alphabetical' },
          { name: "Semantic Stops (e.g. dark, base, light)", value: "semanticStops" }
        ]
      }
    ]);

    let ordinalPadded, incrementalChoice, stopsCount, alphabeticalOption;

    if (scaleType === "ordinal") {
      const { ordinalOption } = await inquirer.prompt([
        {
          type: 'list',
          name: 'ordinalOption',
          message: "For Ordinal scale, choose the format:\n>>>",
          choices: [
            { name: "Padded (e.g., 01, 02, 03, 04)", value: 'padded' },
            { name: "Unpadded (e.g., 1, 2, 3, 4)", value: 'unpadded' }
          ]
        }
      ]);
      ordinalPadded = ordinalOption === 'padded';
    } else if (scaleType === "incremental") {
      incrementalChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'incrementalOption',
          message: "For Incremental scale, choose the step increment:\n>>>",
          choices: [
            { name: "100 in 100 (e.g., 100, 200, 300, 400)", value: '100' },
            { name: "50 in 50 (e.g., 50, 100, 150, 200)", value: '50' },
            { name: "25 in 25 (e.g., 25, 50, 75, 100)", value: '25' },
            { name: "10 in 10 (e.g., 10, 20, 30, 40)", value: '10' },
          ]
        }
      ]);
    } else if (scaleType === "alphabetical") {
      const { alphabeticalOption: option } = await inquirer.prompt([
        {
          type: "list",
          name: "alphabeticalOption",
          message: "For Alphabetical scale, choose the format:\n>>>",
          choices: [
            { name: "Uppercase (e.g., A, B, C, D)", value: 'uppercase' },
            { name: "Lowercase (e.g., a, b, c, d)", value: 'lowercase' }
          ]
        }
      ]);
      alphabeticalOption = option;
    } else if (scaleType === "semanticStops") {
      const { semanticStopsCount } = await inquirer.prompt([
        {
          type: "list",
          name: "semanticStopsCount",
          message: "Select the number of stops for the semantic scale:\n>>>",
          choices: [
            { name: "1", value: 1 },
            { name: "2", value: 2 },
            { name: "4", value: 4 },
            { name: "6", value: 6 },
            { name: "8", value: 8 },
            { name: "10", value: 10 }
          ]
        }
      ]);
      stopsCount = semanticStopsCount;
    }

    if (scaleType !== "semanticStops") {
      const response = await inquirer.prompt([
        {
          type: "number",
          name: "stopsCount",
          message: "How many values would you like to include in the color scale? (1-20):\n>>>",
          default: 10,
          validate: (input) => {
            const num = Number(input);
            return num >= 1 && num <= 20 ? true : "Enter a number between 1 and 20.";
          }
        }
      ]);
      stopsCount = response.stopsCount;
    }

    const { minMix, maxMix } = await customizeColorRanges();

    newScaleSettings = {
      type: scaleType,
      padded: scaleType === "ordinal" ? ordinalPadded : null,
      incrementalOption: scaleType === "incremental" ? incrementalChoice.incrementalOption : undefined,
      startValue: scaleType === "incremental" ? incrementalChoice.startValue : undefined,
      alphabeticalOption: scaleType === "alphabetical" ? alphabeticalOption : undefined,
      stopsCount: stopsCount,
      minMix: minMix,
      maxMix: maxMix
    };

    // Use factory function to generate stops
    stops = generateStops(hex, newScaleSettings);
  }

  return { stops, scaleSettings: newScaleSettings };
};
