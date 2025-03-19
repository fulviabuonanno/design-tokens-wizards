import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionArg = process.argv.find(arg => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(capitalize(`Clear Files Incantation - version ${version}`)));
}

const outputsDir = path.join(__dirname, '../outputs');

async function clearFolder(dirPath) {
  let count = 0;
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        
        count += await clearFolder(fullPath);
      } else {
        await fs.promises.unlink(fullPath);
        count++;
      }
    }
  } catch (err) {
    console.error(chalk.red(capitalize('❌ Error encountered while attempting to clear folder at ' + dirPath)), err);
  }
  return count;
}

function showLoader(message, ms) {
  let dots = "";
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      dots += ".";
      process.stdout.write(chalk.bold.yellow("\r🚮 Casting cleanup incantation... Please hold" + dots));
    }, 1000);
    setTimeout(() => {
      clearInterval(interval);
      console.log();
      resolve();
    }, ms);
  });
}

async function processOutputs(clearCSS, clearSCSS, clearTokens) {
  
 console.log(chalk.bold.bgGray("\n========================================"));
  console.log(chalk.bold("🧹 STEP 2: PURGING FOLDER CONTENT"));
  console.log(chalk.bold.bgGray("========================================\n"));

  await showLoader("🚮 Summoning arcane cleanup... please stand by", 2000);

  let cssCount = 0, scssCount = 0, tokensCount = 0;
  const cssFolder = path.join(outputsDir, "css");
  const scssFolder = path.join(outputsDir, "scss");
  const tokensFolder = path.join(outputsDir, "tokens");

  if (clearCSS) {
    cssCount = await clearFolder(cssFolder);
  }
  if (clearSCSS) {
    scssCount = await clearFolder(scssFolder);
  }
  if (clearTokens) {
    tokensCount = await clearFolder(tokensFolder);
  }

 console.log(chalk.bold.bgGray("\n========================================"));
  console.log(chalk.bold("🎉 FOLDERS CLEARED SUCCESSFULLY!".toUpperCase()));
  console.log(chalk.bold.bgGray("========================================\n"));

  if (cssCount === 0 && scssCount === 0 && tokensCount === 0) {
    console.log(chalk.bold(capitalize("no files were found for deletion – all folders remain pristine.")));
  } else {
    console.log(chalk.bold(`✅ ${chalk.bold('CSS')} files deleted: ${cssCount} 📄`));
    console.log(chalk.bold(`✅ ${chalk.bold('SCSS')} files deleted: ${scssCount} 📄`));
    console.log(chalk.bold(`✅ ${chalk.bold('TOKENS')} files deleted: ${tokensCount} 📄`));
  }

  console.log(chalk.bold.yellow(("\n🧙 The cleanup incantation has been successfully cast! 🎉\n")));
}

async function startInterface() {

 console.log(chalk.bold.bgGray("\n========================================"));
  console.log(chalk.bold("📝 STEP 1: CHOOSE THE FOLDERS TO CLEAR"));
  console.log(chalk.bold.bgGray("========================================\n"));

  console.log(chalk.whiteBright("🪄Welcome to the ") + chalk.bold.gray("Clear Files Incantation") + chalk.whiteBright(" script! \nLet this spell help you keep your outputs folder tidy during script tests. \nUse this spell only for testing purposes to safely clean up generated files.\n"));

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'clearCSS',
      message: capitalize("🗑️ Do you want to delete " + chalk.bold.red("ALL") + " files from the " + chalk.underline("CSS") + " folder? (yes/no)"),
      default: false,
    },
    {
      type: 'confirm',
      name: 'clearSCSS',
      message: capitalize("🗑️ Do you want to delete " + chalk.bold.red("ALL") + " files from the " + chalk.underline("SCSS") + " folder? (yes/no)"),
      default: false,
    },
    {
      type: 'confirm',
      name: 'clearTokens',
      message: capitalize("🗑️ Do you want to delete " + chalk.bold.red("ALL") + " files from the " + chalk.underline("Tokens") + " folder? (yes/no)"),
      default: false,
    }
  ]);

  await processOutputs(answers.clearCSS, answers.clearSCSS, answers.clearTokens);
}

startInterface();
