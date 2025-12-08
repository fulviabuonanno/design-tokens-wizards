/**
 * File operations utilities
 * Handles saving shadow tokens to various file formats
 */

import fs from "fs";
import path from "path";
import { convertTokensToCSS, convertTokensToSCSS } from "./shadowConversion.js";

/**
 * Sets up output directories for shadow tokens
 * @param {string} baseDir - Base directory path
 * @returns {Object} Directory paths for output files
 */
export const setupOutputDirectories = (baseDir) => {
  const outputsDir = path.join(baseDir, 'output_files');
  const tokensFolder = path.join(outputsDir, 'tokens', 'json', 'shadow');
  const cssFolder = path.join(outputsDir, 'tokens', 'css', 'shadow');
  const scssFolder = path.join(outputsDir, 'tokens', 'scss', 'shadow');

  // Create directories if they don't exist
  [tokensFolder, cssFolder, scssFolder].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  return {
    outputsDir,
    tokensFolder,
    cssFolder,
    scssFolder
  };
};

/**
 * Saves shadow tokens to a JSON file
 * @param {Object} tokens - Shadow tokens object
 * @param {string} folder - Output folder path
 * @param {string} fileName - Output file name
 */
export const saveTokensToFile = (tokens, folder, fileName) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2));
};

/**
 * Saves shadow tokens to a CSS file
 * @param {Object} tokens - Shadow tokens object
 * @param {string} folder - Output folder path
 * @param {string} fileName - Output file name
 */
export const saveCSSTokensToFile = (tokens, folder, fileName) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const filePath = path.join(folder, fileName);
  const css = convertTokensToCSS(tokens);
  fs.writeFileSync(filePath, css);
};

/**
 * Saves shadow tokens to an SCSS file
 * @param {Object} tokens - Shadow tokens object
 * @param {string} folder - Output folder path
 * @param {string} fileName - Output file name
 */
export const saveSCSSTokensToFile = (tokens, folder, fileName) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const filePath = path.join(folder, fileName);
  const scss = convertTokensToSCSS(tokens);
  fs.writeFileSync(filePath, scss);
};
