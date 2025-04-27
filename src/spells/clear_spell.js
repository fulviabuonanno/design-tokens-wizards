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

const outputsDir = path.join(__dirname, "..", "..", "output_files");
const finalDir = path.join(outputsDir, "final");
const jsonFolder = path.join(outputsDir, "tokens/json");
const cssFolder = path.join(outputsDir, "tokens/css");
const scssFolder = path.join(outputsDir, "tokens/scss"); 
// const reportsDir = path.join(outputsDir, "reports");

async function clearFolder(dirPath) {
  let fileCount = 0;
  let folderCount = 0;
  let errors = [];
  
  try {
    if (!fs.existsSync(dirPath)) {
      return { fileCount, folderCount };
    }

    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    if (entries.length === 0) {
      return { fileCount, folderCount };
    }
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      try {
        if (entry.isDirectory()) {
          const subCounts = await clearFolder(fullPath);
          fileCount += subCounts.fileCount;
          folderCount += subCounts.folderCount + 1; 
          await fs.promises.rmdir(fullPath);
        } else {
          await fs.promises.unlink(fullPath);
          fileCount++;
        }
      } catch (err) {
        errors.push({ path: fullPath, error: err.message });
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(chalk.red(`❌ Error clearing folder: ${err.message}`));
    }
  }
  
  return { fileCount, folderCount };
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

async function processOutputs(clearCSS, clearSCSS, clearJSON, clearFinal, clearReports) {
  console.log(chalk.bold.bgGray("\n========================================"));
  console.log(chalk.bold("🧹 STEP 2: PURGING FOLDER CONTENT"));
  console.log(chalk.bold.bgGray("========================================\n"));

  await showLoader(chalk.bold.yellowBright("🚀  Channeling the mystical forces of organization"), 1500);

  let cssCount = { fileCount: 0, folderCount: 0 };
  let scssCount = { fileCount: 0, folderCount: 0 };
  let jsonCount = { fileCount: 0, folderCount: 0 };
  let finalCount = { fileCount: 0 };
  // let reportsCount = { fileCount: 0 };

  const tasks = [];
  if (clearCSS) tasks.push({ name: 'CSS', folder: cssFolder, count: () => cssCount });
  if (clearSCSS) tasks.push({ name: 'SCSS', folder: scssFolder, count: () => scssCount });
  if (clearJSON) tasks.push({ name: 'JSON', folder: jsonFolder, count: () => jsonCount });
  if (clearFinal) tasks.push({ name: 'Final', folder: finalDir, count: () => finalCount });
  // if (clearReports) tasks.push({ name: 'Reports', folder: reportsDir, count: () => reportsCount });

  console.log(chalk.blue("\n📋 Selected folders for cleanup:"));
  tasks.forEach(task => {
    const relativePath = path.relative(process.cwd(), task.folder);
    console.log(chalk.blue(`  - ${task.name}: ${relativePath}`));
  });

  for (const task of tasks) {
    const result = await clearFolder(task.folder);
    if (task.name === 'CSS') {
      cssCount = result;
    } else if (task.name === 'SCSS') {
      scssCount = result;
    } else if (task.name === 'JSON') {
      jsonCount = result;
    } else if (task.name === 'Final') {
      finalCount = result;
    // } else if (task.name === 'Reports') {
    //   reportsCount = result;
    }
  }

  console.log(chalk.bold.bgGray("\n========================================"));
  console.log(chalk.bold("🎉 FOLDERS CLEARED SUCCESSFULLY!".toUpperCase()));
  console.log(chalk.bold.bgGray("========================================\n"));

  const totalFiles = cssCount.fileCount + scssCount.fileCount + jsonCount.fileCount + finalCount.fileCount;
  const totalFolders = cssCount.folderCount + scssCount.folderCount + jsonCount.folderCount;

  if (totalFiles === 0 && totalFolders === 0) {
    console.log(chalk.bold(capitalize("no files or folders were found for deletion – all folders remain pristine.")));
  } else {
    if (clearCSS) console.log(chalk.bold(`✅ ${chalk.bold('CSS')}: ${cssCount.fileCount} files, ${cssCount.folderCount} folders 📄`));
    if (clearSCSS) console.log(chalk.bold(`✅ ${chalk.bold('SCSS')}: ${scssCount.fileCount} files, ${scssCount.folderCount} folders 📄`));
    if (clearJSON) console.log(chalk.bold(`✅ ${chalk.bold('JSON')}: ${jsonCount.fileCount} files, ${jsonCount.folderCount} folders 📄`));
    if (clearFinal) console.log(chalk.bold(`✅ ${chalk.bold('FINAL')}: ${finalCount.fileCount} files`));
    // if (clearReports) console.log(chalk.bold(`✅ ${chalk.bold('REPORTS')}: ${reportsCount.fileCount} files`));
    console.log(chalk.bold(`\n📊 Total: ${totalFiles} files, ${totalFolders} folders 📄`));
  }

  console.log(chalk.bold.yellow("\n🧙 The cleanup incantation has been successfully cast! 🎉\n"));
}

async function startInterface() {
  console.log(chalk.bold.bgGray("\n========================================"));
  console.log(chalk.bold("🧹 STARTING THE CLEANUP MAGIC"));
  console.log(chalk.bold.bgGray("========================================\n"));

  await showLoader(chalk.bold.yellowBright("🚀 Preparing to cast the cleanup spell"), 1500);

  console.log(chalk.whiteBright("🪄Welcome to the ") +
    chalk.bold.gray("Clear Files Incantation") +
    chalk.whiteBright(" script! \nLet this spell help you keep your outputs folder tidy during script tests. \n") + chalk.bold.yellow("⚠️ Use this spell only for testing purposes to safely clean up generated files.\n")
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
      name: 'clearJSON',
      message: capitalize("🗑️ Do you want to delete " + chalk.bold.red("ALL") + " files from the " + chalk.underline("JSON") + " folder? (yes/no)"),
      default: false,
    },
    {
      type: 'confirm',
      name: 'clearFinal',
      message: capitalize("🗑️ Do you want to delete " + chalk.bold.red("ALL") + " files from the " + chalk.underline("Final") + " folder? (yes/no)"),
      default: false,
    },
    // {
    //   type: 'confirm',
    //   name: 'clearReports',
    //   message: capitalize("🗑️ Do you want to delete " + chalk.bold.red("ALL") + " files from the " + chalk.underline("Reports") + " folder? (yes/no)"),
    //   default: false,
    // }
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

  await processOutputs(answers.clearCSS, answers.clearSCSS, answers.clearJSON, answers.clearFinal, answers.clearReports);
}

startInterface();