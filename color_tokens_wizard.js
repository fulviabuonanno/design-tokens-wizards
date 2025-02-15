const tinycolor = require("tinycolor2");
const fs = require("fs");
const path = require("path"); // New import
const readline = require("readline");

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

// Create an interface for reading input from the command line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask a question and return the answer as a promise
const askQuestion = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

// Function to ask a yes/no question and return the answer as a boolean
const askYesNo = async (question) => {
  let answer;
  do {
    answer = (await askQuestion(question)).trim().toLowerCase();
    if (answer !== "yes" && answer !== "no" && answer !== "y" && answer !== "n") {
      console.log("❌ Please enter 'yes', 'y', 'no', or 'n'.");
    }
  } while (answer !== "yes" && answer !== "no" && answer !== "y" && answer !== "n");
  return answer === "yes" || answer === "y";
};

// Function to handle user input for generating color tokens
const askForInput = async (existingVariants = [], namingChoice = null, previousConcept = null) => {
  console.log("\n=======================================");
  console.log("⭐️ STEP 1: ENTER HEX VALUE");
  console.log("=======================================\n");

  // Ask for a HEX color value
  let hex = await askQuestion("🎨 Let's start by entering a HEX value (e.g., #FABADA): \n>>>\x1b[34m#\x1b[0m");
  if (!tinycolor(hex).isValid()) {
    console.log(`❌ Oops! HEX color "${hex}" seems invalid. Please provide a valid HEX color.\n\n`);
    rl.close();
    return;
  }

  console.log("\n=======================================");
  console.log("🔤 STEP 2: NAME YOUR COLOR");
  console.log("=======================================\n");

  // Ask for a concept name for the color
  let concept = previousConcept;
  if (!concept) {
    console.log("✨ Now, let's give this color token a meaningful and structured name!\n");
    concept = await askQuestion("📝 What concept would you like to assign to color token? \n(e.g., brand, background) or press Enter to skip:\n>>>");
    concept = concept.trim() || "color"; 

    if (concept && !/^[a-zA-Z0-9.-]+$/.test(concept)) {
      console.log("❌ Concept name should only contain letters, numbers, hyphens (-), and dots (.)\n");
      rl.close();
      return;
    }
  }

  let variant = null;
  let isValidNaming = false;

  if (!namingChoice) {
    // Ask for a variant or ordered list name
    console.log("\n🎨 Which modifier criteria would you like to use for naming this token?");
    namingChoice = (await askQuestion("\tA. Variant naming approach (e.g., primary, secondary, tertiary)\n\tB. Scale naming approach (e.g., 01, 02, 03 or 1, 2, 3...)\n\nPlease choose the criteria A, or B:\n>>>")).trim().toUpperCase();
  }

  while (!isValidNaming) {
    switch (namingChoice) {
      case "A":
      case "a":
        const suggestedVariant = getNextVariant(existingVariants);
        variant = await askQuestion(`🎨 Would you like to define a variant name \n(e.g., primary, secondary, tertiary)? Suggested: ${suggestedVariant}\nPress Enter to skip: \n>>>`);
        variant = variant.trim() || suggestedVariant;
        if (variant && !/^[a-zA-Z0-9.-]+$/.test(variant)) {
          console.log("❌ Variant name should only contain letters, numbers, hyphens (-), and dots (.)\n");
        } else {
          isValidNaming = true;
        }
        break;
      case "B":
      case "b":
        const suggestedOrder = existingVariants.length > 0 ? (parseInt(existingVariants[existingVariants.length - 1]) + 1).toString().padStart(2, '0') : "01";
        variant = await askQuestion(`\n🎨 Would you like to use ordered list name \n(e.g., 01, 02, 03 or 1, 2, 3)? Suggested: ${suggestedOrder}\nPress Enter to skip: \n>>>`);
        variant = variant.trim() || suggestedOrder;
        if (variant && !/^[0-9]+$/.test(variant) && !/^[0-9]{2}$/.test(variant)) {
          console.log("❌ Ordered criteria name should only contain numbers (e.g., 01, 02 or 1, 2).\n");
        } else {
          isValidNaming = true;
        }
        break;
      default:
        console.log("=======================================\n");
        console.log("❌ Please choose a valid option (🅰️🅰️ or 🅱️ )\n.");
        namingChoice = (await askQuestion("\tA. Variant naming approach (e.g., primary, secondary, tertiary)\n\tB. Scale naming approach (e.g., 01, 02, 03 or 1, 2, 3...)\n\nPlease choose the criteria A, or B:\n>>>")).trim().toUpperCase();
    }
  }

  console.log("\n=======================================");
  console.log("🤖 STEP 3: SELECT COLOR FORMATS");
  console.log("=======================================\n");

  // Ask if the user wants to generate color tokens in different formats
  let generateRGB = await askYesNo("📌 Include color tokens in RGB format? (yes/no or y/n): ");
  let generateRGBA = await askYesNo("📌 Include color tokens RGBA format? (yes/no or y/n): ");
  let generateHSL = await askYesNo("📌 Include color tokens HSL format? (yes/no or y/n): ");
    
  console.log("\n=======================================");
  console.log("📝 STEP 4: GENERATING COLOR TOKENS");
  console.log("=======================================\n");

  // Generate color stops (variations) based on the base color
  const stops = generateStops(hex);

  return { hex: hex.trim(), concept, variant, generateRGB, generateRGBA, generateHSL, stops, namingChoice };
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

// Main function to orchestrate the color token generation process
const main = async () => {
  console.log("\n=======================================");
  console.log("🪄 STARTING THE MAGIC");
  console.log("=======================================");

  await showLoader("Loading", 2000);

  console.log("\n❤️ Welcome to \x1b[1m\x1b[34mColor Tokens Wizard\x1b[0m script! \nLet 🧙 help you to build your color tokens by following the steps below to generate your color(s) \nand make them ready for importing or syncing \nin \x1b[4mTokens Studio\x1b[0m format.");

  let tokensData = {};
  const outputsDir = path.join(__dirname, "outputs");
  const tokensFolder = path.join(outputsDir, "tokens");
  const cssFolder = path.join(outputsDir, "css");
  const scssFolder = path.join(outputsDir, "scss");
  let namingChoice = null;
  let previousConcept = null;

  // Create output directories if they don't exist
  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder);
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder);
  if (!fs.existsSync(scssFolder)) fs.mkdirSync(scssFolder);

  let addMoreColors = true;

  while (addMoreColors) {
    // Pass variants for the current concept (if any) instead of global tokensData keys.
    const existingVariants = previousConcept && tokensData[previousConcept] ? Object.keys(tokensData[previousConcept]) : [];
    const input = await askForInput(existingVariants, namingChoice, previousConcept);
    if (!input) return;

    const { hex, concept, variant, generateRGB, generateRGBA, generateHSL, stops, namingChoice: newNamingChoice } = input;
    namingChoice = newNamingChoice;
    previousConcept = concept;
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
    saveTokensToFile(tokensData, 'HEX', tokensFolder, 'tokens.json');
    console.log("✅ Saved: outputs/tokens/tokens.json");

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
      saveTokensToFile(tokensRGBData, 'RGB', tokensFolder, 'tokens_rgb.json');
      console.log("✅ Saved: outputs/tokens/tokens_rgb.json");
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
      saveTokensToFile(tokensRGBAData, 'RGBA', tokensFolder, 'tokens_rgba.json');
      console.log("✅ Saved: outputs/tokens/tokens_rgba.json");
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
      saveTokensToFile(tokensHSLData, 'HSL', tokensFolder, 'tokens_hsl.json');
      console.log("✅ Saved: outputs/tokens/tokens_hsl.json");
    }

    // Save CSS variables
    saveCSSTokensToFile(tokensData, cssFolder, 'variables.css');
    console.log("✅ Saved: outputs/css/variables.css");

    // Save SCSS variables
    saveSCSSTokensToFile(tokensData, scssFolder, 'variables.scss');
    console.log("✅ Saved: outputs/scss/variables.scss");

    console.log("\n=======================================");
    console.log("➕ EXTRA STEP: ADD MORE COLORS");
    console.log("=======================================\n");

    // Ask if the user wants to add more colors
    addMoreColors = await askYesNo("🎨 Would you like to add another color? (yes/no or y/n):");
  }

  await showLoader("Finalizing", 2000);

  console.log("\n=======================================");
  console.log("📄 OUTPUT JSON FILES");
  console.log("=======================================\n");

  console.log("✅ The JSON files for Tokens Studio have been generated inside 📁'outputs/tokens/' folder.");
  console.log("✅ The CSS and SCSS files have been generated inside 📁'outputs/css/' and 📁'outputs/scss/'\n");

  console.log("\n=======================================");
  console.log("✅💪 PROCESS COMPLETED");
  console.log("=======================================\n");

  console.log("Thank you for using the Color Tokens Crafter! ❤️🚀🎨\n");
  console.log("=======================================\n");

  // Close the readline interface
  rl.close();
};

// Start the main function
main();
