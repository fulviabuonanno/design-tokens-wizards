import tinycolor from "tinycolor2";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import chalk from "chalk";
import Table from "cli-table3";
import markdownpdf from 'markdown-pdf';

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
            { name: "Shades Semantic (e.g. dark, base, light)", value: "shadesSemantic" }
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
        default: true
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
      return await askForInput(); 
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
    // Ordenar alfabéticamente y forzar que "base" sea la primera
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
      // Aplicar reglas de ordenamiento según contenido:
      if (keys.every(k => semanticOrder.includes(k))) {
        keys = keys.sort((a, b) => semanticOrder.indexOf(a) - semanticOrder.indexOf(b));
      } else if (keys.every(k => /^\d{2}$/.test(k))) {
        keys = keys.sort((a, b) => Number(a) - Number(b));
      } else if (keys.every(k => !isNaN(Number(k)) || k === "base")) {
        keys = keys.filter(k => k !== "base").sort((a, b) => Number(a) - Number(b));
      } else {
        keys = keys.sort((a, b) => a.localeCompare(b));
      }
      // Asegurarse de que "base" quede siempre primero
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
      // Asegurarse de que "base" quede siempre primero
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
  
  const getLevel = (contrast) => {
    // For normal text (minimum 4.5:1 for AA, 7:1 for AAA)
    const normalText = contrast >= 7.0 ? "🟢 AAA" : 
                      contrast >= 4.5 ? "🟡 AA" : 
                      contrast >= 3.0 ? "❌ A" : "❌ -";
    
    // For large text (minimum 3:1 for AA, 4.5:1 for AAA)
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
    textColor: bestTextColor
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
  
  // Original accessibility table
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
    // As background color
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

    // As text on white background
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

    // As text on black background
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

  // Output both tables with appropriate headers
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
  let report = `# Color Tokens Accessibility Report\n\n`;
  report += `## Overview\n\n`;
  report += `This report analyzes the accessibility compliance of your color tokens according to WCAG standards:\n\n`;
  report += `- 🟢 AAA Level: Excellent contrast (7:1+ for normal text, 4.5:1+ for large text)\n`;
  report += `- 🟡 AA Level: Good contrast (4.5:1+ for normal text, 3:1+ for large text)\n`;
  report += `- ❌ Below AA: Does not meet minimum standards\n\n`;

  let totalColors = 0;
  let passesAAA = 0;
  let passesAA = 0;
  let failing = 0;

  // Analyze each color concept
  Object.entries(tokensData).forEach(([concept, variants]) => {
    report += `## ${concept}\n\n`;
    
    // Add visual table header for each concept
    report += `| Color | Sample | Normal Text | Large Text | Contrast |\n`;
    report += `|-------|---------|-------------|------------|----------|\n`;
    
    Object.entries(variants).forEach(([variant, colors]) => {
      if (typeof colors === 'object' && colors.value) {
        // Single color token
        const color = colors.value;
        totalColors++;
        const wcagBg = getWCAGCompliance(color);
        const wcagOnWhite = getWCAGCompliance(color, true, "#FFFFFF");
        const wcagOnBlack = getWCAGCompliance(color, true, "#000000");
        
        const maxContrast = Math.max(
          parseFloat(wcagBg.contrast),
          parseFloat(wcagOnWhite.contrast),
          parseFloat(wcagOnBlack.contrast)
        );

        if (maxContrast >= 7.0) passesAAA++;
        else if (maxContrast >= 4.5) passesAA++;
        else failing++;

        report += `### ${variant}\n\n`;
        
        // Add color row to the table
        report += `| ${color} | ![](https://via.placeholder.com/50/${color.replace('#', '')}/000000?text=+) | ${wcagBg.normalText} | ${wcagBg.largeText} | ${wcagBg.contrast}:1 |\n`;
        report += `| On White | - | ${wcagOnWhite.normalText} | ${wcagOnWhite.largeText} | ${wcagOnWhite.contrast}:1 |\n`;
        report += `| On Black | - | ${wcagOnBlack.normalText} | ${wcagOnBlack.largeText} | ${wcagOnBlack.contrast}:1 |\n\n`;

      } else if (typeof colors === 'object') {
        // Color scale
        report += `### ${variant} Scale\n\n`;
        
        // Add visual table header for the scale
        report += `| Color | Sample | Normal Text | Large Text | Contrast |\n`;
        report += `|-------|---------|-------------|------------|----------|\n`;
        
        Object.entries(colors).forEach(([key, token]) => {
          if (token && typeof token === 'object' && token.value) {
            totalColors++;
            const color = token.value;
            const wcagBg = getWCAGCompliance(color);
            const wcagOnWhite = getWCAGCompliance(color, true, "#FFFFFF");
            const wcagOnBlack = getWCAGCompliance(color, true, "#000000");
            
            const maxContrast = Math.max(
              parseFloat(wcagBg.contrast),
              parseFloat(wcagOnWhite.contrast),
              parseFloat(wcagOnBlack.contrast)
            );

            if (maxContrast >= 7.0) passesAAA++;
            else if (maxContrast >= 4.5) passesAA++;
            else failing++;

            // Add color row to the table
            report += `| ${key}: ${color} | ![](https://via.placeholder.com/50/${color.replace('#', '')}/000000?text=+) | ${wcagBg.normalText} | ${wcagBg.largeText} | ${wcagBg.contrast}:1 |\n`;
            report += `| └─ on white | - | ${wcagOnWhite.normalText} | ${wcagOnWhite.largeText} | ${wcagOnWhite.contrast}:1 |\n`;
            report += `| └─ on black | - | ${wcagOnBlack.normalText} | ${wcagOnBlack.largeText} | ${wcagOnBlack.contrast}:1 |\n`;
          }
        });
        report += '\n';
      }
    });
  });

  // Add summary statistics
  const summaryReport = `## Summary Statistics\n\n` +
    `- Total Colors: ${totalColors}\n` +
    `- AAA Compliant: ${passesAAA} (${((passesAAA/totalColors)*100).toFixed(1)}%)\n` +
    `- AA Compliant: ${passesAA} (${((passesAA/totalColors)*100).toFixed(1)}%)\n` +
    `- Below AA: ${failing} (${((failing/totalColors)*100).toFixed(1)}%)\n\n` +
    `## Usage Guidelines\n\n` +
    `1. **For normal text:**\n` +
    `   - Minimum contrast ratio of 4.5:1 (AA)\n` +
    `   - Preferred contrast ratio of 7:1 (AAA)\n\n` +
    `2. **For large text (18pt+ or 14pt+ bold):**\n` +
    `   - Minimum contrast ratio of 3:1 (AA)\n` +
    `   - Preferred contrast ratio of 4.5:1 (AAA)\n\n` +
    `3. **Best Practices:**\n` +
    `   - Use AAA-compliant colors for primary content\n` +
    `   - Ensure AA compliance for all text\n` +
    `   - Test colors in different contexts (backgrounds, text)\n` +
    `   - Consider color blindness when using color to convey information\n\n` +
    report;

  return summaryReport;
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
  const reportsFolder = path.join(__dirname, "..", "reports");
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

// After processing all colors and before the final loader, add:
console.log(chalk.black.bgYellowBright("\n======================================="));
console.log(chalk.bold("📊 GENERATING ACCESSIBILITY REPORT"));
console.log(chalk.black.bgYellowBright("=======================================\n"));

const accessibilityReport = generateAccessibilityReport(tokensData);
const mdReportPath = path.join(reportsFolder, "accessibility-report.md");
const pdfReportPath = path.join(reportsFolder, "accessibility-report.pdf");

// Save markdown report
fs.writeFileSync(mdReportPath, accessibilityReport);

// Convert to PDF
await new Promise((resolve, reject) => {
  markdownpdf()
    .from(mdReportPath)
    .to(pdfReportPath, () => {
      console.log(chalk.green("✅ Generated PDF report"));
      resolve();
    })
    .on('error', err => {
      console.error(chalk.red("❌ Error generating PDF:"), err);
      reject(err);
    });
});

savedNewFiles.push(mdReportPath);
savedNewFiles.push(pdfReportPath);

await showLoader(chalk.bold.magenta("\n🌈Finalizing your spell"), 2000);

console.log(chalk.black.bgYellowBright("\n======================================="));
console.log(chalk.bold("📄 OUTPUT FILES"));
console.log(chalk.black.bgYellowBright("=======================================\n"));

console.log(chalk.whiteBright("📂 Files are organized in the following folders:"));
console.log(chalk.whiteBright("   -> /outputs/tokens/colors: JSON token files"));
console.log(chalk.whiteBright("   -> /outputs/css/colors: CSS variables"));
console.log(chalk.whiteBright("   -> /outputs/scss/colors: SCSS variables"));
console.log(chalk.whiteBright("   -> /reports: Accessibility report\n"));

if (updatedFiles.length > 0) {
  console.log(chalk.whiteBright("🆕 Updated:"));
  updatedFiles.forEach(filePath => console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), filePath)}`)));
}

if (savedNewFiles.length > 0) {
  console.log(chalk.whiteBright("\n✅ Saved:"));
  savedNewFiles.forEach(filePath => console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), filePath)}`)));
}

if (deletedFiles.length > 0) {
  console.log(""); 
  console.log(chalk.whiteBright("🗑️ Deleted:"));
  deletedFiles.forEach(filePath => console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), filePath)}`)));
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
