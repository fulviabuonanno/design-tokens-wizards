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

const outputsDir = path.join(__dirname, "..", "..", "output_files");
const finalDir = path.join(__dirname, "..", "..", "output_files", "final");
const tokensFolder = path.join(outputsDir, "tokens/json");
const cssFolder = path.join(outputsDir, "tokens/css");
const scssFolder = path.join(outputsDir, "tokens/scss"); 
const reportsFolder = path.join(outputsDir, "reports");

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

function mergeJSONFilesByToken(files, tokenSubstring) {
  const matchedFiles = files.filter(file => {
    const lowerFile = file.toLowerCase();
    return lowerFile.endsWith('.json') && lowerFile.includes(tokenSubstring);
  });
  return mergeJSONFiles(matchedFiles);
}

// Add helper functions for transforming key naming conventions:
function transformKey(key, caseStyle) {
  const words = key.split(/[\s\-_]+/);
  switch (caseStyle) {
    case "camelCase":
      return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case "kebab-case":
      return words.map(w => w.toLowerCase()).join('-');
    case "snake_case":
      return words.map(w => w.toLowerCase()).join('_');
    case "PascalCase":
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    default:
      return key;
  }
}

function convertKeysNamingCase(obj, caseStyle) {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysNamingCase(item, caseStyle));
  } else if (obj !== null && typeof obj === "object") {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      const newKey = transformKey(key, caseStyle);
      newObj[newKey] = convertKeysNamingCase(obj[key], caseStyle);
    });
    return newObj;
  }
  return obj;
}

// Add helper functions to transform CSS/SCSS variable names
function transformScssVariables(text, namingConvention) {
  // Match variable declarations such as "$foundation-color-fabada-100:"
  return text.replace(/\$([a-z0-9\-\_]+):/gi, (match, p1) => {
    return '$' + transformKey(p1, namingConvention) + ':';
  });
}

function transformCssVariables(text, namingConvention) {
  // Match CSS variable declarations such as "--foundation-color-fabada-100:"
  return text.replace(/--([a-z0-9\-\_]+):/gi, (match, p1) => {
    return '--' + transformKey(p1, namingConvention) + ':';
  });
}

async function mergeOutputs() {
  console.log(chalk.bold.bgGray("\n========================================"));
  console.log(chalk.bold("🪄 STARTING THE MERGING MAGIC"));
  console.log(chalk.bold.bgGray("========================================\n"));

  await showLoader(chalk.bold.yellowBright("🚀 Initiating the spell..."), 1500);
  
  console.log(
    chalk.whiteBright("\n❤️ Greetings, traveler. Are you ready to complete your quest with our aid? \nLet's conjure the") +
    chalk.bold.gray(" Merge Spell") +
    chalk.whiteBright(" that magically transforms your design tokens into \npristine CSS, SCSS, and JSON files for seamless integration.\n")
  );

  const outputFiles = getFilesRecursive(outputsDir);

   function getAvailableOptions(options, tokenType) {
    
    const cssMapping = {
      Colors: 'color_variables',
      Size: 'size_variables',
      Space: 'space_variables',
      "Border Radius": 'border_radius_variables',
      Typography: 'typography_variables'
    };
    
    const tokensMapping = {
      Colors: 'color_',
      Size: 'size_',
      Space: 'space_',
      "Border Radius": 'border_radius_',
      Typography: 'typography_'
    };
    
    const patternCss = cssMapping[tokenType] || '';
    const patternTokens = tokensMapping[tokenType] || '';
    
    return options.filter(option => {
      const suffix = '_' + option.toLowerCase();
      return outputFiles.some(file => {
        const lowerFile = file.toLowerCase();
        const relativePath = path.relative(outputsDir, file).toLowerCase();
        
        if (tokenType === 'Typography') {
          if ((lowerFile.endsWith('.css') || lowerFile.endsWith('.scss')) &&
              relativePath.includes(patternCss)) {
            return true;
          }
          
          if (lowerFile.endsWith('.json') &&
              lowerFile.includes('_tokens') &&
              relativePath.includes(patternTokens)) {
            return true;
          }
          
          return false;
        }
        
        if ((lowerFile.endsWith('.css') || lowerFile.endsWith('.scss')) &&
            lowerFile.includes(suffix) &&
            relativePath.includes(patternCss)) {
          return true;
        }
        
        if (lowerFile.endsWith('.json') &&
            lowerFile.includes('_tokens') &&
            lowerFile.includes(suffix) &&
            relativePath.includes(patternTokens)) {
          return true;
        }
        
        return false;
      });
    });
  }

  const availableColorOptions        = getAvailableOptions(['HEX', 'RGB', 'RGBA', 'HSL'], 'Colors');
  const availableSizeOptions         = getAvailableOptions(['px','rem','em'], 'Size');
  const availableSpaceOptions        = getAvailableOptions(['px','rem','em'], 'Space');
  const availableBorderRadiusOptions = getAvailableOptions(['px','rem'], 'Border Radius');
  const hasTypographyFiles           = outputFiles.some(file => {
    const lowerFile = file.toLowerCase();
    const relativePath = path.relative(outputsDir, file).toLowerCase();
    return lowerFile.includes('typography_') || relativePath.includes('typography_variables');
  });

  const availableTypographyOptions   = getAvailableOptions(['px','rem','em'], 'Typography');

  if (availableColorOptions.length === 0) {
    console.warn(chalk.yellow("⚠️ Warning: No files found with any of the color suffixes (_hex, _rgb, _rgba, _hsl)."));
  }
  if (availableSizeOptions.length === 0) {
    console.warn(chalk.yellow("⚠️ Warning: No files found with any of the size suffixes (_px, _rem, _em)."));
  }
  if (availableSpaceOptions.length === 0) {
    console.warn(chalk.yellow("⚠️ Warning: No files found with any of the space suffixes (_px, _rem, _em)."));
  }
  if (availableBorderRadiusOptions.length === 0) {
    console.warn(chalk.yellow("⚠️ Warning: No files found with any of the border radius suffixes (_px, _rem)."));
  }
  if (availableTypographyOptions.length === 0) {
    console.warn(chalk.yellow("⚠️ Warning: No files found with any of the typography suffixes (_px, _rem, _em)."));
  }

  const availableOptionsDict = {
    Colors: availableColorOptions,
    Size: availableSizeOptions,
    Space: availableSpaceOptions,
    "Border Radius": availableBorderRadiusOptions,
    Typography: hasTypographyFiles ? ['Yes'] : []
  };

  let questions = [];
  if (availableOptionsDict.Colors.length > 0) {
    questions.push({
      type: 'list',
      name: 'colorFormat',
      message: "Which " + chalk.bold.yellowBright("color format") + " would you like to use?",
      choices: availableOptionsDict.Colors,
      default: availableOptionsDict.Colors[0]
    });
  }
  if (availableOptionsDict.Size.length > 0) {
    questions.push({
      type: 'list',
      name: 'sizeUnit',
      message: "Which " + chalk.bold.yellowBright("size unit") + " would you like to use?",
      choices: availableOptionsDict.Size,
      default: availableOptionsDict.Size[0]
    });
  }
  if (availableOptionsDict.Space.length > 0) {
    questions.push({
      type: 'list',
      name: 'spaceUnit',
      message: "Which " + chalk.bold.yellowBright("space unit") + " would you like to use?",
      choices: availableOptionsDict.Space,
      default: availableOptionsDict.Space[0]
    });
  }
  if (availableOptionsDict["Border Radius"].length > 0) {
    questions.push({
      type: 'list',
      name: 'borderRadiusUnit',
      message: "Which " + chalk.bold.yellowBright("border radius unit") + " would you like to use?",
      choices: availableOptionsDict["Border Radius"],
      default: availableOptionsDict["Border Radius"][0]
    });
  }
  if (availableOptionsDict.Typography.length > 0) {
    questions.push({
      type: 'confirm',
      name: 'includeTypography',
      message: "Would you like to include " + chalk.bold.yellowBright("typography tokens") + " in the merge?",
      default: true
    });
  }

  const answersFromPrompt = questions.length > 0 ? await inquirer.prompt(questions) : {};
  
  const answers = {
    colorFormat: answersFromPrompt.colorFormat || "N/A",
    sizeUnit: answersFromPrompt.sizeUnit || "N/A",
    spaceUnit: answersFromPrompt.spaceUnit || "N/A",
    borderRadiusUnit: answersFromPrompt.borderRadiusUnit || "N/A",
    includeTypography: answersFromPrompt.includeTypography || false
  };

  const expectedSuffixes = [];
  if (availableOptionsDict.Colors.length > 0) {
    expectedSuffixes.push("_" + answers.colorFormat.toLowerCase());
  }
  if (availableOptionsDict.Size.length > 0) {
    expectedSuffixes.push("_" + answers.sizeUnit.toLowerCase());
  }
  if (availableOptionsDict.Space.length > 0) {
    expectedSuffixes.push("_" + answers.spaceUnit.toLowerCase());
  }
  if (availableOptionsDict["Border Radius"].length > 0) {
    expectedSuffixes.push("_" + answers.borderRadiusUnit.toLowerCase());
  }
  if (availableOptionsDict.Typography.length > 0 && answers.includeTypography) {
    expectedSuffixes.push("typography");
  }

  console.log(chalk.bold.bgGray("\n========================================"));
  console.log(chalk.bold("🪄 SUMMARY SELECTED FORMATS"));
  console.log(chalk.bold.bgGray("========================================\n"));
  
  const table = new Table({
    head: [chalk.bold.yellow('Token Type'), chalk.bold.yellow('Format/Unit')],
    colWidths: [20, 20]
  });
  const tableRows = [];
  tableRows.push(['Colors', availableOptionsDict.Colors.length > 0 ? answers.colorFormat : "N/A"]);
  tableRows.push(['Size', availableOptionsDict.Size.length > 0 ? answers.sizeUnit : "N/A"]);
  tableRows.push(['Space', availableOptionsDict.Space.length > 0 ? answers.spaceUnit : "N/A"]);
  tableRows.push(['Border Radius', availableOptionsDict["Border Radius"].length > 0 ? answers.borderRadiusUnit : "N/A"]);
  tableRows.push(['Typography', availableOptionsDict.Typography.length > 0 ? (answers.includeTypography ? "Yes" : "No") : "N/A"]);
  table.push(...tableRows);
  console.log(table.toString());

  const cssFiles = outputFiles.filter(file => {
    const lowerName = path.basename(file).toLowerCase();
    return lowerName.endsWith('.css') && expectedSuffixes.some(suffix => lowerName.includes(suffix));
  });
  const scssFiles = outputFiles.filter(file => {
    const lowerName = path.basename(file).toLowerCase();
    return lowerName.endsWith('.scss') && expectedSuffixes.some(suffix => lowerName.includes(suffix));
  });
  const jsonFiles = outputFiles.filter(file => {
    const lowerName = path.basename(file).toLowerCase();
    return lowerName.endsWith('.json') && expectedSuffixes.some(suffix => lowerName.includes(suffix));
  });
  
  // Prompt user for naming case convention only if there are token files to merge
  if (cssFiles.length > 0 || scssFiles.length > 0 || jsonFiles.length > 0) {
    console.log(chalk.bold.bgGray("\n========================================"));
    console.log(chalk.bold("📝 NAMING CASE CONVENTION"));
    console.log(chalk.bold.bgGray("========================================\n"));
    const namingCaseAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'namingCase',
        message: "Select the naming case convention for your tokens:",
        choices: [
          { name: "No change", value: "none" },
          { name: "camelCase", value: "camelCase" },
          { name: "kebab-case", value: "kebab-case" },
          { name: "snake_case", value: "snake_case" },
          { name: "PascalCase", value: "PascalCase" }
        ],
        default: "none"
      }
    ]);
    var namingConvention = namingCaseAnswer.namingCase;
  } else {
    console.log(chalk.yellow("No token files to merge. Skipping naming convention selection."));
    var namingConvention = "none";
  }
  
  let mergedJSONObj = mergeJSONFiles(jsonFiles);
  
  // Write CSS output: transform CSS variables if needed
  if (cssFiles.length > 0) {
    let mergedCSS = mergeTextFiles(cssFiles);
    if (namingConvention !== "none") {
      mergedCSS = transformCssVariables(mergedCSS, namingConvention);
    }
    fs.writeFileSync(path.join(finalDir, 'tokens.css'), mergedCSS, 'utf-8');
  } else {
    console.log(chalk.yellow("No CSS tokens to merge. Skipping tokens.css"));
  }
  
  // Write SCSS output: transform SCSS variable names if needed
  if (scssFiles.length > 0) {
    let mergedSCSS = mergeTextFiles(scssFiles);
    if (namingConvention !== "none") {
      mergedSCSS = transformScssVariables(mergedSCSS, namingConvention);
    }
    fs.writeFileSync(path.join(finalDir, 'tokens.scss'), mergedSCSS, 'utf-8');
  } else {
    console.log(chalk.yellow("No SCSS tokens to merge. Skipping tokens.scss"));
  }
  
  // Write JSON output: use convertKeysNamingCase
  if (jsonFiles.length > 0) {
    let finalJSONObj = (namingConvention !== "none")
      ? convertKeysNamingCase(mergedJSONObj, namingConvention)
      : mergedJSONObj;
    fs.writeFileSync(path.join(finalDir, 'tokens.json'), JSON.stringify(finalJSONObj, null, 2), 'utf-8');
  } else {
    console.log(chalk.yellow("No JSON tokens to merge. Skipping tokens.json"));
  }
  
  // Call loader only if at least one token file was created
  if (cssFiles.length > 0 || scssFiles.length > 0 || jsonFiles.length > 0) {
    await showLoader(chalk.bold.yellowBright("\n🚀 Merging your design tokens..."), 1500);
  }
  
  const mergedColorsJSON        = mergeJSONFilesByToken(outputFiles, 'color_tokens');
  const mergedSizeJSON          = mergeJSONFilesByToken(outputFiles, 'size_tokens');
  const mergedSpaceJSON         = mergeJSONFilesByToken(outputFiles, 'space_tokens');
  const mergedBorderRadiusJSON  = mergeJSONFilesByToken(outputFiles, 'border_radius_tokens');
  
  let mergedTypographyJSON = {};
  if (answers.includeTypography) {
    mergedTypographyJSON = mergeJSONFilesByToken(outputFiles, 'typography_tokens');
  }

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
    if (!fs.existsSync(filePath)) {
      return "🚫 Not Created";
    }
    const stats = fs.statSync(filePath);
    return stats.birthtime.getTime() === stats.mtime.getTime() ? "✅ Saved" : "🆕 Updated";
  }

  console.log(chalk.whiteBright("CSS:  " + getRelative(cssPath) + " " + getStatus(cssPath)));
  console.log(chalk.whiteBright("SCSS: " + getRelative(scssPath) + " " + getStatus(scssPath)));
  console.log(chalk.whiteBright("JSON: " + getRelative(jsonPath) + " " + getStatus(jsonPath)));

  console.log(chalk.bold.bgGreen("\n✅ Files merged successfully in the 'final' folder!\n"));
}

mergeOutputs();