import tinycolor from "tinycolor2";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const versionArg = process.argv.find(arg => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Color Tokens Wizard - Version ${version}`));
}

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to display a loader for a specified duration
const showLoader = (message, duration) => {
  process.stdout.write(message);
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      process.stdout.write('.');
    }, 500);
    setTimeout(() => {
      clearInterval(interval);
      process.stdout.write('\n');
      resolve();
    }, duration);
  });
};

// Function to ask a question and return the answer as a promise
const askQuestion = (query) => {
  return inquirer.prompt([{ type: 'input', name: 'answer', message: query }]).then(answers => answers.answer);
};

// Function to handle user input for generating color tokens
const askForInput = async (existingVariants = [], namingChoice = null, previousConcept = null, formatChoices = null) => {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("⭐️ STEP 1: ENTER HEX VALUE"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  // Ask for a HEX color value
  let { hex } = await inquirer.prompt([
    {
      type: 'input',
      name: 'hex',
      message: "🎨 Let's start by entering a HEX value (e.g., #FABADA):\n>>>",
      validate: (input) => tinycolor(input).isValid() ? true : "❌ Oops! HEX color seems invalid. Please provide a valid HEX color."
    }
  ]);

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🔤 STEP 2: NAME YOUR COLOR"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  // Ask for a concept name for the color
  let concept = previousConcept;
  if (!concept) {
    let response = await inquirer.prompt([
      {
        type: 'input',
        name: 'concept',
        message: "📝 What concept would you like to assign to color token?\n(e.g., brand, background)\n\x1b[31mPress Enter to use default:\x1b[0m\:\n>>>",
        default: 'color',
        validate: (input) => /^[a-zA-Z0-9.-]*$/.test(input) ? true : "❌ Concept name should only contain letters, numbers, hyphens (-), and dots (.)"
      }
    ]);
    concept = response.concept.trim();
  }

  let variant = null;
  let isValidNaming = false;

  if (!namingChoice) {
    // Ask for a variant or ordered list name
    let response = await inquirer.prompt([
      {
        type: 'list',
        name: 'namingChoice',
        message: "\n🎨 Which modifier criteria would you like to use for naming this token?\n",
        choices: [
          { name: 'A. Variant (e.g., primary, secondary, tertiary)', value: 'A' },
          { name: 'B. Cardinal Scale (e.g., 01, 02, 03 or 1, 2, 3...)', value: 'B' },
          { name: 'C. Alphabetical Scale (e.g., A, B, C or a, b, c...)', value: 'C' },
          { name: 'D. Incremental Scale (e.g., 100, 200, 300...)', value: 'D' }
        ]
      }
    ]);
    namingChoice = response.namingChoice;
  }

  while (!isValidNaming) {
    switch (namingChoice) {
      case "A":
        const suggestedVariant = getNextVariant(existingVariants);
        let variantResponse = await inquirer.prompt([
          {
            type: 'input',
            name: 'variant',
            message: `🎨 Would you like to define a variant for your color\n(e.g., primary, secondary, tertiary)?\nSuggested: ${suggestedVariant}\n\x1b[31mPress Enter to use default:\x1b[0m:\n>>>`,
            default: suggestedVariant,
            validate: (input) => /^[a-zA-Z0-9.-]*$/.test(input) ? true : "❌ Variant name should only contain letters, numbers, hyphens (-), and dots (.)"
          }
        ]);
        variant = variantResponse.variant.trim();
        isValidNaming = true;
        break;
      case "B":
        const suggestedOrder = existingVariants.length > 0 ? (parseInt(existingVariants[existingVariants.length - 1]) + 1).toString().padStart(2, '0') : "01";
        let orderResponse = await inquirer.prompt([
          {
            type: 'input',
            name: 'variant',
            message: `🎨 Would you like to use a cardinal scale for your color\n(e.g., 01, 02, 03 or 1, 2, 3)?\nSuggested: ${suggestedOrder}\n\x1b[31mPress Enter to use default:\x1b[0m\n>>>`,
            default: suggestedOrder,
            validate: (input) => /^[0-9]+$/.test(input) ? true : "❌ Ordered criteria name should only contain numbers (e.g., 01, 02 or 1, 2)."
          }
        ]);
        variant = orderResponse.variant.trim();
        isValidNaming = true;
        break;
      case "C":
        const suggestedAlpha = existingVariants.length > 0 ? String.fromCharCode(existingVariants[existingVariants.length - 1].charCodeAt(0) + 1) : "A";
        let alphaResponse = await inquirer.prompt([
          {
            type: 'input',
            name: 'variant',
            message: `🎨 Would you like to use an alphabetical scale for your color\n(e.g., A, B, C or a, b, c)?\nSuggested: ${suggestedAlpha}\n\x1b[31mPress Enter to use default:\x1b[0m\n>>>`,
            default: suggestedAlpha,
            validate: (input) => /^[a-zA-Z]+$/.test(input) ? true : "❌ Alphabetical criteria name should only contain letters (e.g., A, B, C or a, b, c)."
          }
        ]);
        variant = alphaResponse.variant.trim();
        isValidNaming = true;
        break;
      case "D":
        const suggestedIncremental = existingVariants.length > 0 ? (parseInt(existingVariants[existingVariants.length - 1]) + 100).toString() : "100";
        let incrementalResponse = await inquirer.prompt([
          {
            type: 'input',
            name: 'variant',
            message: `🎨 Would you like to use an incremental scale for your color\n(e.g., 100, 200, 300)?\nSuggested: ${suggestedIncremental}\n\x1b[31mPress Enter to use default:\x1b[0m\n>>>`,
            default: suggestedIncremental,
            validate: (input) => /^[0-9]+$/.test(input) ? true : "❌ Incremental criteria name should only contain numbers (e.g., 100, 200, 300)."
          }
        ]);
        variant = incrementalResponse.variant.trim();
        isValidNaming = true;
        break;
      default:
        let choiceResponse = await inquirer.prompt([
          {
            type: 'list',
            name: 'namingChoice',
            message: "❌ Please choose a valid option (A, B, C, or D):",
            choices: [
              { name: 'A. Variant Naming (e.g., primary, secondary, tertiary)', value: 'A' },
              { name: 'B. Cardinal Scale Naming (e.g., 01, 02, 03 or 1, 2, 3...)', value: 'B' },
              { name: 'C. Alphabetical Scale Naming (e.g., A, B, C or a, b, c...)', value: 'C' },
              { name: 'D. Incremental Scale Naming (e.g., 100, 200, 300...)', value: 'D' }
            ]
          }
        ]);
        namingChoice = choiceResponse.namingChoice;
    }
  }

  let generateRGB, generateRGBA, generateHSL;

  // Replace the existing code for selecting color formats with the following:

if (!formatChoices) {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🤖 STEP 3: SELECT COLOR FORMATS"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  let formatResponse = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'formats',
      message: "Select color token formats to generate:",
      choices: [
        { name: 'RGB', value: 'RGB' },
        { name: 'RGBA', value: 'RGBA' },
        { name: 'HSL', value: 'HSL' }
      ],
      validate: (input) => {
        if (input.length === 0) {
          return "❌ Please select at least one format.";
        }
        return true;
      }
    }
  ]);

  const generateRGB = formatResponse.formats.includes('RGB');
  const generateRGBA = formatResponse.formats.includes('RGBA');
  const generateHSL = formatResponse.formats.includes('HSL');

  formatChoices = { generateRGB, generateRGBA, generateHSL };
} else {
  ({ generateRGB, generateRGBA, generateHSL } = formatChoices);
}

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("📝 STEP 4: GENERATING COLOR TOKENS"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  // Generate color stops (variations) based on the base color
  const stops = generateStops(hex);

  return { hex: hex.trim(), concept, variant, generateRGB, generateRGBA, generateHSL, stops, namingChoice, formatChoices };
};

// Function to generate color stops (variations) based on a base color
const generateStops = (color) => {
  return {
    base: tinycolor(color).toHexString(), // Base color in HEX format
    lightest: tinycolor(color).lighten(40).toHexString(), // Lightest variation (40% lighter)
    lighter: tinycolor(color).lighten(30).toHexString(), // Lighter variation (30% lighter)
    light: tinycolor(color).lighten(20).toHexString(), // Light variation (20% lighter)
    dark: tinycolor(color).darken(20).toHexString(), // Dark variation (20% darker)
    darker: tinycolor(color).darken(30).toHexString(), // Darker variation (30% darker)
    darkest: tinycolor(color).darken(40).toHexString() // Darkest variation (40% darker)
  };
};

// Function to save color tokens to files (update the folder path to be absolute)
const saveTokensToFile = (tokensData, format, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, JSON.stringify(tokensData, null, 2));
};

// Function to delete JSON files for formats that are not included
const deleteUnusedFormatFiles = (folder, formats) => {
  const formatFiles = {
    RGB: 'color_tokens_rgb.json',
    RGBA: 'color_tokens_rgba.json',
    HSL: 'color_tokens_hsl.json'
  };

  for (const [format, fileName] of Object.entries(formatFiles)) {
    if (!formats[`generate${format}`]) {
      const filePath = path.join(folder, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted: ${filePath}`);
      }
    }
  }
};

// Function to get the next variant name in sequence
const getNextVariant = (existingVariants) => {
  const variants = ["primary", "secondary", "tertiary", "quaternary", "quinary", "senary", "septenary", "octonary", "nonary", "denary"];
  for (let variant of variants) {
    if (!existingVariants.includes(variant)) {
      return variant;
    }
  }
  return `variant${existingVariants.length + 1}`;
};

// Function to convert tokens to CSS variables
const convertTokensToCSS = (tokens) => {
  let cssVariables = ':root {\n';
  const processTokens = (obj, prefix = '') => {
    for (const key in obj) {
      if (obj[key].value) {
        cssVariables += `  --${prefix}${key}: ${obj[key].value};\n`;
      } else {
        processTokens(obj[key], `${prefix}${key}-`);
      }
    }
  };
  processTokens(tokens);
  cssVariables += '}';
  return cssVariables;
};

// Function to save CSS variables to a file (use absolute path)
const saveCSSTokensToFile = (tokens, folder, fileName) => {
  const cssContent = convertTokensToCSS(tokens);
  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, cssContent);
};

// Function to convert tokens to SCSS variables
const convertTokensToSCSS = (tokens) => {
  let scssVariables = '';
  const processTokens = (obj, prefix = '') => {
    for (const key in obj) {
      if (obj[key].value) {
        scssVariables += `$${prefix}${key}: ${obj[key].value};\n`;
      } else {
        processTokens(obj[key], `${prefix}${key}-`);
      }
    }
  };
  processTokens(tokens);
  return scssVariables;
};

// Function to save SCSS variables to a file (use absolute path)
const saveSCSSTokensToFile = (tokens, folder, fileName) => {
  const scssContent = convertTokensToSCSS(tokens);
  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, scssContent);
};

// Add this helper function near the other helper definitions:
const convertTokensToFormat = (tokens, format) => {
  const converted = JSON.parse(JSON.stringify(tokens));
  Object.entries(converted).forEach(([concept, variants]) => {
    Object.entries(variants).forEach(([variant, colors]) => {
      Object.entries(colors).forEach(([key, color]) => {
        if (format === 'RGB') {
          converted[concept][variant][key].value = tinycolor(color.value).toRgbString();
        } else if (format === 'RGBA') {
          const rgba = tinycolor(color.value).toRgb();
          converted[concept][variant][key].value = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
        } else if (format === 'HSL') {
          converted[concept][variant][key].value = tinycolor(color.value).toHslString();
        }
      });
    });
  });
  return converted;
};

// Main function to orchestrate the color token generation process
const main = async () => {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.black.bgYellowBright("======================================="));

  await showLoader(chalk.bold.magenta("\n🦄Casting the magic of tokens"), 2000);

  console.log(chalk.whiteBright("\n❤️ Welcome to the ") + chalk.bold.yellow("Color Tokens Wizard") + chalk.whiteBright(" script! \nLet this wizard 🧙 guide you through crafting your color tokens in just a few steps. \nGenerate your colors, convert them, and prepare them for importing or syncing \nwith ") + chalk.underline("Tokens Studio") + chalk.whiteBright(" format."));

  let tokensData = {};
  const outputsDir = path.join(__dirname, "..", "outputs");
  const tokensFolder = path.join(outputsDir, "tokens/colors");
  const cssFolder = path.join(outputsDir, "css/colors");
  const scssFolder = path.join(outputsDir, "scss/colors");
  let namingChoice = null;
  let previousConcept = null;
  let formatChoices = null;

  // Create output directories if they don't exist
  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder, { recursive: true });
  if (!fs.existsSync(scssFolder)) fs.mkdirSync(scssFolder, { recursive: true });

  let addMoreColors = true;

  while (addMoreColors) {
    // Pass variants for the current concept (if any) instead of global tokensData keys.
    const existingVariants = previousConcept && tokensData[previousConcept] ? Object.keys(tokensData[previousConcept]) : [];
    const input = await askForInput(existingVariants, namingChoice, previousConcept, formatChoices);
    if (!input) return;

    const { hex, concept, variant, generateRGB, generateRGBA, generateHSL, stops, namingChoice: newNamingChoice, formatChoices: newFormatChoices } = input;
    namingChoice = newNamingChoice;
    previousConcept = concept;
    formatChoices = newFormatChoices;
    const color = tinycolor(hex);
    const rgb = color.toRgbString();
    const rgba = color.toRgb();
    const hsl = color.toHslString();

    const finalConcept = concept || "color";

    // Generate color tokens data
    if (!tokensData[finalConcept]) {
      tokensData[finalConcept] = {};
    }

    if (variant) {
      tokensData[finalConcept][variant] = { base: { value: hex, type: "color" }, ...Object.fromEntries(Object.entries(stops).map(([k, v]) => [k, { value: tinycolor(v).toHexString(), type: "color" }])) };
    } else {
      tokensData[finalConcept].base = { value: hex, type: "color" };
      Object.entries(stops).forEach(([k, v]) => {
        tokensData[finalConcept][k] = { value: tinycolor(v).toHexString(), type: "color" };
      });
    }

    // Save color tokens in HEX format
    saveTokensToFile(tokensData, 'HEX', tokensFolder, 'color_tokens_hex.json');
    console.log("✅ Saved: outputs/tokens/colors/color_tokens_hex.json");

    // Save color tokens in RGB format if selected
    if (generateRGB) {
      const tokensRGBData = JSON.parse(JSON.stringify(tokensData));
      Object.entries(tokensRGBData).forEach(([concept, variants]) => {
        Object.entries(variants).forEach(([variant, colors]) => {
          Object.entries(colors).forEach(([key, color]) => {
            tokensRGBData[concept][variant][key].value = tinycolor(color.value).toRgbString();
          });
        });
      });
      saveTokensToFile(tokensRGBData, 'RGB', tokensFolder, 'color_tokens_rgb.json');
      console.log("✅ Saved: outputs/tokens/colors/color_tokens_rgb.json");
    }

    // Save color tokens in RGBA format if selected
    if (generateRGBA) {
      const tokensRGBAData = JSON.parse(JSON.stringify(tokensData));
      Object.entries(tokensRGBAData).forEach(([concept, variants]) => {
        Object.entries(variants).forEach(([variant, colors]) => {
          Object.entries(colors).forEach(([key, color]) => {
            const rgbaValue = tinycolor(color.value).toRgb(); 
            const rgbaString = `rgba(${rgbaValue.r},${rgbaValue.g},${rgbaValue.b},${rgbaValue.a})`;
            tokensRGBAData[concept][variant][key].value = rgbaString;
          });
        });
      });
      saveTokensToFile(tokensRGBAData, 'RGBA', tokensFolder, 'color_tokens_rgba.json');
      console.log("✅ Saved: outputs/tokens/colors/color_tokens_rgba.json");
    }

    // Save color tokens in HSL format if selected
    if (generateHSL) {
      const tokensHSLData = JSON.parse(JSON.stringify(tokensData));
      Object.entries(tokensHSLData).forEach(([concept, variants]) => {
        Object.entries(variants).forEach(([variant, colors]) => {
          Object.entries(colors).forEach(([key, color]) => {
            tokensHSLData[concept][variant][key].value = tinycolor(color.value).toHslString();
          });
        });
      });
      saveTokensToFile(tokensHSLData, 'HSL', tokensFolder, 'color_tokens_hsl.json');
      console.log("✅ Saved: outputs/tokens/colors/color_tokens_hsl.json");
    }

    // Delete unused format files
    deleteUnusedFormatFiles(tokensFolder, formatChoices);

    // Save CSS variables
    saveCSSTokensToFile(tokensData, cssFolder, 'color_variables.css');
    console.log("✅ Saved: outputs/css/colors/color_variables.css");

    // Save SCSS variables
    saveSCSSTokensToFile(tokensData, scssFolder, 'color_variables.scss');
    console.log("✅ Saved: outputs/scss/colors/color_variables.scss");

    // In the main function, after saving the base HEX CSS and SCSS files, add:
if (formatChoices) {
  if (formatChoices.generateRGB) {
    const tokensRGBConverted = convertTokensToFormat(tokensData, 'RGB');
    saveCSSTokensToFile(tokensRGBConverted, cssFolder, 'color_variables_rgb.css');
    console.log("✅ Saved: outputs/css/colors/color_variables_rgb.css");
    saveSCSSTokensToFile(tokensRGBConverted, scssFolder, 'color_variables_rgb.scss');
    console.log("✅ Saved: outputs/scss/colors/color_variables_rgb.scss");
  }
  if (formatChoices.generateRGBA) {
    const tokensRGBAConverted = convertTokensToFormat(tokensData, 'RGBA');
    saveCSSTokensToFile(tokensRGBAConverted, cssFolder, 'color_variables_rgba.css');
    console.log("✅ Saved: outputs/css/colors/color_variables_rgba.css");
    saveSCSSTokensToFile(tokensRGBAConverted, scssFolder, 'color_variables_rgba.scss');
    console.log("✅ Saved: outputs/scss/colors/color_variables_rgba.scss");
  }
  if (formatChoices.generateHSL) {
    const tokensHSLConverted = convertTokensToFormat(tokensData, 'HSL');
    saveCSSTokensToFile(tokensHSLConverted, cssFolder, 'color_variables_hsl.css');
    console.log("✅ Saved: outputs/css/colors/color_variables_hsl.css");
    saveSCSSTokensToFile(tokensHSLConverted, scssFolder, 'color_variables_hsl.scss');
    console.log("✅ Saved: outputs/scss/colors/color_variables_hsl.scss");
  }
}

    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("➕ EXTRA STEP: ADD MORE COLORS"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    // Ask if the user wants to add more colors
    addMoreColors = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addMoreColors',
        message: "🎨 Would you like to add another color?\n>>>",
        default: false
      }
    ]).then(answers => answers.addMoreColors);
  }

  await showLoader(chalk.bold.magenta("\n🌈Finalizing your spell"), 2000);

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT JSON FILES"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  console.log(chalk.whiteBright("✅ The JSON files for Tokens Studio have been generated inside \n📁'outputs/tokens/colors/' folder."));
  console.log(chalk.whiteBright("\n✅ The CSS and SCSS files have been generated inside \n📁'outputs/css/colors/' and 📁'outputs/scss/colors/' folders."));

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("✅🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  console.log(chalk.bold.whiteBright("Thank you for summoning the ") + chalk.bold.yellow("Color Tokens Wizard") + chalk.bold.whiteBright("! ❤️🧙🎨\n"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));
};

// Start the main function
main();


