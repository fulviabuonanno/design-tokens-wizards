import tinycolor from "tinycolor2";
import chalk from "chalk";
import { VALIDATION_PATTERNS, ERROR_MESSAGES } from "./constants.js";

// Cache for hex color validation results
const hexValidationCache = new Map();

/**
 * Validates a hex color with caching to avoid redundant validations
 * @param {string} input - The HEX color input (with or without #)
 * @returns {boolean} - true if valid, false otherwise
 */
export const isValidHexCached = (input) => {
  if (!input) return false;

  const trimmed = input.trim();

  // Check cache first
  if (hexValidationCache.has(trimmed)) {
    return hexValidationCache.get(trimmed);
  }

  // Validate and cache result
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  const isValid = tinycolor(normalized).isValid();
  hexValidationCache.set(trimmed, isValid);

  return isValid;
};

/**
 * Normalizes a HEX color input to uppercase format with #
 * @param {string} input - The HEX color input (with or without #)
 * @returns {string} - Normalized HEX color (e.g., #FF5733)
 */
export const normalizeHexColor = (input) => {
  const trimmed = input.trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return tinycolor(withHash).toHexString().toUpperCase();
};

/**
 * Validates and normalizes a HEX color input with real-time preview
 * @param {string} input - The HEX color input (with or without #)
 * @returns {boolean|string} - true if valid, error message if invalid
 */
export const validateHexColor = (input) => {
  if (!input || input.trim().length === 0) {
    return ERROR_MESSAGES.EMPTY_HEX;
  }

  // Use cached validation
  if (!isValidHexCached(input)) {
    return ERROR_MESSAGES.INVALID_HEX;
  }

  // Show real-time color preview for valid input
  const normalized = normalizeHexColor(input);
  const preview = chalk.bgHex(normalized).white("  Preview  ");
  console.log(`  ${chalk.gray('Color:')} ${chalk.whiteBright(normalized)} ${preview}`);

  return true;
};

/**
 * Validates a color name to ensure it's unique and follows naming conventions
 * @param {string} input - The color name to validate
 * @param {Object} tokensData - The existing tokens data
 * @param {string} category - The category (if any)
 * @param {string} namingLevel - The naming level (if any)
 * @param {Array} allColors - Array of already collected colors (for batch mode)
 * @returns {boolean|string} - true if valid, error message if invalid
 */
export const validateColorName = (input, tokensData, category, namingLevel, allColors = []) => {
  const trimmedInput = input.trim();

  if (!trimmedInput || trimmedInput.length === 0) {
    return ERROR_MESSAGES.EMPTY_COLOR_NAME;
  }

  if (!trimmedInput.match(VALIDATION_PATTERNS.COLOR_NAME)) {
    return ERROR_MESSAGES.INVALID_COLOR_NAME;
  }

  const checkPath = [];
  if (category) checkPath.push(category);
  if (namingLevel) checkPath.push(namingLevel);

  let currentObj = tokensData;
  for (const segment of checkPath) {
    if (!currentObj[segment]) break;
    currentObj = currentObj[segment];
  }

  if (currentObj && currentObj[trimmedInput]) {
    return ERROR_MESSAGES.DUPLICATE_COLOR_NAME(trimmedInput);
  }

  if (allColors.some(c => c.name === trimmedInput)) {
    return ERROR_MESSAGES.DUPLICATE_BATCH_COLOR(trimmedInput);
  }

  return true;
};

/**
 * Clears the hex validation cache
 * Should be called when starting a new session or to free memory
 */
export const clearHexValidationCache = () => {
  hexValidationCache.clear();
};
