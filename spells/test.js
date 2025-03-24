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
    chalk.whiteBright(" that magically transforms your design tokens into \npristine CSS, SCSS, and JSON files for seamless integration.\n")
  );

  const outputFiles = getFilesRecursive(outputsDir);

  // Función para determinar las opciones disponibles escaneando los archivos de output.
  function getAvailableOptions(options) {
    return options.filter(option => {
      const suffix = '_' + option.toLowerCase();
      return outputFiles.some(file =>
        path.basename(file).toLowerCase().includes(suffix)
      );
    });
  }

  const availableColorOptions        = getAvailableOptions(['HEX', 'RGB', 'RGBA', 'HSL']);
  const availableSizeOptions         = getAvailableOptions(['px','rem','em']);
  const availableSpaceOptions        = getAvailableOptions(['px','rem','em']);
  const availableBorderRadiusOptions = getAvailableOptions(['px','rem']);

  // Mostrar warnings si no se encuentran archivos para un token.
  if (availableColorOptions.length === 0) {
    console.warn(chalk.yellow("⚠️ Warning: No files found with any of the color suffixes (_hex, _rgb, _rgba, _hsl)."));
  }
  if (availableSizeOptions.length === 0) {
    console.warn(chalk.yellow("⚠️ Warning: No files found with any of the size suffixes (_px, _rem, _em)."));
  }
  if (availableSpaceOptions.length === 0) {
    console.warn(chalk.yellow("⚠️ Warning: No files found with any of the spacing suffixes (_px, _rem, _em)."));
  }
  if (availableBorderRadiusOptions.length === 0) {
    console.warn(chalk.yellow("⚠️ Warning: No files found with any of the border radius suffixes (_px, _rem)."));
  }


  // Diccionario con las opciones disponibles.
  const availableOptionsDict = {
    Colors: availableColorOptions,
    Size: availableSizeOptions,
    Spacing: availableSpaceOptions,
    "Border Radius": availableBorderRadiusOptions
  };

  // Construir la lista de preguntas solo para los token types con archivos disponibles.
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
  if (availableOptionsDict.Spacing.length > 0) {
    questions.push({
      type: 'list',
      name: 'spaceUnit',
      message: "Which " + chalk.bold.yellowBright("spacing unit") + " would you like to use?",
      choices: availableOptionsDict.Spacing,
      default: availableOptionsDict.Spacing[0]
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

  const answersFromPrompt = questions.length > 0 ? await inquirer.prompt(questions) : {};
  // Asignar un valor por defecto ("N/A") si no hay respuesta.
  const answers = {
    colorFormat: answersFromPrompt.colorFormat || "N/A",
    sizeUnit: answersFromPrompt.sizeUnit || "N/A",
    spaceUnit: answersFromPrompt.spaceUnit || "N/A",
    borderRadiusUnit: answersFromPrompt.borderRadiusUnit || "N/A"
  };

  // A partir de la selección del usuario se construye el array de sufijos requeridos.
  const expectedSuffixes = [];
  if (availableOptionsDict.Colors.length > 0) {
    expectedSuffixes.push("_" + answers.colorFormat.toLowerCase());
  }
  if (availableOptionsDict.Size.length > 0) {
    expectedSuffixes.push("_" + answers.sizeUnit.toLowerCase());
  }
  if (availableOptionsDict.Spacing.length > 0) {
    expectedSuffixes.push("_" + answers.spaceUnit.toLowerCase());
  }
  if (availableOptionsDict["Border Radius"].length > 0) {
    expectedSuffixes.push("_" + answers.borderRadiusUnit.toLowerCase());
  }

  // Animación y resumen de la selección.
  await showLoader(chalk.bold.yellowBright("\n🚀 Merging your design tokens..."), 1500);

  console.log(chalk.bold.bgGray("\n========================================"));
  console.log(chalk.bold("🪄 SUMMARY SELECTED FORMATS"));
  console.log(chalk.bold.bgGray("========================================\n"));

  const table = new Table({
    head: [chalk.bold.yellow('Token Type'), chalk.bold.yellow('Format/Unit')],
    colWidths: [20, 20]
  });
  const tableRows = [];
  if (availableOptionsDict.Colors.length > 0) {
    tableRows.push(['Colors', answers.colorFormat]);
  }
  if (availableOptionsDict.Size.length > 0) {
    tableRows.push(['Size', answers.sizeUnit]);
  }
  if (availableOptionsDict.Spacing.length > 0) {
    tableRows.push(['Spacing', answers.spaceUnit]);
  }
  if (availableOptionsDict["Border Radius"].length > 0) {
    tableRows.push(['Border Radius', answers.borderRadiusUnit]);
  }
  table.push(...tableRows);
  console.log(table.toString());

  // Filtrar los archivos a unir de acuerdo a la selección del usuario.
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

  if (cssFiles.length === 0 && scssFiles.length === 0 && jsonFiles.length === 0) {
    console.warn(chalk.bold.black.bgYellow("\n⚠️ Warning: No files found matching the selected formats. Nothing to merge.\n"));
    return;
  }

  if (!fs.existsSync(finalDir)) {
    fs.mkdirSync(finalDir, { recursive: true });
  }

  // Unir archivos CSS
  let mergedCSS = mergeTextFiles(cssFiles);
  const cssLines = mergedCSS.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith(':root {') && trimmed !== '}';
  });
  const indentedLines = cssLines.map(line => '  ' + line.trim());
  mergedCSS = ':root {\n' + indentedLines.join('\n') + '}';
  fs.writeFileSync(path.join(finalDir, 'tokens.css'), mergedCSS, 'utf-8');

  // Unir archivos SCSS
  const mergedSCSS = mergeTextFiles(scssFiles);
  fs.writeFileSync(path.join(finalDir, 'tokens.scss'), mergedSCSS, 'utf-8');

  // Unir archivos JSON
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