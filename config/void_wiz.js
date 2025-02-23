import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust the path according to the actual location of your "outputs" folder.
const outputsDir = path.join(__dirname, '../outputs');

// A promise-based function to recursively void (delete all files in) a folder and return a deletion count
async function voidFolder(dirPath) {
  let count = 0;
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        count += await voidFolder(fullPath);
      } else {
        await fs.promises.unlink(fullPath);
        count++;
      }
    }
  } catch (err) {
    console.error(chalk.red(('❌ Error voiding folder ' + dirPath).toUpperCase()), err);
  }
  return count;
}

// Helper function: mini-loader that prints dots during a delay (ms)
// Modified to log the message first
function showLoader(message, ms) {
  return new Promise((resolve) => {
    let dots = "";
    // Print initial message
    process.stdout.write(message.toUpperCase());
    const interval = setInterval(() => {
      dots += ".";
      process.stdout.write("\r" + message.toUpperCase() + " " + dots);
    }, 1000);
    setTimeout(() => {
      clearInterval(interval);
      process.stdout.write("\n");
      resolve();
    }, ms);
  });
}

async function processOutputs(voidCSS, voidSCSS, voidTokens) {
  // HEADER: STEP 2: CLEANING FOLDERS (with emoji)
  console.log(chalk.bold.bgGray("\n======================================"));
  console.log(chalk.bold("🧹 STEP 2: CLEANING FOLDERS"));
  console.log(chalk.bold.bgGray("========================================\n"));

  // Show mini-loader for 3 seconds with updated message
  await showLoader(chalk.bold.yellow("Conjuring vanishing spell, please wait..."), 3000);

  // Initialize deletion counts
  let cssCount = 0, scssCount = 0, tokensCount = 0;

  // Define folder paths based on outputs folder structure
  const cssFolder = path.join(outputsDir, "css");
  const scssFolder = path.join(outputsDir, "scss");
  const tokensFolder = path.join(outputsDir, "tokens");

  // Void files from selected folders
  if (voidCSS) {
    cssCount = await voidFolder(cssFolder);
  }
  if (voidSCSS) {
    scssCount = await voidFolder(scssFolder);
  }
  if (voidTokens) {
    tokensCount = await voidFolder(tokensFolder);
  }

  // HEADER: STEP 3: VOID SUCCESSFUL (with emoji)
  console.log(chalk.bold.bgGray("\n======================================"));
  console.log(chalk.bold("🎉 STEP 3: CLEANING FOLDERS SUCCESSFUL"));
  console.log(chalk.bold.bgGray("========================================\n"));

  if (cssCount === 0 && scssCount === 0 && tokensCount === 0) {
    console.log(chalk.bold("No folders were harmed during the conjuring of this spell.."));
  } else {
    // Show detailed deletion counts with emojis
    console.log(chalk.bold(`✅ ${chalk.bold('CSS')} files deleted: ${cssCount} 📄`));
    console.log(chalk.bold(`✅ ${chalk.bold('SCSS')} files deleted: ${scssCount} 📄`));
    console.log(chalk.bold(`✅ ${chalk.bold('TOKENS')} files deleted: ${tokensCount} 📄`));
  }

  console.log(chalk.bold('\n🧙 Vanishing spell conjured successfully! 🎉\n'));
}

async function startInterface() {
  // HEADER: STEP 1: SELECT FOLDERS TO VOID (with emoji)
  console.log(chalk.bold.bgGray("\n======================================"));
  console.log(chalk.bold("📝 STEP 1: SELECT FOLDERS TO VOID"));
  console.log(chalk.bold.bgGray("========================================\n"));

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'voidCSS',
      message: '🗑️ Do you want to void (delete all files in) the CSS folder? (y/n)',
      default: false,
    },
    {
      type: 'confirm',
      name: 'voidSCSS',
      message: '🗑️ Do you want to void (delete all files in) the SCSS folder? (y/n)',
      default: false,
    },
    {
      type: 'confirm',
      name: 'voidTokens',
      message: '🗑️ Do you want to void (delete all files in) the Tokens folder? (y/n)',
      default: false,
    }
  ]);

  await processOutputs(answers.voidCSS, answers.voidSCSS, answers.voidTokens);
}

startInterface();