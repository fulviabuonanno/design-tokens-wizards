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
const finalDir = path.join(__dirname, '../final');
const reportsDir = path.join(__dirname, '../reports');

async function clearFolder(dirPath) {
  let count = 0;
  let errors = [];
  
  try {
    // Check if directory exists
    if (!fs.existsSync(dirPath)) {
      const relativePath = path.relative(process.cwd(), dirPath);
      console.log(chalk.yellow(`⚠️ Directory does not exist: ${relativePath}`));
      return count;
    }

    const relativePath = path.relative(process.cwd(), dirPath);
    console.log(chalk.blue(`🔍 Scanning directory: ${relativePath}`));
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    if (entries.length === 0) {
      console.log(chalk.yellow(`ℹ️ Directory is empty: ${relativePath}`));
      return count;
    }

    console.log(chalk.blue(`📂 Found ${entries.length} items in ${relativePath}`));
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativeEntryPath = path.relative(process.cwd(), fullPath);
      try {
        if (entry.isDirectory()) {
          console.log(chalk.cyan(`📁 Processing subdirectory: ${path.relative(dirPath, fullPath)}`));
          count += await clearFolder(fullPath);
          // Remove empty directory after clearing its contents
          await fs.promises.rmdir(fullPath);
          console.log(chalk.green(`✅ Removed directory: ${path.relative(dirPath, fullPath)}`));
        } else {
          console.log(chalk.cyan(`📄 Processing file: ${path.relative(dirPath, fullPath)}`));
          await fs.promises.unlink(fullPath);
          count++;
          console.log(chalk.green(`✅ Deleted file: ${path.relative(dirPath, fullPath)}`));
        }
      } catch (err) {
        console.log(chalk.red(`❌ Error processing ${path.relative(dirPath, fullPath)}: ${err.message}`));
        errors.push({ path: relativeEntryPath, error: err.message });
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      const relativePath = path.relative(process.cwd(), dirPath);
      console.error(chalk.red(capitalize('❌ Error encountered while attempting to clear folder at ' + relativePath)), err);
    }
  }
  
  if (errors.length > 0) {
    console.log(chalk.yellow('\n⚠️ Some files could not be deleted:'));
    errors.forEach(({ path, error }) => {
      console.log(chalk.yellow(`  - ${path}: ${error}`));
    });
  }
  
  return count;
}

function showLoader(message, ms) {
  let dots = "";
  let spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let spinnerIndex = 0;
  
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      dots = dots.length >= 3 ? "" : dots + ".";
      spinnerIndex = (spinnerIndex + 1) % spinner.length;
      process.stdout.write(chalk.bold.yellow(`\r${spinner[spinnerIndex]} ${message}${dots} `));
    }, 100);
    
    setTimeout(() => {
      clearInterval(interval);
      process.stdout.write('\r' + ' '.repeat(process.stdout.columns) + '\r');
      resolve();
    }, ms);
  });
}

async function processOutputs(clearCSS, clearSCSS, clearTokens, clearFinal, clearReports) {
  console.log(chalk.bold.bgGray("\n========================================"));
  console.log(chalk.bold("🧹 STEP 2: PURGING FOLDER CONTENT"));
  console.log(chalk.bold.bgGray("========================================\n"));

  await showLoader("🚮 Summoning arcane cleanup... please stand by", 2000);

  let cssCount = 0, scssCount = 0, tokensCount = 0, finalCount = 0, reportsCount = 0;
  const cssFolder = path.join(outputsDir, "css");
  const scssFolder = path.join(outputsDir, "scss");
  const tokensFolder = path.join(outputsDir, "tokens");

  const tasks = [];
  if (clearCSS) tasks.push({ name: 'CSS', folder: cssFolder, count: () => cssCount });
  if (clearSCSS) tasks.push({ name: 'SCSS', folder: scssFolder, count: () => scssCount });
  if (clearTokens) tasks.push({ name: 'Tokens', folder: tokensFolder, count: () => tokensCount });
  if (clearFinal) tasks.push({ name: 'Final', folder: finalDir, count: () => finalCount });
  if (clearReports) tasks.push({ name: 'Reports', folder: reportsDir, count: () => reportsCount });

  console.log(chalk.blue("\n📋 Selected folders for cleanup:"));
  tasks.forEach(task => {
    const relativePath = path.relative(process.cwd(), task.folder);
    console.log(chalk.blue(`  - ${task.name}: ${relativePath}`));
  });

  for (const task of tasks) {
    console.log(chalk.bold(`\n🔄 Processing ${task.name} folder...`));
    task.count = await clearFolder(task.folder);
  }

  console.log(chalk.bold.bgGray("\n========================================"));
  console.log(chalk.bold("🎉 FOLDERS CLEARED SUCCESSFULLY!".toUpperCase()));
  console.log(chalk.bold.bgGray("========================================\n"));

  const totalFiles = cssCount + scssCount + tokensCount + finalCount + reportsCount;
  if (totalFiles === 0) {
    console.log(chalk.bold(capitalize("no files were found for deletion – all folders remain pristine.")));
  } else {
    if (clearCSS) console.log(chalk.bold(`✅ ${chalk.bold('CSS')} files deleted: ${cssCount} 📄`));
    if (clearSCSS) console.log(chalk.bold(`✅ ${chalk.bold('SCSS')} files deleted: ${scssCount} 📄`));
    if (clearTokens) console.log(chalk.bold(`✅ ${chalk.bold('TOKENS')} files deleted: ${tokensCount} 📄`));
    if (clearFinal) console.log(chalk.bold(`✅ ${chalk.bold('FINAL')} files deleted: ${finalCount} 📄`));
    if (clearReports) console.log(chalk.bold(`✅ ${chalk.bold('REPORTS')} files deleted: ${reportsCount} 📄`));
    console.log(chalk.bold(`\n📊 Total files deleted: ${totalFiles} 📄`));
  }

  console.log(chalk.bold.yellow("\n🧙 The cleanup incantation has been successfully cast! 🎉\n"));
}

async function startInterface() {
  console.log(chalk.bold.bgGray("\n========================================"));
  console.log(chalk.bold("📝 STEP 1: CHOOSE THE FOLDERS TO CLEAR"));
  console.log(chalk.bold.bgGray("========================================\n"));

  console.log(chalk.whiteBright("🪄Welcome to the ") +
    chalk.bold.gray("Clear Files Incantation") +
    chalk.whiteBright(" script! \nLet this spell help you keep your outputs folder tidy during script tests. \nUse this spell only for testing purposes to safely clean up generated files.\n")
  );

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
    },
    {
      type: 'confirm',
      name: 'clearFinal',
      message: capitalize("🗑️ Do you want to delete " + chalk.bold.red("ALL") + " files from the " + chalk.underline("Final") + " folder? (yes/no)"),
      default: false,
    },
    {
      type: 'confirm',
      name: 'clearReports',
      message: capitalize("🗑️ Do you want to delete " + chalk.bold.red("ALL") + " files from the " + chalk.underline("Reports") + " folder? (yes/no)"),
      default: false,
    }
  ]);

  if (!Object.values(answers).some(value => value === true)) {
    console.log(chalk.yellow("\n⚠️ No folders were selected for cleanup. The spell has been cancelled.\n"));
    return;
  }

  const confirm = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.bold.red("⚠️ Are you sure you want to proceed with the deletion? This action cannot be undone!"),
      default: false,
    }
  ]);

  if (!confirm.confirm) {
    console.log(chalk.yellow("\n⚠️ The spell has been cancelled. No files were deleted.\n"));
    return;
  }

  await processOutputs(answers.clearCSS, answers.clearSCSS, answers.clearTokens, answers.clearFinal, answers.clearReports);
}

startInterface();