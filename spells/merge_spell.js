import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import Table from 'cli-table3';

const versionArg = process.argv.find(arg => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(capitalize(`Merge Files Incantation - version ${version}`)));
}

async function showLoader(message, duration) {
  console.log(message);
  return new Promise(resolve => setTimeout(resolve, duration));
}

function capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputsDir = path.join(__dirname, '../outputs');
const finalDir = path.join(__dirname, '../final');

/**
 * Recursively get all file paths inside a directory.
 */
function getFilesRecursive(dirPath) {
    let fileList = [];
    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                fileList = fileList.concat(getFilesRecursive(fullPath));
            } else if (entry.isFile()) {
                fileList.push(fullPath);
            }
        }
    } catch (err) {
        console.error(chalk.red(capitalize(`❌ Error reading directory at ${dirPath}`)), err);
    }
    return fileList;
}

/**
 * Merge the content of text files provided in filePaths.
 * This version trims each file's content and joins them with a single newline,
 * ensuring no extra blank lines between blocks.
 */
function mergeTextFiles(filePaths) {
    const contents = filePaths.map(filePath => {
        try {
            return fs.readFileSync(filePath, 'utf-8').trim();
        } catch (err) {
            console.error(chalk.red(capitalize(`❌ Error reading file ${filePath}`)), err);
            return "";
        }
    });
    
    return contents.join('\n');
}

/**
 * Merge JSON files provided in filePaths.
 */
function mergeJSONFiles(filePaths) {
    let mergedObject = {};
    filePaths.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const json = JSON.parse(content);
            mergedObject = { ...mergedObject, ...json };
        } catch (err) {
            console.error(chalk.red(capitalize(`❌ Error processing JSON file ${filePath}`)), err);
        }
    });
    return mergedObject;
}

async function mergeOutputs() {
    console.log(chalk.bold.bgGray("\n========================================"));
    console.log(chalk.bold("🪄 STARTING THE MERGING MAGIC"));
    console.log(chalk.bold.bgGray("========================================\n"));

    await showLoader(chalk.bold.yellowBright("🚀 Initiating the spell..."), 1500);
    
    console.log(
      chalk.whiteBright("\n❤️ Greetings, traveler. Are you ready to complete your quest with our aid? \nLet’s conjure the") +
      chalk.bold.gray(" Merge Spell") +
      chalk.whiteBright("that magically transforms your design tokens into \npristine CSS, SCSS, and JSON files for seamless integration.\n")
    );

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'colorFormat',
            message: "Which " + chalk.bold.yellowBright("color format") + " would you like to use?",
            choices: ['HEX', 'RGB', 'RGBA', 'HSL'],
            default: 'HEX'
        },
        {
            type: 'list',
            name: 'sizeUnit',
            message: "Which " + chalk.bold.yellowBright("size unit") + " would you like to use?",
            choices: ['px', 'rem', 'em'],
            default: 'px'
        },
        {
            type: 'list',
            name: 'spaceUnit',
            message: "Which " + chalk.bold.yellowBright("spacing unit") + " would you like to use?",
            choices: ['px', 'rem', 'em'],
            default: 'px'
        },
        {
            type: 'list',
            name: 'borderRadiusUnit',
            message: "Which " + chalk.bold.yellowBright("border radius unit") + " would you like to use?",
            choices: ['px', 'rem'],
            default: 'px'
        }
    ]);

    await showLoader(chalk.bold.yellowBright("\n🚀 Merging your design tokens..."), 1500);

    console.log(chalk.bold.bgGray("\n========================================"));
    console.log(chalk.bold("🪄 SUMMARY SELECTED FORMATS"));
    console.log(chalk.bold.bgGray("========================================\n"));
   
    const table = new Table({
      head: [chalk.bold.yellow('Token Type'), chalk.bold.yellow('Format/Unit')],
      colWidths: [20, 20]
    });

    table.push(
      ['Colors', answers.colorFormat],
      ['Size', answers.sizeUnit],
      ['Spacing', answers.spaceUnit],
      ['Border Radius', answers.borderRadiusUnit]
    );

    console.log(table.toString());

    const expectedSuffixes = [
        "_" + answers.colorFormat.toLowerCase(),
        "_" + answers.sizeUnit.toLowerCase(),
        "_" + answers.spaceUnit.toLowerCase(),
        "_" + answers.borderRadiusUnit.toLowerCase()
    ];

    const allFiles = getFilesRecursive(outputsDir);

    const cssFiles = allFiles.filter(file => {
        const lowerName = path.basename(file).toLowerCase();
        return lowerName.endsWith('.css') && expectedSuffixes.some(suffix => lowerName.includes(suffix));
    });
    const scssFiles = allFiles.filter(file => {
        const lowerName = path.basename(file).toLowerCase();
        return lowerName.endsWith('.scss') && expectedSuffixes.some(suffix => lowerName.includes(suffix));
    });
    const jsonFiles = allFiles.filter(file => {
        const lowerName = path.basename(file).toLowerCase();
        return lowerName.endsWith('.json') && expectedSuffixes.some(suffix => lowerName.includes(suffix));
    });

    const noFilesFound =
        cssFiles.length === 0 && scssFiles.length === 0 && jsonFiles.length === 0;
    if (noFilesFound) {
        console.warn(chalk.bold.yellow("\n⚠️ Warning: No files found in the outputs folder matching the selected formats. Nothing to merge.\n"));
        return;
    }

    if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
    }

    let mergedCSS = mergeTextFiles(cssFiles);
    
    const cssLines = mergedCSS.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith(':root {') && trimmed !== '}';
    });
    
    const indentedLines = cssLines.map(line => '  ' + line.trim());
    
    mergedCSS = ':root {\n' + indentedLines.join('\n') + '}';
    fs.writeFileSync(path.join(finalDir, 'tokens.css'), mergedCSS, 'utf-8');

    const mergedSCSS = mergeTextFiles(scssFiles);
    fs.writeFileSync(path.join(finalDir, 'tokens.scss'), mergedSCSS, 'utf-8');

    const mergedJSONObj = mergeJSONFiles(jsonFiles);
    fs.writeFileSync(path.join(finalDir, 'tokens.json'), JSON.stringify(mergedJSONObj, null, 2), 'utf-8');

    console.log(chalk.bold.bgGray("\n========================================"));
    console.log(chalk.bold("✅ FINAL OUTPUT FILES"));
    console.log(chalk.bold.bgGray("========================================\n"));

    const cssPath = path.join(finalDir, 'tokens.css');
    const scssPath = path.join(finalDir, 'tokens.scss');
    const jsonPath = path.join(finalDir, 'tokens.json');

    function getRelative(filePath) {
      return path.relative(process.cwd(), filePath);
    }

    function getStatus(filePath) {
      const stats = fs.statSync(filePath);
      return stats.birthtime.getTime() === stats.mtime.getTime() ? "✅ Saved" : "🆕 Updated";
    }

    console.log(chalk.whiteBright("CSS:  " + getRelative(cssPath) + " " + getStatus(cssPath)));
    console.log(chalk.whiteBright("SCSS: " + getRelative(scssPath) + " " + getStatus(scssPath)));
    console.log(chalk.whiteBright("JSON: " + getRelative(jsonPath) + " " + getStatus(jsonPath)));

    console.log(chalk.bold.bgGreen("\n✅ Files merged successfully in the 'final' folder!\n"));
} 

mergeOutputs();
