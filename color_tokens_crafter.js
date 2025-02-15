const tinycolor = require("tinycolor2");
const fs = require("fs");
const readline = require("readline");

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
  let hex = await askQuestion("🎨 Let's start by entering a HEX value (e.g., #FABADA): \n>\x1b[34m#\x1b[0m");
  if (!tinycolor(hex).isValid()) {
    console.log(`❌ Oops! HEX color "${hex}" seems invalid. Please provide a valid HEX color.`);
    rl.close();
    return;
  }

  console.log("\n=======================================");
  console.log("🤔 STEP 2: NAMING YOUR COLOR");
  console.log("=======================================\n");

  // Ask for a concept name for the color
  let concept = previousConcept;
  if (!concept) {
    console.log("\n✨ Now, let's give this color token a meaningful and structured name!\n");
    concept = await askQuestion("📝 What concept is this color for? \n(e.g., brand, background) or press Enter to skip: \n>");
    concept = concept.trim() || "color"; 

    if (concept && !/^[a-zA-Z0-9.-]+$/.test(concept)) {
      console.log("❌ Concept name should only contain letters, numbers, hyphens (-), and dots (.)");
      rl.close();
      return;
    }
  }

  let variant = null;
  let isValidNaming = false;

  if (!namingChoice) {
    // Ask for a variant or ordered list name
    console.log("\n\n🎨 How would you like to name this color?");
    namingChoice = (await askQuestion("\tA. Variant naming (e.g., primary, secondary, tertiary)\n\tB. Ordered list naming (e.g., 01, 02, 03 or 1, 2, 3...)\n\nPlease choose the criteria A, or B: \n>")).trim().toUpperCase();
  }

  while (!isValidNaming) {
    switch (namingChoice) {
      case "A":
        const suggestedVariant = getNextVariant(existingVariants);
        variant = await askQuestion(`🎨 Would you like to define a variant name \n(e.g., primary, secondary, tertiary)? Suggested: ${suggestedVariant}\nPress Enter to skip: \n>`);
        variant = variant.trim() || suggestedVariant;
        if (variant && !/^[a-zA-Z0-9.-]+$/.test(variant)) {
          console.log("❌ Variant name should only contain letters, numbers, hyphens (-), and dots (.)");
        } else {
          isValidNaming = true;
        }
        break;
      case "B":
        const suggestedOrder = existingVariants.length > 0 ? (parseInt(existingVariants[existingVariants.length - 1]) + 1).toString().padStart(2, '0') : "01";
        variant = await askQuestion(`🎨 Would you like to use ordered list name \n(e.g., 01, 02, 03 or 1, 2, 3)? Suggested: ${suggestedOrder}\nPress Enter to skip: \n>`);
        variant = variant.trim() || suggestedOrder;
        if (variant && !/^[0-9]+$/.test(variant) && !/^[0-9]{2}$/.test(variant)) {
          console.log("❌ Ordered criteria name should only contain numbers (e.g., 01, 02 or 1, 2).");
        } else {
          isValidNaming = true;
        }
        break;
      default:
        console.log("=======================================\n");
        console.log("❌ Please choose a valid option (A or B).");
        return;
    }
  }

  console.log("\n=======================================");
  console.log("🔄 STEP 3: SELECTING FORMATS");
  console.log("=======================================\n");

  // Ask if the user wants to generate color tokens in different formats
  let generateRGB = await askYesNo("📌 Include color tokens in RGB format? (yes/no or y/n): ");
  let generateRGBA = await askYesNo("📌 Include color tokens RGBA format? (yes/no or y/n): ");
  let generateHSL = await askYesNo("📌 Include color tokens HSL format? (yes/no or y/n): ");
    
  console.log("\n=======================================");
  console.log("📝 STEP 4: GENERATING COLOR STOPS");
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

// Function to save color tokens to files
const saveTokensToFile = (tokensData, format, folder, fileName) => {
  fs.writeFileSync(`${folder}/${fileName}`, JSON.stringify(tokensData, null, 2));
  console.log(`✅ Saved: ${folder}/${fileName}`);
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

// Function to save CSS variables to a file
const saveCSSTokensToFile = (tokens, folder, fileName) => {
  const cssContent = convertTokensToCSS(tokens);
  fs.writeFileSync(`${folder}/${fileName}`, cssContent);
  console.log(`✅ Saved CSS variables: ${folder}/${fileName}`);
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

// Function to save SCSS variables to a file
const saveSCSSTokensToFile = (tokens, folder, fileName) => {
  const scssContent = convertTokensToSCSS(tokens);
  fs.writeFileSync(`${folder}/${fileName}`, scssContent);
  console.log(`✅ Saved SCSS variables: ${folder}/${fileName}`);
};

// Main function to orchestrate the color token generation process
const main = async () => {
  console.log("\n=======================================");
  console.log("🚀 STARTING THE PROCESS");
  console.log("=======================================");

  console.log("\n❤️ Welcome to \x1b[1m\x1b[34mColor Tokens Crafter\x1b[0m script! \nFollow the steps below to generate your color(s) \nand make them ready for importing or syncing \nin \x1b[4mTokens Studio\x1b[0m format.");

  let tokensData = {};
  const tokensFolder = 'outputs/tokens';
  let namingChoice = null;
  let previousConcept = null;

  // Create output directories if they don't exist
  if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");
  if (!fs.existsSync("outputs/tokens")) fs.mkdirSync("outputs/tokens");
  if (!fs.existsSync("outputs/css")) fs.mkdirSync("outputs/css"); // Ensure CSS directory exists
  if (!fs.existsSync("outputs/scss")) fs.mkdirSync("outputs/scss"); // Ensure SCSS directory exists

  let addMoreColors = true;

  while (addMoreColors) {
    // Get user input for generating color tokens
    const input = await askForInput(Object.keys(tokensData), namingChoice, previousConcept);
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
    }

    console.log("\n=======================================");
    console.log("➕ EXTRA STEP: ADD MORE COLORS");
    console.log("=======================================\n");

    // Ask if the user wants to add more colors
    addMoreColors = await askYesNo("🎨 Would you like to add another color? (yes/no or y/n): ");
  }

  // Save CSS variables
  saveCSSTokensToFile(tokensData, 'outputs/css', 'variables.css');

  // Save SCSS variables
  saveSCSSTokensToFile(tokensData, 'outputs/scss', 'variables.scss');

  console.log("\n=======================================");
  console.log("✅💪 PROCESS COMPLETED SUCCESSFULLY!");
  console.log("=======================================\n");

  console.log("✅ All files have been generated inside 'outputs/tokens/' folder.");
  console.log("📁 You can now use them as needed.\n");

  console.log("=======================================");
  console.log("📄 CSS & SCSS FILES");
  console.log("=======================================\n");
  console.log("Here are the generated CSS and SCSS files containing your color tokens. You can provide these files to your developers for immediate use and testing:\n");
  console.log("📁 outputs/css/variables.css");
  console.log("📁 outputs/scss/variables.scss\n");

  console.log("Thank you for using the Color Tokens Crafter! ❤️🚀🎨\n");
  console.log("=======================================\n");

  // Close the readline interface
  rl.close();
};

// Start the main function
main();
