/**
 * Display utilities
 * Handles visual output including tables, loaders, and formatted text
 */

import chalk from "chalk";
import Table from "cli-table3";
import { generatePreview } from "./shadowGeneration.js";

/**
 * Shows a loading animation with dots
 * @param {string} message - Loading message to display
 * @param {number} duration - Duration in milliseconds
 * @returns {Promise} Resolves when loading is complete
 */
export const showLoader = (message, duration) => {
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

/**
 * Prints a formatted table of shadows
 * @param {Object} shadows - Shadow tokens object
 */
export const printShadowTable = (shadows) => {
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Type'),
      chalk.cyan('Value')
    ],
    colWidths: [20, 15, 50]
  });

  Object.entries(shadows).forEach(([name, shadow]) => {
    const shadowType = shadow.$value.type === 'innerShadow' ? 'Inner' : 'Outer';
    table.push([
      chalk.yellow(name),
      chalk.green(shadowType),
      chalk.white(generatePreview(shadow.$value))
    ]);
  });

  console.log('\n' + table.toString());
};

/**
 * Prints the output files structure
 * @param {string[]} updatedFiles - Array of updated file paths
 * @param {string[]} savedNewFiles - Array of new file paths
 */
export const printOutputFiles = (updatedFiles, savedNewFiles) => {
  console.log(chalk.whiteBright.bgBlackBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.whiteBright.bgBlackBright("=======================================\n"));

  console.log(chalk.whiteBright("📂 Files are organized in the following folders:"));
  console.log(chalk.whiteBright("   -> /output_files/tokens/json/shadow: JSON Token Files"));
  console.log(chalk.whiteBright("   -> /output_files/tokens/css/shadow: CSS variables"));
  console.log(chalk.whiteBright("   -> /output_files/tokens/scss/shadow: SCSS variables\n"));

  if (updatedFiles.length > 0) {
    console.log(chalk.whiteBright("🆕 Updated:"));
    updatedFiles.forEach(file => console.log(chalk.whiteBright(`   -> ${file}`)));
  }

  if (savedNewFiles.length > 0) {
    console.log(chalk.whiteBright("\n✅ Saved:"));
    savedNewFiles.forEach(file => console.log(chalk.whiteBright(`   -> ${file}`)));
  }
};

