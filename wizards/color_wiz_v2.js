import tinycolor from "tinycolor2";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import chalk from "chalk";
import Table from "cli-table3";

const versionArg = process.argv.find((arg) => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Color Tokens Wizard - Version ${version}`));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const askForInput = async (previousConcept = null, formatChoices = null, scaleSettings = null) => {
  const finalColorType = "Global";
  if (previousConcept) {
    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("☝️ STEP 1: COLOR TOKEN TYPE"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));
    console.log("You're currently creating " + chalk.bold(finalColorType + " color tokens."));
  }
  // --- Prompt once for concept and base color (Steps 2 & 3) ---
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("✏️ STEP 2: COLOR NAME"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));
  let response = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter a name for the color (e.g., blue, yellow, red):\n>>>",
      default: "color",
      validate: (input) =>
        /^[a-zA-Z0-9.-]*$/.test(input) ? true : "Name should only contain letters, numbers, hyphens, and dots."
    }
  ]);
  const concept = response.name.trim();
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🚧 STEP 3: SELECT BASE COLOR"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));
  let hexResponse = await inquirer.prompt([
    {
      type: "input",
      name: "hex",
      message: "Enter a HEX value to use as base color (e.g., #FABADA):\n>>>",
      validate: (input) =>
        tinycolor(input).isValid() ? true : "Invalid HEX color. Please provide a valid HEX color."
    }
  ]);
  const hex = hexResponse.hex.toUpperCase();

  let stops, newScaleSettings;
  // --- Loop for scale selection & preview (Step 4 onward) ---
  while (true) {
    if (scaleSettings) {
      newScaleSettings = scaleSettings;
      console.log(chalk.black.bgYellowBright("\n======================================="));
      console.log(chalk.bold("➡️ STEP 4: CURRENT SCALE"));
      console.log(chalk.black.bgYellowBright("=======================================\n"));
      console.log(`Current scale type: ${scaleSettings.type}` + 
        (scaleSettings.type === "ordinal" ? ` (padded: ${scaleSettings.padded})` : ""));
      stops = newScaleSettings.type === "incremental" 
        ? generateStopsIncremental(hex, newScaleSettings.incrementalOption, newScaleSettings.stopsCount)
        : (newScaleSettings.type === "shadesSemantic"
             ? generateStopsSemantic(hex, newScaleSettings.stopsCount)
             : generateStopsOrdinal(hex, newScaleSettings.padded, newScaleSettings.stopsCount));
    } else {
      console.log(chalk.black.bgYellowBright("\n======================================="));
      console.log(chalk.bold("🔢 STEP 4: SELECT SCALE TYPE"));
      console.log(chalk.black.bgYellowBright("=======================================\n"));
      const { scaleType } = await inquirer.prompt([
        {
          type: "list",
          name: "scaleType",
          message: "Select the scale type for your color:",
          choices: [
            { name: "Incremental", value: "incremental" },
            { name: "Ordinal", value: "ordinal" },
            { name: "Shades Semantic", value: "shadesSemantic" }
          ]
        }
      ]);
      let ordinalPadded, incrementalChoice, stopsCount;
      if (scaleType === "ordinal") {
        const { ordinalOption } = await inquirer.prompt([
          {
            type: 'list',
            name: 'ordinalOption',
            message: "For Ordinal scale, choose the format:",
            choices: [
              { name: "Padded (e.g., 01, 02, 03)", value: 'padded' },
              { name: "Unpadded (e.g., 1, 2, 3)", value: 'unpadded' }
            ]
          }
        ]);
        ordinalPadded = ordinalOption === 'padded';
      } else if (scaleType === "incremental") {
        incrementalChoice = await inquirer.prompt([
          {
            type: 'list',
            name: 'incrementalOption',
            message: "For Incremental scale, choose the step increment:",
            choices: [
              { name: "10 in 10 (e.g., 10, 20, 30, ...)", value: '10' },
              { name: "50 in 50 (e.g., 50, 100, 150, 200)", value: '50' },
              { name: "100 in 100 (e.g., 100, 200, 300, 400)", value: '100' },
            ]
          }
        ]);
      } else if (scaleType === "shadesSemantic") {
        const { semanticStopsCount } = await inquirer.prompt([
          {
            type: "list",
            name: "semanticStopsCount",
            message: "Select the number of stops for the semantic scale:",
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
      if (scaleType !== "shadesSemantic") {
        const response = await inquirer.prompt([
          {
            type: "number",
            name: "stopsCount",
            message: "How many values would you like to include in the color scale? (1-20)",
            default: 10,
            validate: (input) => {
              const num = Number(input);
              return num >= 1 && num <= 20 ? true : "Enter a number between 1 and 20.";
            }
          }
        ]);
        stopsCount = response.stopsCount;
      }
      newScaleSettings = {
        type: scaleType,
        padded: scaleType === "ordinal" ? ordinalPadded : null,
        incrementalOption: scaleType === "incremental" ? incrementalChoice.incrementalOption : undefined,
        stopsCount: stopsCount
      };
      stops = scaleType === "incremental"
        ? generateStopsIncremental(hex, newScaleSettings.incrementalOption, stopsCount)
        : (scaleType === "shadesSemantic"
             ? generateStopsSemantic(hex, stopsCount)
             : generateStopsOrdinal(hex, ordinalPadded, stopsCount));
    }
    // Preview and confirmation
    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("STEP 4.5: 🔍 EXAMPLE COLOR PREVIEW"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));
    console.log(`Base HEX: ${hex}`);
    console.log(printStopsTable(stops));
    const { confirmColor } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmColor",
        message: "Would you like to continue with this color nomenclature?",
        default: true
      }
    ]);
    if (confirmColor) break;
    else {
      console.log(chalk.bold.greenBright("\nLet's re-select the scale (Step 4) since you didn't confirm."));
    }
  }
  return {
    hex: hex.trim(),
    concept,
    stops,
    colorType: finalColorType,
    formatChoices,
    scaleSettings: newScaleSettings
  };
};

const generateStopsIncremental = (hex, step = '50', stopsCount = 10) => {
  const stops = {};
  const stepNum = parseInt(step);
  for (let i = 0; i < stopsCount; i++) {
    const key = (i + 1) * stepNum; 
    let ratio = stopsCount === 1 ? 0 : i / (stopsCount - 1);
    let mixPercentage;
    if (ratio < 0.5) {
      mixPercentage = (1 - ratio * 2) * 100;
      stops[key] = tinycolor.mix(hex, "white", mixPercentage).toHexString().toUpperCase();
    } else {
      mixPercentage = ((ratio - 0.5) * 2) * 100;
      stops[key] = tinycolor.mix(hex, "black", mixPercentage).toHexString().toUpperCase();
    }
  }
  stops["base"] = tinycolor(hex).toHexString().toUpperCase();
  return stops;
};

const generateStopsOrdinal = (hex, padded = true, stopsCount = 10) => {
  const stops = {};
  for (let i = 0; i < stopsCount; i++) {
    const ratio = stopsCount === 1 ? 0 : i / (stopsCount - 1);
    const key = padded ? String(i + 1).padStart(2, '0') : String(i + 1);
    const mixPercentage = ratio < 0.5 ? (1 - ratio * 2) * 100 : (ratio - 0.5) * 100;
    stops[key] = tinycolor.mix(hex, ratio < 0.5 ? "white" : "black", mixPercentage).toHexString().toUpperCase();
  }
  if (padded) {
    // Force ascending order: e.g., "01", "02", ..., "10", "11", ...
    const sortedEntries = Object.entries(stops).sort((a, b) => Number(a[0]) - Number(b[0]));
    return Object.fromEntries(sortedEntries);
  }
  return stops;
};

const generateStopsSemantic = (hex, stopsCount) => {
  let labels;
  // Define labels with an odd number of entries so that "base" is always centered.
  switch (stopsCount) {
    case 1:
      labels = ["base"];
      break;
    case 2:
      labels = ["dark", "base", "light"];
      break;
    case 4:
      labels = ["darker", "dark", "base", "light", "lighter"];
      break;
    case 6:
      labels = ["darkest", "darker", "dark", "base", "light", "lighter", "lightest"];
      break;
    case 8:
      labels = ["ultra-dark", "darkest", "darker", "dark", "base", "light", "lighter", "lightest", "ultra-light"];
      break;
    case 10:
      labels = ["ultra-dark", "darkest", "darker", "dark", "semi-dark", "base", "semi-light", "light", "lighter", "lightest", "ultra-light"];
      break;
    default:
      return generateStopsOrdinal(hex, true, stopsCount);
  }
  const stops = {};
  const total = labels.length;
  // Ensure "base" is always placed in the center of the gradient.
  const baseIndex = Math.floor(total / 2);
  for (let i = 0; i < total; i++) {
    if (i === baseIndex) {
      stops[labels[i]] = tinycolor(hex).toHexString().toUpperCase();
    } else if (i < baseIndex) {
      const mixPercentage = Math.round(((baseIndex - i) / baseIndex) * 100);
      stops[labels[i]] = tinycolor.mix(hex, "black", mixPercentage).toHexString().toUpperCase();
    } else {
      const mixPercentage = Math.round(((i - baseIndex) / (total - 1 - baseIndex)) * 100);
      stops[labels[i]] = tinycolor.mix(hex, "white", mixPercentage).toHexString().toUpperCase();
    }
  }
  return stops;
};

const saveTokensToFile = (tokensData, format, folder, fileName) => {
  const filePath = path.join(folder, fileName);

  // Sort tokens if keys are padded (i.e. match /^\d{2}$/)
  const sortedTokensData = {};
  for (const concept in tokensData) {
    const entries = Object.entries(tokensData[concept]);
    sortedTokensData[concept] = entries.every(([key]) => /^\d{2}$/.test(key))
      ? Object.fromEntries(entries.sort((a, b) => Number(a[0]) - Number(b[0])))
      : Object.fromEntries(entries.sort((a, b) => a[0].localeCompare(b[0])));
  }

  fs.writeFileSync(filePath, JSON.stringify(sortedTokensData, null, 2));
};

const deleteUnusedFormatFiles = (folder, formats) => {
  if (!formats) return; // Early return if formats is null or undefined
  const formatFiles = {
    RGB: "color_tokens_rgb.json",
    RGBA: "color_tokens_rgba.json",
    HSL: "color_tokens_hsl.json"
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

const convertTokensToCSS = (tokens) => {
  let cssVariables = ":root {\n";
  const processTokens = (obj, prefix = "") => {
    for (const key in obj) {
      if (obj[key].value) {
        cssVariables += `  --${prefix}${key}: ${obj[key].value};\n`;
      } else {
        processTokens(obj[key], `${prefix}${key}-`);
      }
    }
  };
  processTokens(tokens);
  cssVariables += "}";
  return cssVariables;
};

const saveCSSTokensToFile = (tokens, folder, fileName) => {
  const cssContent = convertTokensToCSS(tokens);
  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, cssContent);
};

const convertTokensToSCSS = (tokens) => {
  let scssVariables = "";
  const processTokens = (obj, prefix = "") => {
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

const saveSCSSTokensToFile = (tokens, folder, fileName) => {
  const scssContent = convertTokensToSCSS(tokens);
  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, scssContent);
};

const convertTokensToFormat = (tokens, format) => {
  const converted = JSON.parse(JSON.stringify(tokens));
  const convertRecursive = (obj) => {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === "object" && "value" in obj[key]) {
        if (format === "RGB") {
          obj[key].value = tinycolor(obj[key].value).toRgbString();
        } else if (format === "RGBA") {
          const rgba = tinycolor(obj[key].value).toRgb();
          obj[key].value = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
        } else if (format === "HSL") {
          obj[key].value = tinycolor(obj[key].value).toHslString();
        }
      } else if (obj[key] && typeof obj[key] === "object") {
        convertRecursive(obj[key]);
      }
    }
  };
  convertRecursive(converted);
  return converted;
};

// Updated helper to format stops output without quotes for keys and show a color sample using chalk:
const formatStopsOutput = (stops) => {
  return Object.entries(stops)
    .map(([key, value]) => {
      // key prints as-is without quotes, value remains in quotes.
      const sample = chalk.bgHex(value).white("     "); // a block of spaces colored accordingly
      return `${key}: ${value} ${sample}`;
    })
    .join(",\n");
};

// New helper to print stops as a table:
const printStopsTable = (stops) => {
  let entries = Object.entries(stops);
  // If all keys are numeric (padded ordinal values), sort numerically in ascending order
  if (entries.every(([key]) => /^\d+$/.test(key))) {
    entries.sort((a, b) => Number(a[0]) - Number(b[0]));
  }
  const table = new Table({
    head: [chalk.bold("Scale"), chalk.bold("HEX"), chalk.bold("Sample")],
    style: { head: [], border: [] }
  });
  entries.forEach(([key, value]) => {
    table.push([key, value, chalk.bgHex(value).white("     ")]);
  });
  return table.toString();
};

const main = async () => {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE MAGIC"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  await showLoader(chalk.bold.magenta("🦄 Casting the magic of tokens"), 2000);

  console.log(
    chalk.whiteBright("\n❤️ Welcome to the ") +
      chalk.bold.yellow("Color Tokens Wizard") +
      chalk.whiteBright(" script! \nLet this wizard guide you through creating your color tokens in just a few steps. \nGenerate your colors, convert them, and prepare them for import or sync with ") +
      chalk.underline("Tokens Studio") +
      chalk.whiteBright(" format.")
  );

  let tokensData = {};
  const outputsDir = path.join(__dirname, "..", "outputs");
  const tokensFolder = path.join(outputsDir, "tokens/colors");
  const cssFolder = path.join(outputsDir, "css/colors");
  const scssFolder = path.join(outputsDir, "scss/colors");
  let namingChoice = null;
  let previousConcept = null;
  let formatChoices = null;
  let scaleSettings = null;

  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder, { recursive: true });
  if (!fs.existsSync(scssFolder)) fs.mkdirSync(scssFolder, { recursive: true });

  let addMoreColors = true;

  while (addMoreColors) {
    
    const existingVariants = previousConcept && tokensData[previousConcept] ? Object.keys(tokensData[previousConcept]) : [];
    const input = await askForInput(existingVariants, namingChoice, scaleSettings);
    if (!input) return;

    const { hex, concept, variant, generateRGB, generateRGBA, generateHSL, stops, namingChoice: newNamingChoice, formatChoices: newFormatChoices, scaleSettings: newScaleSettings } = input;
    namingChoice = newNamingChoice;
    previousConcept = concept;
    formatChoices = newFormatChoices;
    scaleSettings = newScaleSettings;  

    const color = tinycolor(hex);
    
    const finalConcept = concept || "color";
    if (!tokensData[finalConcept]) {
      tokensData[finalConcept] = {};
    }

    if (variant) {
      const sortedEntries = Object.keys(stops).every(key => /^\d{2}$/.test(key))
        ? Object.entries(stops).sort((a, b) => Number(a[0]) - Number(b[0]))
        : Object.entries(stops);
      tokensData[finalConcept][variant] = {
        base: { value: hex, type: "color" },
        ...Object.fromEntries(
          sortedEntries.map(([k, v]) => [k, { value: tinycolor(v).toHexString().toUpperCase(), type: "color" }])
        )
      };
    } else {
      tokensData[finalConcept].base = { value: hex, type: "color" };
      const sortedEntries = Object.keys(stops).every(key => /^\d{2}$/.test(key))
        ? Object.entries(stops).sort((a, b) => Number(a[0]) - Number(b[0]))
        : Object.entries(stops);
      sortedEntries.forEach(([k, v]) => {
        tokensData[finalConcept][k] = { value: tinycolor(v).toHexString().toUpperCase(), type: "color" };
      });
    }

    saveTokensToFile(tokensData, 'HEX', tokensFolder, 'color_tokens_hex.json');

    if (generateRGB) {
      const tokensRGBData = JSON.parse(JSON.stringify(tokensData));
      Object.entries(tokensRGBData).forEach(([concept, variants]) => {
        Object.entries(variants).forEach(([variant, colors]) => {
          Object.entries(colors).forEach(([key, token]) => {
            if (token && typeof token === "object" && token.value) {
              tokensRGBData[concept][variant][key].value = tinycolor(token.value).toRgbString();
            } else if (typeof token === "string") {
              tokensRGBData[concept][variant][key] = { value: tinycolor(token).toRgbString(), type: "color" };
            }
          });
        });
      });
      saveTokensToFile(tokensRGBData, 'RGB', tokensFolder, 'color_tokens_rgb.json');
    }
    
    if (generateRGBA) {
      const tokensRGBAData = JSON.parse(JSON.stringify(tokensData));
      Object.entries(tokensRGBAData).forEach(([concept, variants]) => {
        Object.entries(variants).forEach(([variant, colors]) => {
          Object.entries(colors).forEach(([key, token]) => {
            if (token && typeof token === "object" && token.value) {
              const rgba = tinycolor(token.value).toRgb(); 
              tokensRGBAData[concept][variant][key].value = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
            } else if (typeof token === "string") {
              const rgba = tinycolor(token).toRgb();
              tokensRGBAData[concept][variant][key] = { value: `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`, type: "color" };
            }
          });
        });
      });
      saveTokensToFile(tokensRGBAData, 'RGBA', tokensFolder, 'color_tokens_rgba.json');
    }
    
    if (generateHSL) {
      const tokensHSLData = JSON.parse(JSON.stringify(tokensData));
      Object.entries(tokensHSLData).forEach(([concept, variants]) => {
        Object.entries(variants).forEach(([variant, colors]) => {
          Object.entries(colors).forEach(([key, token]) => {
            if (token && typeof token === "object" && token.value) {
              tokensHSLData[concept][variant][key].value = tinycolor(token.value).toHslString();
            } else if (typeof token === "string") {
              tokensHSLData[concept][variant][key] = { value: tinycolor(token).toHslString(), type: "color" };
            }
          });
        });
      });
      saveTokensToFile(tokensHSLData, 'HSL', tokensFolder, 'color_tokens_hsl.json');
    }

    deleteUnusedFormatFiles(tokensFolder, formatChoices);

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

  // NEW CONVERSION PROMPT BLOCK
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🔄 CONVERTING COLOR TOKENS TO OTHER FORMATS"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));
  const convertAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'convert',
      message: 'Would you like to convert the color tokens to other formats (RGB, RGBA and/or HSL)?',
      default: true
    }
  ]);
  let formatsAnswer = { formats: [] };
  if (convertAnswer.convert) {
    formatsAnswer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'formats',
        message: 'Please, select the formats you want to use to convert your color tokens (leave empty to skip):',
        choices: [
          { name: 'RGB', value: 'rgb' },
          { name: 'RGBA', value: 'rgba' },
          { name: 'HSL', value: 'hsl' }
        ]
      }
    ]);
  }
  if (formatsAnswer.formats && formatsAnswer.formats.length > 0) {
    formatsAnswer.formats.forEach(unit => {
      const tokensConverted = convertTokensToFormat(tokensData, unit.toUpperCase());
      saveCSSTokensToFile(tokensConverted, cssFolder, `color_variables_${unit}.css`);
      saveSCSSTokensToFile(tokensConverted, scssFolder, `color_variables_${unit}.scss`);
    });
  }

  // Finalize and print output file paths under a dedicated "OUTPUT FILES" section
  await showLoader(chalk.bold.magenta("\n🌈Finalizing your spell"), 2000);

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  const hexJsonPath = path.join(tokensFolder, 'color_tokens_hex.json');
  const cssPath = path.join(cssFolder, 'color_variables.css');
  const scssPath = path.join(scssFolder, 'color_variables.scss');

  const jsonFileExists = fs.existsSync(hexJsonPath);
  const cssFileExists = fs.existsSync(cssPath);
  const scssFileExists = fs.existsSync(scssPath);

  let statusLabel = (jsonFileExists || cssFileExists || scssFileExists) ? "Updated" : "Saved";
  const labelIcon = statusLabel === "Saved" ? "✅" : "🆕";

  // Log primary output files
  console.log(chalk.whiteBright(`${labelIcon} ${statusLabel}:`));
  console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), hexJsonPath)}`));
  console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), cssPath)}`));
  console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), scssPath)}`));

  // Log output files for additional formats if selected
  if (formatChoices) {
    if (formatChoices.generateRGB) {
      const cssRGBPath = path.join(cssFolder, 'color_variables_rgb.css');
      const scssRGBPath = path.join(scssFolder, 'color_variables_rgb.scss');
      console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), cssRGBPath)}`));
      console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), scssRGBPath)}`));
    }
    if (formatChoices.generateRGBA) {
      const cssRGBAPath = path.join(cssFolder, 'color_variables_rgba.css');
      const scssRGBAPath = path.join(scssFolder, 'color_variables_rgba.scss');
      console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), cssRGBAPath)}`));
      console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), scssRGBAPath)}`));
    }
    if (formatChoices.generateHSL) {
      const cssHSLPath = path.join(cssFolder, 'color_variables_hsl.css');
      const scssHSLPath = path.join(scssFolder, 'color_variables_hsl.scss');
      console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), cssHSLPath)}`));
      console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), scssHSLPath)}`));
    }
  }

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎉🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  console.log(chalk.bold.whiteBright("Thank you for summoning the ") + chalk.bold.yellow("Color Tokens Wizard") + chalk.bold.whiteBright("! ❤️🧙🎨\n"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));
};

main();
