import tinycolor from "tinycolor2";
import { useOklchConverter } from "@builtwithjavascript/oklch-converter";

const oklchConverter = useOklchConverter();

// Semantic ordering for color stops
const semanticOrder = [
  "ultra-dark", "darkest", "darker", "dark",
  "semi-dark", "base", "semi-light", "light",
  "lighter", "lightest", "ultra-light"
];

/**
 * Converts tokens to a different color format (RGB, RGBA, HSL, OKLCH)
 * @param {Object} tokens - The tokens data
 * @param {string} format - The target format ('RGB', 'RGBA', 'HSL', 'OKLCH')
 * @returns {Object} - Converted tokens
 */
export const convertTokensToFormat = (tokens, format) => {
  const converted = JSON.parse(JSON.stringify(tokens));
  const convertRecursive = (obj) => {
    for (const key in obj) {
      const value = obj[key];
      // Cache type check
      if (value && typeof value === "object") {
        // Check if this is a token with $value
        const hasValue = "$value" in value;

        if (hasValue) {
          const { $value, $type, ...rest } = value;
          if (format === "RGB") {
            obj[key] = { $value: tinycolor($value).toRgbString(), $type, ...rest };
          } else if (format === "RGBA") {
            const rgba = tinycolor($value).toRgb();
            obj[key] = { $value: `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`, $type, ...rest };
          } else if (format === "HSL") {
            obj[key] = { $value: tinycolor($value).toHslString(), $type, ...rest };
          } else if (format === "OKLCH") {
            obj[key] = { $value: oklchConverter.hexToOklchString($value), $type, ...rest };
          }
        } else {
          // Recurse into nested objects
          convertRecursive(value);
        }
      }
    }
  };
  convertRecursive(converted);
  return converted;
};

/**
 * Sorts object keys based on semantic order or numeric values
 * @param {Object} obj - Object to sort keys from
 * @returns {Array} - Sorted array of keys
 */
const sortKeys = (obj) => {
  let keys = Object.keys(obj);
  if (keys.length === 0) return keys;

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

  return keys;
};

/**
 * Converts tokens to CSS custom properties format
 * @param {Object} tokens - The tokens data
 * @returns {string} - CSS variables as string
 */
export const convertTokensToCSS = (tokens) => {
  let cssVariables = ":root {\n";
  const processTokens = (obj, prefix = "") => {
    const keys = sortKeys(obj);
    for (const key of keys) {
      const value = obj[key];
      // Cache type and property checks
      if (value && typeof value === "object") {
        if ("$value" in value) {
          cssVariables += `  --${prefix}${key}: ${value.$value};\n`;
        } else {
          processTokens(value, `${prefix}${key}-`);
        }
      }
    }
  };
  processTokens(tokens);
  cssVariables += "}";
  return cssVariables;
};

/**
 * Converts tokens to SCSS variables format
 * @param {Object} tokens - The tokens data
 * @returns {string} - SCSS variables as string
 */
export const convertTokensToSCSS = (tokens) => {
  let scssVariables = "";
  const processTokens = (obj, prefix = "") => {
    const keys = sortKeys(obj);
    for (const key of keys) {
      const value = obj[key];
      // Cache type and property checks
      if (value && typeof value === "object") {
        if ("$value" in value) {
          scssVariables += `$${prefix}${key}: ${value.$value};\n`;
        } else {
          processTokens(value, `${prefix}${key}-`);
        }
      }
    }
  };
  processTokens(tokens);
  return scssVariables;
};
