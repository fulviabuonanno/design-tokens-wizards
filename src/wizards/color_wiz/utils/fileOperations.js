import fs from "fs";
import path from "path";
import chalk from "chalk";
import tinycolor from "tinycolor2";
import { convertTokensToCSS, convertTokensToSCSS } from "./colorConversion.js";

/**
 * Custom JSON stringifier that maintains semantic ordering
 * @param {Object} obj - Object to stringify
 * @param {number} indent - Indentation level
 * @returns {string} - Stringified JSON
 */
export const customStringify = (obj, indent = 2) => {
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

    keys.sort((a, b) => {
      if (a === "$value") return -1;
      if (b === "$value") return 1;
      if (a === "$type") return -1;
      if (b === "$type") return 1;

      // Check if both keys are numeric (including "base")
      const aIsNum = !isNaN(Number(a));
      const bIsNum = !isNaN(Number(b));

      if (aIsNum && bIsNum) {
        // Both are numeric, sort numerically
        return Number(a) - Number(b);
      } else {
        // At least one is not numeric, use string comparison
        return a.localeCompare(b);
      }
    });

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

/**
 * Saves tokens to a JSON file
 * @param {Object} tokensData - The tokens data to save
 * @param {string} format - The format name (for filename)
 * @param {string} folder - The folder path
 * @param {string} fileName - The base filename
 */
export const saveTokensToFile = (tokensData, format, folder, fileName) => {
  try {
    const filePath = path.join(folder, fileName.replace("hex", format.toLowerCase()));
    fs.writeFileSync(filePath, customStringify(tokensData, 2));
  } catch (error) {
    console.error(chalk.red(`\n❌ Error saving file: ${error.message}`));
    throw error;
  }
};

/**
 * Saves tokens as CSS custom properties
 * @param {Object} tokens - The tokens data
 * @param {string} folder - The folder path
 * @param {string} fileName - The filename
 */
export const saveCSSTokensToFile = (tokens, folder, fileName) => {
  try {
    const cssContent = convertTokensToCSS(tokens);
    const filePath = path.join(folder, fileName);
    fs.writeFileSync(filePath, cssContent);
  } catch (error) {
    console.error(chalk.red(`\n❌ Error saving CSS file: ${error.message}`));
    throw error;
  }
};

/**
 * Saves tokens as SCSS variables
 * @param {Object} tokens - The tokens data
 * @param {string} folder - The folder path
 * @param {string} fileName - The filename
 */
export const saveSCSSTokensToFile = (tokens, folder, fileName) => {
  try {
    const scssContent = convertTokensToSCSS(tokens);
    const filePath = path.join(folder, fileName);
    fs.writeFileSync(filePath, scssContent);
  } catch (error) {
    console.error(chalk.red(`\n❌ Error saving SCSS file: ${error.message}`));
    throw error;
  }
};

/**
 * Deletes unused format files based on user selections
 * @param {Object} folders - Object with folder paths (tokens, css, scss)
 * @param {Object} formats - Object with format flags (generateRGB, generateRGBA, etc.)
 * @returns {Array} - Array of deleted file paths
 */
export const deleteUnusedFormatFiles = (folders, formats) => {
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
    },
    OKLCH: {
      tokens: "color_tokens_oklch.json",
      css: "color_variables_oklch.css",
      scss: "color_variables_oklch.scss"
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
          try {
            fs.unlinkSync(filePath);
            deletedFiles.push(filePath);
          } catch (error) {
            console.error(chalk.red(`\n❌ Error deleting file ${filePath}: ${error.message}`));
          }
        }
      }
    }
  }

  return deletedFiles;
};

/**
 * Ensures $value appears before $type in token objects
 * @param {Object} obj - Token object to process
 * @returns {Object} - Processed object
 */
export const ensureValueBeforeType = (obj) => {
  if (obj && typeof obj === 'object') {
    if ('$value' in obj && '$type' in obj) {
      const { $value, $type, ...rest } = obj;
      return { $value, $type, ...rest };
    }
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, ensureValueBeforeType(v)])
    );
  }
  return obj;
};

/**
 * Converts color stops to token format
 * @param {Object} colorStops - Object with stop names as keys and hex values
 * @returns {Object} - Token-formatted object with $value and $type
 */
const formatColorStops = (colorStops) => {
  return Object.fromEntries(
    Object.entries(colorStops).map(([k, v]) => [
      k,
      { $value: tinycolor(v).toHexString().toUpperCase(), $type: "color" }
    ])
  );
};

/**
 * Builds the nested path in tokensData and adds color
 * @param {Object} tokensData - The tokens data object to modify
 * @param {Object} config - Configuration object
 * @param {string} config.colorType - 'Global' or 'Semantic'
 * @param {string} config.category - Category (optional)
 * @param {string} config.namingLevel - Naming level (optional)
 * @param {string} config.colorName - Name of the color
 * @param {Object} config.colorStops - Color stops object
 */
export const addColorToTokens = (tokensData, { colorType, category, namingLevel, colorName, colorStops }) => {
  const formattedStops = formatColorStops(colorStops);

  // For non-global types, add directly at root
  if (colorType !== 'Global') {
    tokensData[colorName] = formattedStops;
    return;
  }

  // Build path segments for global colors
  const pathSegments = [category, namingLevel].filter(Boolean);

  // Navigate/create nested structure
  let current = tokensData;
  for (const segment of pathSegments) {
    if (!current[segment]) {
      current[segment] = {};
    }
    current = current[segment];
  }

  // Add color at the final location
  current[colorName] = formattedStops;
};

/**
 * Creates output directories if they don't exist
 * @param {string} baseDir - Base directory path
 * @returns {Object} - Object with folder paths
 */
export const setupOutputDirectories = (baseDir) => {
  const outputsDir = path.join(baseDir, "output_files");
  const tokensFolder = path.join(outputsDir, "tokens/json/color");
  const cssFolder = path.join(outputsDir, "tokens/css/color");
  const scssFolder = path.join(outputsDir, "tokens/scss/color");

  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder, { recursive: true });
  if (!fs.existsSync(scssFolder)) fs.mkdirSync(scssFolder, { recursive: true });

  return { outputsDir, tokensFolder, cssFolder, scssFolder };
};
