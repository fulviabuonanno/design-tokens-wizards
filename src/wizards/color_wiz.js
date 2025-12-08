import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import chalk from "chalk";
import tinycolor from "tinycolor2";

// Import utility modules
import { clearColorMixCache, generateStops, semanticOrder } from "./color_wiz/utils/colorGeneration.js";
import { convertTokensToFormat } from "./color_wiz/utils/colorConversion.js";
import {
  saveTokensToFile,
  saveCSSTokensToFile,
  saveSCSSTokensToFile,
  deleteUnusedFormatFiles,
  ensureValueBeforeType,
  setupOutputDirectories,
  addColorToTokens
} from "./color_wiz/utils/fileOperations.js";
import { clearHexValidationCache } from "./color_wiz/utils/colorValidation.js";

// Import prompt modules
import { promptForTokenStructure } from "./color_wiz/prompts/tokenStructure.js";
import { promptForColorMode, collectSingleColor, collectBatchColors } from "./color_wiz/prompts/colorCollection.js";
import { promptForScaleConfiguration, previewColorScale, applyMiddleToneLogic } from "./color_wiz/prompts/scaleConfiguration.js";
import { askPresetOrCustom, handlePresetSelection } from "./color_wiz/prompts/presetSelection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Version display
const versionArg = process.argv.find((arg) => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Color Tokens Wizard - Version ${version}`));
}

/**
 * Shows a loading animation
 * @param {string} message - Loading message
 * @param {number} duration - Duration in milliseconds
 * @returns {Promise} - Resolves when loading is complete
 */
const showLoader = (message, duration) => {
  process.stdout.write(message);
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      process.stdout.write(".");
    }, 500);
    setTimeout(() => {
      clearInterval(interval);
      process.stdout.write("\n");
      resolve();
    }, duration);
  });
};

/**
 * Main input orchestration function - coordinates all user prompts
 * @param {Object} tokensData - The existing tokens data
 * @param {*} previousConcept - Unused parameter (kept for backward compatibility)
 * @param {Object} formatChoices - Format choices from previous session
 * @param {Object} scaleSettings - Scale settings to reuse
 * @returns {Promise<Object>} - Complete configuration object
 */
const askForInput = async (tokensData, previousConcept = null, formatChoices = null, scaleSettings = null) => {
  // Steps 1-3: Get token structure (category, naming level)
  const structure = await promptForTokenStructure(tokensData);
  if (!structure) {
    // User didn't confirm, restart
    return await askForInput(tokensData);
  }

  const { tokenType, category, namingLevel } = structure;

  // Step 4: Determine color mode (single vs batch)
  const colorMode = await promptForColorMode();

  // Step 5: Collect colors
  let allColors;
  if (colorMode === 'single') {
    const singleColor = await collectSingleColor(tokensData, category, namingLevel);
    allColors = [singleColor];
  } else {
    allColors = await collectBatchColors(tokensData, category, namingLevel);
  }

  // Extract first color and remaining colors for batch processing
  const firstColor = allColors[0];
  const hex = firstColor.hex;
  const concept = firstColor.name;
  const finalConcept = concept || "color";
  const additionalColors = allColors.slice(1);

  // Step 6: Configure scale (with confirmation loop)
  let stops, newScaleSettings;
  let scaleConfig = scaleSettings; // Reuse scale settings if available

  if (!scaleConfig) {
    const choice = await askPresetOrCustom();
    if (choice === 'preset') {
      scaleConfig = await handlePresetSelection();
      if (!scaleConfig) {
        // User backed out of preset selection, restart the process
        console.log(chalk.bold.greenBright("\nRestarting to let you choose a different path."));
        return await askForInput(tokensData);
      }
    }
  }

  while (true) {
    if (scaleConfig) {
      // Use preset or reused settings
      newScaleSettings = scaleConfig;
      stops = generateStops(hex, newScaleSettings);
      scaleConfig = null; // Consume the config to allow custom tweaking if rejected
    } else {
      // Go to custom configuration
      const scaleResult = await promptForScaleConfiguration(null, hex);
      stops = scaleResult.stops;
      newScaleSettings = scaleResult.scaleSettings;
    }

    // Determine display mode for table
    let mode, padded;
    if (newScaleSettings.type === "ordinal") {
      mode = "ordinal";
      padded = newScaleSettings.padded;
    } else if (newScaleSettings.type === "incremental") {
      mode = "incremental";
      padded = false;
    } else if (newScaleSettings.type === "semanticStops") {
      mode = "semantic stops";
      padded = true;
    } else if (newScaleSettings.type === "alphabetical") {
      mode = "alphabetical";
      padded = false;
    } else {
      mode = "stops";
      padded = false;
    }

    // Step 8: Preview and confirmation
    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold(`🔍 STEP 8: ${allColors.length > 1 ? 'COLORS' : 'COLOR'} PREVIEW`));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    console.log(
      chalk.bold("Type: ") + chalk.whiteBright(tokenType === 'global' ? 'Global' : 'Semantic') +
      (category ? chalk.bold("  Category: ") + chalk.whiteBright(category) : "") +
      (namingLevel ? chalk.bold("  Level: ") + chalk.whiteBright(namingLevel) : "")
    );

    if (allColors.length > 1) {
      console.log(chalk.bold("  Colors: ") + chalk.whiteBright(`${allColors.length} colors in batch mode\n`));
    } else {
      console.log(chalk.bold("  Name: ") + chalk.whiteBright(finalConcept) + "\n");
    }

    if (tokenType === 'global') {
      if (allColors.length > 1) {
        console.log(chalk.bold("📝 Naming Examples:"));
        allColors.slice(0, 3).forEach(color => {
          const pathParts = [category, namingLevel, color.name].filter(p => p != null);
          const namingExample = pathParts.join('.');
          console.log(chalk.whiteBright(`   ${namingExample}`));
        });
        if (allColors.length > 3) {
          console.log(chalk.gray(`   ... and ${allColors.length - 3} more`));
        }
        console.log(chalk.gray("   This is how your colors will be referenced in the tokens\n"));
      } else {
        const pathParts = [category, namingLevel, finalConcept].filter(p => p != null);
        const namingExample = pathParts.join('.');
        console.log(chalk.bold("📝 Naming Example:"));
        console.log(chalk.whiteBright(`   ${namingExample}`));
        console.log(chalk.gray("   This is how your color will be referenced in the tokens\n"));
      }
    }

    // Show preview for first color with visual color blocks
    previewColorScale(stops, newScaleSettings, finalConcept);

    // If in batch mode, show preview for additional colors
    if (allColors.length > 1) {
      console.log(chalk.yellowBright(`\n💡 Note: All ${allColors.length} colors will use the same scale configuration.`));
      console.log(chalk.gray("\n   Additional color previews (first 5 stops shown):\n"));

      additionalColors.forEach(color => {
        // Generate stops for preview using factory function
        const previewStops = generateStops(color.hex, newScaleSettings);

        // Show compact preview with color blocks
        console.log(chalk.bold(`   ${color.name}:`));
        const entries = Object.entries(previewStops).slice(0, 5); // Show first 5 stops
        entries.forEach(([key, value]) => {
          const colorBlock = chalk.bgHex(value).white("      ");
          console.log(`     ${chalk.whiteBright(key.padEnd(10))} ${chalk.whiteBright(value)} ${colorBlock}`);
        });
        if (Object.keys(previewStops).length > 5) {
          console.log(chalk.gray(`     ... and ${Object.keys(previewStops).length - 5} more stops`));
        }
        console.log();
      });
    }

    // Apply middle tone logic
    stops = await applyMiddleToneLogic(stops, newScaleSettings, false);

    const { confirmColor } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmColor",
        message: "Would you like to continue with this nomenclature?\n>>>",
        default: true
      }
    ]);

    if (!confirmColor) {
      console.log(chalk.bold.greenBright("\nNo problem! Let's start over 🧩 since you didn't confirm to move forward with the nomenclature."));
      return await askForInput(tokensData);
    } else {
      break;
    }
  }

  return {
    hex: hex.trim(),
    concept,
    stops,
    colorType: tokenType === 'global' ? 'Global' : 'Semantic',
    category: category,
    namingLevel: namingLevel,
    formatChoices,
    scaleSettings: newScaleSettings,
    additionalColors: additionalColors  // Include batch colors
  };
};

/**
 * Main function - orchestrates the entire wizard flow
 */
const main = async () => {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE COLOR WIZARD'S MAGIC"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  await showLoader(chalk.bold.magenta("🦄 Casting the magic of tokens"), 1500);

  console.log(
    chalk.whiteBright("\n✨ Welcome to the Color Tokens Wizard! 🧙✨ Ready to sprinkle some color magic into your design system? Let's create beautiful color tokens together!") +
    chalk.whiteBright("\n\n🎨 Your tokens will be ready to sync with ") +
    chalk.underline("JSON format for Tokens Studio in Figma") +
    chalk.whiteBright(" in a snap! 🌟 And here's the magical bonus: you'll get ") +
    chalk.underline("SCSS") +
    chalk.whiteBright(" and ") +
    chalk.underline("CSS") +
    chalk.whiteBright(" files to bring your color tokens to life! ✨")
  );

  let tokensData = {};
  const { outputsDir, tokensFolder, cssFolder, scssFolder } = setupOutputDirectories(path.join(__dirname, "..", ".."));

  let namingChoice = null;
  let previousConcept = null;
  let formatChoices = null;
  let scaleSettings = null;

  let addMoreColors = true;

  while (addMoreColors) {
    const input = await askForInput(tokensData, previousConcept, formatChoices, scaleSettings);
    if (!input) return;

    const { hex, concept, variant, generateRGB, generateRGBA, generateHSL, generateOKLCH, stops, namingChoice: newNamingChoice, formatChoices: newFormatChoices, scaleSettings: newScaleSettings, colorType, additionalColors } = input;

    namingChoice = newNamingChoice;
    previousConcept = concept;
    formatChoices = newFormatChoices;
    scaleSettings = newScaleSettings;

    const color = tinycolor(hex);

    const finalConcept = concept || "color";

    const { category, namingLevel } = input;

    // Add the first/main color using helper function
    addColorToTokens(tokensData, {
      colorType,
      category,
      namingLevel,
      colorName: finalConcept,
      colorStops: stops
    });

    // Process additional colors if batch mode was used
    if (additionalColors && additionalColors.length > 0) {
      console.log(chalk.black.bgYellowBright("\n======================================="));
      console.log(chalk.bold(`🎨 PROCESSING ${additionalColors.length} ADDITIONAL COLOR${additionalColors.length > 1 ? 'S' : ''}`));
      console.log(chalk.black.bgYellowBright("=======================================\n"));

      for (const additionalColor of additionalColors) {
        // Generate stops using factory function
        let additionalStops = generateStops(additionalColor.hex, newScaleSettings);

        // Apply middle tone logic automatically for batch colors
        additionalStops = await applyMiddleToneLogic(additionalStops, newScaleSettings, true);

        // Add this color to tokens using helper function
        addColorToTokens(tokensData, {
          colorType,
          category,
          namingLevel,
          colorName: additionalColor.name,
          colorStops: additionalStops
        });

        console.log(chalk.greenBright(`✓ Added: ${additionalColor.name} (${additionalColor.hex})`));
      }

      console.log(chalk.greenBright(`\n✅ Successfully processed ${1 + additionalColors.length} color${additionalColors.length > 0 ? 's' : ''} with the same scale settings!\n`));
    }

    tokensData = ensureValueBeforeType(tokensData);

    saveTokensToFile(tokensData, 'hex', tokensFolder, 'color_tokens_hex.json');
    saveCSSTokensToFile(tokensData, cssFolder, 'color_variables_hex.css');
    saveSCSSTokensToFile(tokensData, scssFolder, 'color_variables_hex.scss');

    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("➕ EXTRA STEP: ADD MORE COLORS"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    addMoreColors = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addMoreColors',
        message: "🎨 Would you like to add another color?\n>>>",
        default: false
      }
    ]).then(answers => answers.addMoreColors);
  }

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🔄 CONVERTING COLOR TOKENS TO OTHER FORMATS"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  const convertAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'convert',
      message: 'Would you like to convert the color tokens to other formats (RGB, RGBA, HSL and/or OKLCH)?\n>>>',
      default: false
    }
  ]);

  let formatsAnswer = { formats: [] };
  if (convertAnswer.convert) {
    formatsAnswer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'formats',
        message: 'Please, select the formats you want to use to convert your color tokens (leave empty to skip):\n>>>',
        choices: [
          { name: 'RGB', value: 'rgb' },
          { name: 'RGBA', value: 'rgba' },
          { name: 'HSL', value: 'hsl' },
          { name: 'OKLCH', value: 'oklch' }
        ]
      }
    ]);
  }

  let conversionFormats = { generateRGB: false, generateRGBA: false, generateHSL: false, generateOKLCH: false };

  let updatedFiles = [];
  let savedNewFiles = [];

  const formatPaths = {};

  formatsAnswer.formats.forEach(unit => {
    const formatKey = unit.toUpperCase();
    conversionFormats[`generate${formatKey}`] = true;

    formatPaths[unit] = {
      json: path.join(tokensFolder, `color_tokens_${unit}.json`),
      css: path.join(cssFolder, `color_variables_${unit}.css`),
      scss: path.join(scssFolder, `color_variables_${unit}.scss`)
    };

    const existedBefore = Object.values(formatPaths[unit]).some(fs.existsSync);

    const tokensConverted = convertTokensToFormat(tokensData, formatKey);
    saveTokensToFile(tokensConverted, formatKey, tokensFolder, `color_tokens_${unit}.json`);
    saveCSSTokensToFile(tokensConverted, cssFolder, `color_variables_${unit}.css`);
    saveSCSSTokensToFile(tokensConverted, scssFolder, `color_variables_${unit}.scss`);

    if (existedBefore) {
      updatedFiles.push(...Object.values(formatPaths[unit]));
    } else {
      savedNewFiles.push(...Object.values(formatPaths[unit]));
    }
  });

  const deletedFiles = deleteUnusedFormatFiles(
    { tokens: tokensFolder, css: cssFolder, scss: scssFolder },
    conversionFormats
  );

  const hexPaths = {
    json: path.join(tokensFolder, 'color_tokens_hex.json'),
    css: path.join(cssFolder, 'color_variables_hex.css'),
    scss: path.join(scssFolder, 'color_variables_hex.scss')
  };

  const hexExistence = {
    json: fs.existsSync(hexPaths.json),
    css: fs.existsSync(hexPaths.css),
    scss: fs.existsSync(hexPaths.scss)
  };

  saveTokensToFile(tokensData, "HEX", tokensFolder, "color_tokens_hex.json");
  saveCSSTokensToFile(tokensData, cssFolder, "color_variables_hex.css");
  saveSCSSTokensToFile(tokensData, scssFolder, "color_variables_hex.scss");

  Object.entries(hexExistence).forEach(([key, existed]) => {
    if (existed) {
      updatedFiles.push(hexPaths[key]);
    } else {
      savedNewFiles.push(hexPaths[key]);
    }
  });

  await showLoader(chalk.bold.magenta("\n🌈Finalizing your spell"), 1500);

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  console.log(chalk.whiteBright("📂 Files are organized in the following folders:"));
  console.log(chalk.whiteBright("   -> /outputs_files/tokens/color: JSON Token Files"));
  console.log(chalk.whiteBright("   -> /outputs_files/css/color: CSS variables"));
  console.log(chalk.whiteBright("   -> /outputs_files/scss/color: SCSS variables\n"));

  if (updatedFiles.length > 0) {
    console.log(chalk.whiteBright("🆕 Updated:"));
    updatedFiles.forEach(filePath => {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(chalk.whiteBright("   -> " + relativePath));
    });
  }

  if (savedNewFiles.length > 0) {
    console.log(chalk.whiteBright("\n✅ Saved:"));
    savedNewFiles.forEach(filePath => console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), filePath)}`)));
  }

  if (deletedFiles.length > 0) {
    console.log("");
    console.log(chalk.whiteBright("🗑️ Deleted:"));
    deletedFiles.forEach(filePath => {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(chalk.whiteBright("   -> " + relativePath));
    });
  }

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎉🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  console.log(
    chalk.bold.whiteBright("Thank you for summoning the ") +
    chalk.bold.yellow("Color Tokens Wizard") +
    chalk.bold.whiteBright("! ❤️🧙🎨\n")
  );
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  // Clean up caches
  clearColorMixCache();
  clearHexValidationCache();
};

main();
