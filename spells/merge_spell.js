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
    // Join files with a single newline.
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
    console.log(chalk.bold("📝 MERGE SPELL: CONFIGURE FORMATS"));
    console.log(chalk.bold.bgGray("========================================\n"));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'colorFormat',
            message: "Which color format would you like to use?",
            choices: ['HEX', 'RGB', 'RGBA', 'HSL'],
            default: 'HEX'
        },
        {
            type: 'list',
            name: 'sizeFormat',
            message: "Which size format would you like to use?",
            choices: ['px', 'rem', 'em'],
            default: 'px'
        },
        {
            type: 'list',
            name: 'spaceFormat',
            message: "Which spacing format would you like to use?",
            choices: ['px', 'rem', 'em'],
            default: 'px'
        },
        {
            type: 'list',
            name: 'borderRadiusFormat',
            message: "Which border radius format would you like to use?",
            choices: ['px', 'rem'],
            default: 'px'
        }
    ]);

    console.log(chalk.green("\n✨ Selected formats:"));
    console.log(chalk.green(`Colors: ${answers.colorFormat}`));
    console.log(chalk.green(`Size: ${answers.sizeFormat}`));
    console.log(chalk.green(`Spacing: ${answers.spaceFormat}`));
    console.log(chalk.green(`Border Radius: ${answers.borderRadiusFormat}\n`));

    // Expected suffixes for tokens based on selected formats.
    const expectedSuffixes = [
        "_" + answers.colorFormat.toLowerCase(),
        "_" + answers.sizeFormat.toLowerCase(),
        "_" + answers.spaceFormat.toLowerCase(),
        "_" + answers.borderRadiusFormat.toLowerCase()
    ];

    // Get all files recursively from the outputs folder.
    const allFiles = getFilesRecursive(outputsDir);

    // Filter files by extension and expected suffix.
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
        console.warn(chalk.yellow("\n⚠️ Warning: No files found in the outputs folder matching the selected formats. Nothing to merge.\n"));
        return;
    }

    // Ensure final directory exists.
    if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
    }

    // Merge and write CSS with proper formatting.
    let mergedCSS = mergeTextFiles(cssFiles);
    // Remove all extra occurrences of ":root {" and any blank lines, and stray closing braces.
    const cssLines = mergedCSS.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith(':root {') && trimmed !== '}';
    });
    // Indent CSS properties.
    const indentedLines = cssLines.map(line => '  ' + line.trim());
    // Build final CSS string with a single closing brace at the end.
    mergedCSS = ':root {\n' + indentedLines.join('\n') + '}';
    fs.writeFileSync(path.join(finalDir, 'tokens.css'), mergedCSS, 'utf-8');

    // Merge and write SCSS without extra spaces between blocks.
    const mergedSCSS = mergeTextFiles(scssFiles);
    fs.writeFileSync(path.join(finalDir, 'tokens.scss'), mergedSCSS, 'utf-8');

    // Merge and write JSON tokens without the _formats field.
    const mergedJSONObj = mergeJSONFiles(jsonFiles);
    fs.writeFileSync(path.join(finalDir, 'tokens.json'), JSON.stringify(mergedJSONObj, null, 2), 'utf-8');

    console.log(chalk.bold.bgGreen("\n✅ Files merged successfully in the 'final' folder!\n"));
}

mergeOutputs();