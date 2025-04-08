import tinycolor from "tinycolor2";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import chalk from "chalk";
import Table from "cli-table3";
import puppeteer from 'puppeteer';

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

const askForInput = async (tokensData, previousConcept = null, formatChoices = null, scaleSettings = null) => {
  const finalColorType = "Global";
  if (previousConcept) {
    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("☝️ STEP 1: COLOR TOKEN TYPE"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));
    console.log("You're currently creating " + chalk.bold(finalColorType + " color tokens."));
  }
  
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("✏️ STEP 2: COLOR NAME"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));
  let response = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter a name for the color (e.g., blue, yellow, red):\n>>>",
      default: "color",
      validate: (input) => {
        const trimmedInput = input.trim();
        if (!trimmedInput.match(/^[a-zA-Z0-9.-]*$/)) {
          return "Name should only contain letters, numbers, hyphens, and dots.";
        }
        // Check if the color name already exists in tokensData
        if (tokensData[trimmedInput]) {
          return `A color with the name "${trimmedInput}" already exists. Please choose a different name.`;
        }
        // Check if the color name exists as a variant in any other color
        for (const colorName in tokensData) {
          if (tokensData[colorName] && typeof tokensData[colorName] === 'object') {
            if (Object.keys(tokensData[colorName]).includes(trimmedInput)) {
              return `A color variant with the name "${trimmedInput}" already exists under "${colorName}". Please choose a different name.`;
            }
          }
        }
        return true;
      }
    }
  ]);
  const concept = response.name.trim();
  const finalConcept = concept || "color";
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
            { name: "Incremental (e.g., 50, 100, 150, 200)", value: "incremental" },
            { name: "Ordinal (e.g., 1, 2, 3)", value: "ordinal" },
            { name: 'Alphabetical (e.g., A, B, C)', value: 'alphabetical' },
            { name: "Shades Semantic (e.g. dark, base, light)", value: "shadesSemantic" }
          ]
        }
      ]);
      let ordinalPadded, incrementalChoice, stopsCount, alphabeticalOption;
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
              { name: "25 in 25 (e.g., 25, 50, 75, 100)", value: '25' },
              { name: "50 in 50 (e.g., 50, 100, 150, 200)", value: '50' },
              { name: "100 in 100 (e.g., 100, 200, 300, 400)", value: '100' },
            ]
          }
        ]);
      } else if (scaleType === "alphabetical") {
        const { alphabeticalOption: option } = await inquirer.prompt([
          {
            type: "list",
            name: "alphabeticalOption",
            message: "For Alphabetical scale, choose the format:",
            choices: [
              { name: "Uppercase (e.g., A, B, C)", value: 'uppercase' },
              { name: "Lowercase (e.g., a, b, c)", value: 'lowercase' }
            ]
          }
        ]);
        alphabeticalOption = option;
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
             : (scaleType === "alphabetical"
                  ? generateStopsAlphabetical(hex, alphabeticalOption, stopsCount)
                  : generateStopsOrdinal(hex, ordinalPadded, stopsCount)));
    }
    
    let mode, padded;
    if (newScaleSettings.type === "ordinal") {
      mode = "ordinal";
      padded = newScaleSettings.padded; 
    } else if (newScaleSettings.type === "incremental") {
      mode = "incremental";
      padded = false;
    } else if (newScaleSettings.type === "shadesSemantic") {
      mode = "shades semantic";
      padded = true; 
    } else {
      
      mode = "stops"; 
      padded = false;
    }

    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("STEP 4.5: 🔍 EXAMPLE COLOR PREVIEW"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    console.log(
      chalk.bold("Type: ") + chalk.whiteBright(finalColorType) + 
      chalk.bold("  Name: ") + chalk.whiteBright(finalConcept) + "\n"
    );

    console.log(printStopsTable(stops, mode, padded));

    const { showAccessibility } = await inquirer.prompt([
      {
        type: "confirm",
        name: "showAccessibility",
        message: "Would you like to see the accessibility analysis for these colors?",
        default: false
      }
    ]);

    if (showAccessibility) {
      console.log(chalk.black.bgYellowBright("\n======================================="));
      console.log(chalk.bold("STEP 4.6: ♿ ACCESSIBILITY ANALYSIS"));
      console.log(chalk.black.bgYellowBright("=======================================\n"));
      
      const accessibilityTables = printAccessibilityTable(stops);
      console.log(accessibilityTables);
    }

    const { confirmColor } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmColor",
        message: "Would you like to continue with this nomenclature?",
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
    colorType: finalColorType,
    formatChoices,
    scaleSettings: newScaleSettings
  };
};

const MIN_MIX = 10;  
const MAX_MIX = 90;  

const generateStopsIncremental = (hex, step = '50', stopsCount = 10) => {
  const stops = {};
  const stepNum = parseInt(step);
  
  for (let i = 0; i < stopsCount; i++) {
    const key = (i + 1) * stepNum; 
    const ratio = stopsCount === 1 ? 0 : i / (stopsCount - 1);
    let mixPercentage;
    if (ratio < 0.5) {
      mixPercentage = MIN_MIX + (1 - ratio * 2) * (MAX_MIX - MIN_MIX);
      stops[key] = tinycolor.mix(hex, "white", mixPercentage).toHexString().toUpperCase();
    } else {
      mixPercentage = MIN_MIX + ((ratio - 0.5) * 2) * (MAX_MIX - MIN_MIX);
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
    
    const mixPercentage = ratio < 0.5 
      ? MIN_MIX + (1 - ratio * 2) * (MAX_MIX - MIN_MIX)
      : MIN_MIX + ((ratio - 0.5) * 2) * (MAX_MIX - MIN_MIX);
    stops[key] = tinycolor.mix(hex, ratio < 0.5 ? "white" : "black", mixPercentage).toHexString().toUpperCase();
  }
  if (padded) {
    const sortedEntries = Object.entries(stops).sort((a, b) => Number(a[0]) - Number(b[0]));
    return Object.fromEntries(sortedEntries);
  }
  return stops;
};

const generateStopsSemantic = (hex, stopsCount) => {
  let labels;
  
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
      const defaultLabels = ["ultra-dark", "darkest", "darker", "dark", "base", "light", "lighter", "lightest", "ultra-light"];
      labels = [];
      const extra = Math.max(0, stopsCount + 2 - defaultLabels.length);
      if (extra > 0) {
        labels = defaultLabels.slice();
        while (labels.length < stopsCount + 2) {
          labels.unshift(defaultLabels[0]);
          labels.push(defaultLabels[defaultLabels.length - 1]);
        }
      } else {
        const step = Math.floor(defaultLabels.length / (stopsCount + 1));
        for (let i = 0; i < stopsCount + 2; i++) {
          labels.push(defaultLabels[Math.min(i * step, defaultLabels.length - 1)]);
        }
      }
      break;
  }
  
  const alphabeticalOption = format === 'uppercase' ? 'uppercase' : 'lowercase';
  let format = alphabeticalOption;
  if (format === 'uppercase') {
    format = 'uppercase';
    labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  } else {
    format = 'lowercase';
    labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  }

  const stops = {};
  const total = labels.length;
  const baseIndex = Math.floor(total / 2);
  
  const MIN_MIX = 10; 
  const MAX_MIX = 90; 
  
  for (let i = 0; i < total; i++) {
    if (i === baseIndex) {
      stops[labels[i]] = tinycolor(hex).toHexString().toUpperCase();
    } else if (i < baseIndex) {
      
      const mixPercentage = Math.round(
        MIN_MIX + ((baseIndex - i) / baseIndex) * (MAX_MIX - MIN_MIX)
      );
      stops[labels[i]] = tinycolor.mix(hex, "black", mixPercentage).toHexString().toUpperCase();
    } else {
      
      const mixPercentage = Math.round(
        MIN_MIX + ((i - baseIndex) / (total - 1 - baseIndex)) * (MAX_MIX - MIN_MIX)
      );
      stops[labels[i]] = tinycolor.mix(hex, "white", mixPercentage).toHexString().toUpperCase();
    }
  }
  return stops;
};

const generateStopsAlphabetical = (hex, format = 'uppercase', stopsCount = 10) => {
  const stops = {};
  const startCharCode = format === 'uppercase' ? 65 : 97; // ASCII for 'A' or 'a'
  for (let i = 0; i < stopsCount; i++) {
    const key = String.fromCharCode(startCharCode + i);
    const ratio = stopsCount === 1 ? 0 : i / (stopsCount - 1);
    let mixPercentage;
    if (ratio < 0.5) {
      mixPercentage = MIN_MIX + (1 - ratio * 2) * (MAX_MIX - MIN_MIX);
      stops[key] = tinycolor.mix(hex, "white", mixPercentage).toHexString().toUpperCase();
    } else {
      mixPercentage = MIN_MIX + ((ratio - 0.5) * 2) * (MAX_MIX - MIN_MIX);
      stops[key] = tinycolor.mix(hex, "black", mixPercentage).toHexString().toUpperCase();
    }
  }
  if (stops.hasOwnProperty('Base')) {
    delete stops['Base'];
  }
  return stops;
};

const semanticOrder = [
  "ultra-dark", "darkest", "darker", "dark",
  "semi-dark", "base", "semi-light", "light",
  "lighter", "lightest", "ultra-light"
];

const customStringify = (obj, indent = 2) => {
  const spacer = " ".repeat(indent);
  const stringify = (value, currentIndent) => {
    if (value === null || typeof value !== "object") {
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      const items = value.map(item => stringify(item, currentIndent + indent));
      return "[\n" + " ".repeat(currentIndent + indent) + items.join(",\n" + " ".repeat(currentIndent + indent)) + "\n" + " ".repeat(currentIndent) + "]";
    }
    let keys = Object.keys(value);
    
    keys.sort((a, b) => a.localeCompare(b));
    if (keys.includes("base")) {
      keys = ["base", ...keys.filter(k => k !== "base")];
    }
    let result = "{\n";
    keys.forEach((key, idx) => {
      result += " ".repeat(currentIndent + indent) + JSON.stringify(key) + ": " + stringify(value[key], currentIndent + indent);
      if (idx < keys.length - 1) result += ",\n";
    });
    result += "\n" + " ".repeat(currentIndent) + "}";
    return result;
  };
  return stringify(obj, 0);
};

const saveTokensToFile = (tokensData, format, folder, fileName) => {
  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, customStringify(tokensData, 2));
};

const deleteUnusedFormatFiles = (folders, formats) => {
  if (!formats) return [];
  
  const formatFiles = {
    RGB: {
      tokens: "color_tokens_rgb.json",
      css: "color_variables_rgb.css",
      scss: "color_variables_rgb.scss"
    },
    RGBA: {
      tokens: "color_tokens_rgba.json",
      css: "color_variables_rgba.css",
      scss: "color_variables_rgba.scss"
    },
    HSL: {
      tokens: "color_tokens_hsl.json",
      css: "color_variables_hsl.css",
      scss: "color_variables_hsl.scss"
    },
    HEX: {
      css: "color_variables_hex.css",
      scss: "color_variables_hex.scss"
    }
  };

  const deletedFiles = [];

  for (const [format, filesByFolder] of Object.entries(formatFiles)) {
    
    if (format === "HEX") continue;
    if (!formats[`generate${format}`]) {
      for (const [folderKey, fileName] of Object.entries(filesByFolder)) {
        const folderPath = folders[folderKey];
        const filePath = path.join(folderPath, fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedFiles.push(filePath);
        }
      }
    }
  }

  return deletedFiles;
};

const convertTokensToCSS = (tokens) => {
  let cssVariables = ":root {\n";
  const processTokens = (obj, prefix = "") => {
    let keys = Object.keys(obj);
    if (keys.length) {
      
      if (keys.every(k => semanticOrder.includes(k))) {
        keys = keys.sort((a, b) => semanticOrder.indexOf(a) - semanticOrder.indexOf(b));
      } else if (keys.every(k => /^\d{2}$/.test(k))) {
        keys = keys.sort((a, b) => Number(a) - Number(b));
      } else if (keys.every(k => !isNaN(Number(k)) || k === "base")) {
        keys = keys.filter(k => k !== "base").sort((a, b) => Number(a) - Number(b));
      } else {
        keys = keys.sort((a, b) => a.localeCompare(b));
      }
      
      if (obj.hasOwnProperty("base")) {
        keys = keys.filter(k => k !== "base");
        keys.unshift("base");
      }
      for (const key of keys) {
        if (obj[key] && typeof obj[key] === "object" && "value" in obj[key]) {
          cssVariables += `  --${prefix}${key}: ${obj[key].value};\n`;
        } else {
          processTokens(obj[key], `${prefix}${key}-`);
        }
      }
    }
  };
  processTokens(tokens);
  cssVariables += "}";
  return cssVariables;
};

const convertTokensToSCSS = (tokens) => {
  let scssVariables = "";
  const processTokens = (obj, prefix = "") => {
    let keys = Object.keys(obj);
    if (keys.length) {
      if (keys.every(k => semanticOrder.includes(k))) {
        keys = keys.sort((a, b) => semanticOrder.indexOf(a) - semanticOrder.indexOf(b));
      } else if (keys.every(k => /^\d{2}$/.test(k))) {
        keys = keys.sort((a, b) => Number(a) - Number(b));
      } else if (keys.every(k => !isNaN(Number(k)) || k === "base")) {
        keys = keys.filter(k => k !== "base").sort((a, b) => Number(a) - Number(b));
      } else {
        keys = keys.sort((a, b) => a.localeCompare(b));
      }
      
      if (obj.hasOwnProperty("base")) {
        keys = keys.filter(k => k !== "base");
        keys.unshift("base");
      }
      for (const key of keys) {
        if (obj[key] && typeof obj[key] === "object" && "value" in obj[key]) {
          scssVariables += `$${prefix}${key}: ${obj[key].value};\n`;
        } else {
          processTokens(obj[key], `${prefix}${key}-`);
        }
      }
    }
  };
  processTokens(tokens);
  return scssVariables;
};

const saveCSSTokensToFile = (tokens, folder, fileName) => {
  const cssContent = convertTokensToCSS(tokens);
  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, cssContent);
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

const formatStopsOutput = (stops) => {
  return Object.entries(stops)
    .map(([key, value]) => {
      
      const sample = chalk.bgHex(value).white("     "); 
      return `${key}: ${value} ${sample}`;
    })
    .join(",\n");
};

const simulateColorBlindness = (color, type = 'deuteranopia') => {
  const rgb = tinycolor(color).toRgb();
  let r = rgb.r;
  let g = rgb.g;
  let b = rgb.b;

  switch (type) {
    case 'protanopia':
      r = r * 0.567 + g * 0.433;
      g = r * 0.558 + g * 0.442;
      b = r * 0 + g * 0.242 + b * 0.758;
      break;
    case 'deuteranopia':
      r = r * 0.625 + g * 0.375;
      g = r * 0.7 + g * 0.3;
      b = r * 0 + g * 0.3 + b * 0.7;
      break;
    case 'tritanopia':
      r = r * 0.95 + g * 0.05;
      g = r * 0 + g * 0.433 + b * 0.567;
      b = r * 0 + g * 0.475 + b * 0.525;
      break;
  }

  return tinycolor({ r, g, b }).toHexString();
};

const getWCAGCompliance = (backgroundColor, isForeground = false, bgColor = null) => {
  const color = tinycolor(backgroundColor);
  
  let contrast;
  if (isForeground && bgColor) {
    contrast = tinycolor.readability(color, bgColor);
  } else {
    const whiteContrast = tinycolor.readability(color, "#FFFFFF");
    const blackContrast = tinycolor.readability(color, "#000000");
    contrast = Math.max(whiteContrast, blackContrast);
  }

  const colorBlindnessTests = {
    protanopia: simulateColorBlindness(backgroundColor, 'protanopia'),
    deuteranopia: simulateColorBlindness(backgroundColor, 'deuteranopia'),
    tritanopia: simulateColorBlindness(backgroundColor, 'tritanopia')
  };
  
  const getLevel = (contrast) => {
    const normalText = contrast >= 7.0 ? "🟢 AAA" : 
                      contrast >= 4.5 ? "🟡 AA" : 
                      contrast >= 3.0 ? "❌ A" : "❌ -";
    
    const largeText = contrast >= 4.5 ? "🟢 AAA" :
                     contrast >= 3.0 ? "🟡 AA" :
                     contrast >= 2.0 ? "❌ A" : "❌ -";
    
    return {
      normalText,
      largeText
    };
  };

  const bestTextColor = isForeground ? null : 
    tinycolor.readability(color, "#FFFFFF") > tinycolor.readability(color, "#000000") ? "white" : "black";
  
  const levels = getLevel(contrast);
  
  return {
    normalText: levels.normalText,
    largeText: levels.largeText,
    contrast: contrast.toFixed(2),
    textColor: bestTextColor,
    colorBlindnessTests
  };
};

const printStopsTable = (stops, mode = "shades semantic", padded = false) => {
  let entries = Object.entries(stops);

  if (mode === "shades semantic") {
    const semanticOrder = [
      "ultra-light", "lightest", "lighter", "light",
      "semi-light", "base", "semi-dark", "dark",
      "darker", "darkest", "ultra-dark"
    ];
    entries.sort((a, b) => {
      const aIndex = semanticOrder.indexOf(a[0]);
      const bIndex = semanticOrder.indexOf(b[0]);
      return aIndex - bIndex;
    });
  } else if (mode === "ordinal" || mode === "incremental") {
    if (padded) {
      entries.forEach(([key, value], idx) => {
        if (key !== "base") {
          entries[idx][0] = key.padStart(2, "0");
        }
      });
    }
    
    entries.sort((a, b) => {
      if (a[0] === "base" && b[0] !== "base") return -1;
      if (b[0] === "base" && a[0] !== "base") return 1;
      return parseInt(a[0], 10) - parseInt(b[0], 10);
    });
  }

  const table = new Table({
    head: [
      chalk.bold.yellowBright("Scale"), 
      chalk.bold.yellowBright("HEX"), 
      chalk.bold.yellowBright("Sample")
    ],
    style: { head: [], border: ["yellow"] }
  });

  entries.forEach(([key, value]) => {
    const wcag = getWCAGCompliance(value);
    const textColor = wcag.textColor === "white" ? chalk.white : chalk.black;
    table.push([
      key, 
      value, 
      chalk.bgHex(value)(textColor("         "))
    ]);
  });

  return table.toString();
};

const printAccessibilityTable = (stops) => {
  let entries = Object.entries(stops);
  
  
  const originalTable = new Table({
    head: [
      chalk.bold.yellowBright("Scale"), 
      chalk.bold.yellowBright("HEX"), 
      chalk.bold.yellowBright("Sample"),
      chalk.bold.yellowBright("Normal Text"),
      chalk.bold.yellowBright("Large Text"),
      chalk.bold.yellowBright("Contrast")
    ],
    style: { head: [], border: ["yellow"] },
    colWidths: [15, 10, 12, 15, 15, 12]
  });

  entries.forEach(([key, value]) => {
    
    const wcagBg = getWCAGCompliance(value);
    const textColor = wcagBg.textColor === "white" ? chalk.white : chalk.black;
    const contrastColor = parseFloat(wcagBg.contrast) >= 7.0 ? chalk.green : 
                         parseFloat(wcagBg.contrast) >= 4.5 ? chalk.yellow :
                         chalk.red;

    originalTable.push([
      key, 
      value, 
      chalk.bgHex(value)(textColor("         ")),
      wcagBg.normalText,
      wcagBg.largeText,
      contrastColor(wcagBg.contrast)
    ]);

    
    const wcagOnWhite = getWCAGCompliance(value, true, "#FFFFFF");
    const contrastColorWhite = parseFloat(wcagOnWhite.contrast) >= 7.0 ? chalk.green : 
                              parseFloat(wcagOnWhite.contrast) >= 4.5 ? chalk.yellow :
                              chalk.red;

    originalTable.push([
      "└─ on white", 
      "", 
      "",
      wcagOnWhite.normalText,
      wcagOnWhite.largeText,
      contrastColorWhite(wcagOnWhite.contrast)
    ]);

    
    const wcagOnBlack = getWCAGCompliance(value, true, "#000000");
    const contrastColorBlack = parseFloat(wcagOnBlack.contrast) >= 7.0 ? chalk.green : 
                              parseFloat(wcagOnBlack.contrast) >= 4.5 ? chalk.yellow :
                              chalk.red;

    originalTable.push([
      "└─ on black", 
      "", 
      "",
      wcagOnBlack.normalText,
      wcagOnBlack.largeText,
      contrastColorBlack(wcagOnBlack.contrast)
    ]);
  });

  
  let output = "";
  output += chalk.yellow("\nDetailed Accessibility Analysis:\n");
  output += originalTable.toString();

  output += chalk.yellow("\nAccessibility Guide:\n");
  output += chalk.green("🟢 Excellent contrast - Meets AAA standards (7:1+)\n");
  output += chalk.yellow("🟡 Good contrast - Meets AA standards (4.5:1+)\n");
  output += chalk.red("❌ Poor contrast - Does not meet minimum standards (<4.5:1)\n\n");
  output += "Normal Text: 4.5:1 for AA, 7:1 for AAA\n";
  output += "Large Text: 3:1 for AA, 4.5:1 for AAA\n\n";
  output += "Each color is tested in three contexts:\n";
  output += "1. As a background color (with auto-selected text color)\n";
  output += "2. As a text color on white background\n";
  output += "3. As a text color on black background\n";

  return output;
};

const generateOrdinalStops = (start, end) => {
  const stops = {};
  for (let i = start; i <= end; i++) {
    
    const key = i.toString().padStart(2, "00");
    
    const intensity = Math.floor(255 - ((i - start) * (255 / (end - start))));
    const hexChannel = intensity.toString(16).padStart(2, "0");
    const hex = `#${hexChannel}${hexChannel}${hexChannel}`;
    stops[key] = hex;
  }
  return stops;
};

const stops = generateOrdinalStops(1, 20);

const generateAccessibilityReport = (tokensData) => {
  // Read and encode the banner image
  const bannerPath = path.join(__dirname, '..', 'assets', 'banner.png');
  const bannerBase64 = fs.readFileSync(bannerPath, { encoding: 'base64' });

  const styles = `
    <style>
      body {
        font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        line-height: 1.2;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 20px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 4px;
        text-align: left;
      }
      th {
        background-color: #f5f5f5;
      }
      h2, h3 {
        page-break-before: auto;
        page-break-after: avoid;
        break-before: auto;
        break-after: avoid;
      }
      .banner {
        width: 100%;
        max-width: 800px;
        margin-bottom: 30px;
        display: block;
      }
      h1 {
        font-family: 'Instrument Sans', Arial, sans-serif;
        font-size: 24px;
        font-weight: 600;
        color: #1a1a1a;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 10px;
        margin-bottom: 30px;
      }
      h2 {
        font-family: 'Instrument Sans', Arial, sans-serif;
        font-size: 20px;
        font-weight: 500;
        color: #2c3e50;
        margin-top: 30px;
        margin-bottom: 15px;
      }
      h3 {
        font-family: 'Instrument Sans', Arial, sans-serif;
        font-size: 18px;
        font-weight: 500;
        color: #34495e;
        margin-top: 20px;
      }
      .toc {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .toc ul {
        list-style-type: none;
        padding-left: 0;
      }
      .toc ul ul {
        padding-left: 20px;
      }
      .toc a {
        color: #2c3e50;
        text-decoration: none;
        line-height: 1.8;
      }
      .toc a:hover {
        color: #0056b3;
        text-decoration: underline;
      }
      .introduction {
        background: #fff;
        padding: 20px;
        border-left: 4px solid #2c3e50;
        margin: 20px 0;
      }
      .color-sample {
        width: 50px;
        height: 50px;
        border: 1px solid #ddd;
        display: inline-block;
        margin-right: 10px;
      }
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
        font-size: 0.9em;
        color: #666;
        text-align: center;
      }
      .footer p {
        margin: 5px 0;
      }
      .support-section {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        margin-top: 20px;
        width: 100%;
      }
      .profile-pic {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
      }
      .support-text {
        margin: 0;
      }
      .compliance-aaa {
        color: #2e7d32;
        font-weight: bold;
      }
      .compliance-aa {
        color: #ed6c02;
        font-weight: bold;
      }
      .compliance-fail {
        color: #d32f2f;
        font-weight: bold;
      }
      .bg-sample-container {
        display: flex;
        gap: 10px;
      }
      .bg-sample {
        padding: 8px;
        border-radius: 4px;
        text-align: center;
        min-width: 100px;
      }
      .bg-white {
        background: white;
        border: 1px solid #ddd;
      }
      .bg-black {
        background: black;
        color: white;
      }
      .compliance-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-top: 4px;
      }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  `;

  let totalColors = 0;
  let passesAAA = 0;
  let passesAA = 0;
  let failing = 0;

  let colorComplianceTable = '';
  Object.entries(tokensData).forEach(([concept, variants]) => {
    colorComplianceTable += `<h3>${concept}</h3>`;
    colorComplianceTable += `<table>
      <tr>
        <th>Color Name</th>
        <th>HEX Value</th>
        <th>Sample</th>
        <th>On White (#FFFFFF)</th>
        <th>On Black (#000000)</th>
      </tr>`;
    
    Object.entries(variants).forEach(([variant, colors]) => {
      if (typeof colors === 'object' && colors.value) {
        totalColors++;
        const wcagWhite = getWCAGCompliance(colors.value, true, '#FFFFFF');
        const wcagBlack = getWCAGCompliance(colors.value, true, '#000000');

        const whiteComplianceClass = wcagWhite.normalText.includes("AAA") ? "compliance-aaa" : 
                              wcagWhite.normalText.includes("AA") ? "compliance-aa" : 
                              "compliance-fail";
        const blackComplianceClass = wcagBlack.normalText.includes("AAA") ? "compliance-aaa" : 
                              wcagBlack.normalText.includes("AA") ? "compliance-aa" : 
                              "compliance-fail";

        if (wcagWhite.normalText.includes("AAA") || wcagBlack.normalText.includes("AAA")) passesAAA++;
        else if (wcagWhite.normalText.includes("AA") || wcagBlack.normalText.includes("AA")) passesAA++;
        else failing++;

        colorComplianceTable += `<tr>
          <td>${variant}</td>
          <td>${colors.value}</td>
          <td>
            <div class="bg-sample-container">
              <div class="bg-sample bg-white">
                <div style="color: ${colors.value}">Sample Text</div>
              </div>
              <div class="bg-sample bg-black">
                <div style="color: ${colors.value}">Sample Text</div>
              </div>
            </div>
          </td>
          <td class="${whiteComplianceClass}">
            <div class="compliance-grid">
              <div>Normal Text: ${wcagWhite.normalText}</div>
              <div>Large Text: ${wcagWhite.largeText}</div>
              <div>Contrast: ${wcagWhite.contrast}:1</div>
            </div>
          </td>
          <td class="${blackComplianceClass}">
            <div class="compliance-grid">
              <div>Normal Text: ${wcagBlack.normalText}</div>
              <div>Large Text: ${wcagBlack.largeText}</div>
              <div>Contrast: ${wcagBlack.contrast}:1</div>
            </div>
          </td>
        </tr>`;
      }
    });
    colorComplianceTable += `</table>`;
  });

  const htmlReport = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${styles}
</head>
<body>
  <img src="data:image/png;base64,${bannerBase64}" class="banner" alt="Design Tokens Wizards Banner">
  <h1>Color Accessibility Report 🎨👁️</h1>
  
  <div class="introduction">
    <p>This comprehensive color accessibility report analyzes your design tokens for WCAG 2.2 compliance and provides detailed insights about color contrast, readability, and color blindness considerations. Use this report to ensure your color choices are accessible to all users.</p>
    <p>The report includes contrast ratio analysis for both normal and large text, color blindness simulations, and specific recommendations for improving accessibility where needed.</p>
  </div>

  <div class="toc">
    <h2>Table of Contents</h2>
    <ul>
      <li><a href="#summary">Summary Statistics</a></li>
      <li><a href="#guidelines">Usage Guidelines</a>
        <ul>
          <li><a href="#normal-text">Normal Text Requirements</a></li>
          <li><a href="#large-text">Large Text Requirements</a></li>
          <li><a href="#best-practices">Best Practices</a></li>
        </ul>
      </li>
      <li><a href="#compliance">Color Compliance Analysis</a></li>
      <li><a href="#colorblindness">Color Blindness Analysis</a></li>
    </ul>
  </div>

  <h2 id="summary">Summary Statistics</h2>
  <ul>
    <li>Total Colors: ${totalColors}</li>
    <li>AAA Compliant: ${((passesAAA / totalColors) * 100).toFixed(1)}%</li>
    <li>AA Compliant: ${((passesAA / totalColors) * 100).toFixed(1)}%</li>
    <li>Below AA: ${((failing / totalColors) * 100).toFixed(1)}%</li>
  </ul>

  <h2 id="guidelines">Usage Guidelines</h2>
  <h3 id="normal-text">Normal Text (WCAG 2.2)</h3>
  <ul>
    <li>Minimum contrast ratio: 4.5:1 (AA)</li>
    <li>Preferred contrast ratio: 7:1 (AAA)</li>
  </ul>
  <h3 id="large-text">Large Text (WCAG 2.2)</h3>
  <ul>
    <li>Minimum contrast ratio: 3:1 (AA)</li>
    <li>Preferred contrast ratio: 4.5:1 (AAA)</li>
  </ul>
  <h3 id="best-practices">Best Practices</h3>
  <ul>
    <li>Use AAA compliance for critical text and important UI elements</li>
    <li>Test colors in both light and dark modes</li>
    <li>Consider color blindness when choosing color combinations</li>
    <li>Use semantic color names that describe the purpose</li>
  </ul>

  <h2 id="compliance">Color Compliance Analysis</h2>
  ${colorComplianceTable}

  <h2 id="colorblindness">Color Blindness Analysis</h2>
  <p>This section shows how colors appear to people with different types of color blindness:</p>
  <ul>
    <li>Protanopia: Red-green color blindness (red appears darker)</li>
    <li>Deuteranopia: Red-green color blindness (green appears darker)</li>
    <li>Tritanopia: Blue-yellow color blindness</li>
  </ul>`;

  let colorBlindnessSection = '';
  Object.entries(tokensData).forEach(([concept, variants]) => {
    colorBlindnessSection += `<h3>${concept}</h3>`;
    
    Object.entries(variants).forEach(([variant, colors]) => {
      if (typeof colors === 'object' && colors.value) {
        const wcag = getWCAGCompliance(colors.value);
        colorBlindnessSection += `<table>
          <tr>
            <th>Color Name</th>
            <th>Original</th>
            <th>Protanopia</th>
            <th>Deuteranopia</th>
            <th>Tritanopia</th>
          </tr>
          <tr>
            <td>${variant}</td>
            <td><div class="color-sample" style="background-color: ${colors.value};"></div></td>
            <td><div class="color-sample" style="background-color: ${wcag.colorBlindnessTests.protanopia};"></div></td>
            <td><div class="color-sample" style="background-color: ${wcag.colorBlindnessTests.deuteranopia};"></div></td>
            <td><div class="color-sample" style="background-color: ${wcag.colorBlindnessTests.tritanopia};"></div></td>
          </tr>
        </table>`;
      }
    });
  });

  return {
    html: htmlReport + colorBlindnessSection + `
      <div class="footer">
        <p>Generated by Design Tokens Wizards - Color Accessibility Guidelines</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <div class="support-section">
          <img src="data:image/png;base64,${fs.readFileSync(path.join(__dirname, '..', 'assets', 'profile_pic.png'), { encoding: 'base64' })}" alt="Profile Picture" class="profile-pic">
          <p class="support-text">Do you want to support this project? <a href="https://ko-fi.com/fbuonanno" target="_blank">Invite me a coffee ❤️☕️</a></p>
        </div>
      </div>
    </body>
  </html>`
  };
};

const main = async () => {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE COLOR WIZARD'S MAGIC"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  await showLoader(chalk.bold.magenta("🦄 Casting the magic of tokens"), 1500);

  console.log(
    chalk.whiteBright("\n❤️ Welcome to the ") +
      chalk.bold.yellow("Color Tokens Wizard") +
      chalk.whiteBright(" script! \nLet this wizard guide you through creating your color tokens in just a few steps. \nGenerate your colors, convert them, and prepare them for import or sync with ") +
      chalk.underline("Tokens Studio") +
      chalk.whiteBright(" format.") +
      chalk.whiteBright(".\n✨ As a delightful bonus, you'll receive magical files in ") +
      chalk.underline("SCSS") +
      chalk.whiteBright(" and ") +
      chalk.underline("CSS") +
      chalk.whiteBright(" to test in your implementation!\n")
  );

  let tokensData = {};
  const outputsDir = path.join(__dirname, "..", "..", "output_files");
  const tokensFolder = path.join(outputsDir, "tokens/json/color");
  const cssFolder = path.join(outputsDir, "tokens/css/color");
  const scssFolder = path.join(outputsDir, "tokens/scss/color");
  const reportsFolder = path.join(outputsDir, "reports");
  let namingChoice = null;
  let previousConcept = null;
  let formatChoices = null;
  let scaleSettings = null;

  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder, { recursive: true });
  if (!fs.existsSync(scssFolder)) fs.mkdirSync(scssFolder, { recursive: true });
  if (!fs.existsSync(reportsFolder)) fs.mkdirSync(reportsFolder, { recursive: true });

  let addMoreColors = true;

  while (addMoreColors) {
    
    const existingVariants = previousConcept && tokensData[previousConcept] ? Object.keys(tokensData[previousConcept]) : [];
    const input = await askForInput(tokensData, existingVariants, namingChoice, scaleSettings);
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

    const hexJsonExisted = fs.existsSync(path.join(tokensFolder, 'color_tokens_hex.json'));
    const hexCssExisted  = fs.existsSync(path.join(cssFolder, 'color_variables_hex.css'));
    const hexScssExisted = fs.existsSync(path.join(scssFolder, 'color_variables_hex.scss'));

    const convFilesPreexistence = {
      RGB: {
        tokens: fs.existsSync(path.join(tokensFolder, 'color_tokens_rgb.json')),
        css:    fs.existsSync(path.join(cssFolder, 'color_variables_rgb.css')),
        scss:   fs.existsSync(path.join(scssFolder, 'color_variables_rgb.scss'))
      },
      RGBA: {
        tokens: fs.existsSync(path.join(tokensFolder, 'color_tokens_rgba.json')),
        css:    fs.existsSync(path.join(cssFolder, 'color_variables_rgba.css')),
        scss:   fs.existsSync(path.join(scssFolder, 'color_variables_rgba.scss'))
      },
      HSL: {
        tokens: fs.existsSync(path.join(tokensFolder, 'color_tokens_hsl.json')),
        css:    fs.existsSync(path.join(cssFolder, 'color_variables_hsl.css')),
        scss:   fs.existsSync(path.join(scssFolder, 'color_variables_hsl.scss'))
      }
    };

    saveTokensToFile(tokensData, 'HEX', tokensFolder, 'color_tokens_hex.json');
    saveCSSTokensToFile(tokensData, cssFolder, 'color_variables_hex.css');
    saveSCSSTokensToFile(tokensData, scssFolder, 'color_variables_hex.scss');

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

    deleteUnusedFormatFiles({ tokens: tokensFolder, css: cssFolder, scss: scssFolder }, formatChoices);

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

let conversionFormats = { generateRGB: false, generateRGBA: false, generateHSL: false };

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


console.log(chalk.black.bgYellowBright("\n======================================="));
console.log(chalk.bold("📊 GENERATING ACCESSIBILITY REPORT"));
console.log(chalk.black.bgYellowBright("=======================================\n"));

const reports = generateAccessibilityReport(tokensData);
const pdfReportPath = path.join(reportsFolder, "a11y-color-report.pdf");
const tempHtmlPath = path.join(reportsFolder, "_temp_report.html");

fs.writeFileSync(tempHtmlPath, reports.html);

try {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  
  await page.goto(`file://${tempHtmlPath}`, {
    waitUntil: 'networkidle0'
  });

  await page.pdf({
    path: pdfReportPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    },
    preferCSSPageSize: true
  });

  await browser.close();
  console.log(chalk.green("✅ Generated PDF report"));

  try {
    fs.unlinkSync(tempHtmlPath);
  } catch (e) {
    console.error("Error cleaning up temporary file:", e);
  }
} catch (err) {
  console.error(chalk.red("❌ Error generating PDF:"), err);
}

savedNewFiles.push(pdfReportPath);

await showLoader(chalk.bold.magenta("\n🌈Finalizing your spell"), 1500);

console.log(chalk.black.bgYellowBright("\n======================================="));
console.log(chalk.bold("📄 OUTPUT FILES"));
console.log(chalk.black.bgYellowBright("=======================================\n"));

console.log(chalk.whiteBright("📂 Files are organized in the following folders:"));
console.log(chalk.whiteBright("   -> /outputs/tokens/color: JSON Token Files"));
console.log(chalk.whiteBright("   -> /outputs/css/color: CSS variables"));
console.log(chalk.whiteBright("   -> /outputs/scss/color: SCSS variables"));
console.log(chalk.whiteBright("   -> /reports: Accessibility Report\n"));

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
 
};

main();