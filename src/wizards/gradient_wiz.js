import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import chalk from "chalk";
import Table from "cli-table3";
import tinycolor from "tinycolor2";

const versionArg = process.argv.find((arg) => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Gradient Tokens Wizard - Version ${version}`));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const showLoader = (message, duration) => {
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

const printGradientTable = (gradients) => {
  const table = new Table({
    head: [
      chalk.bold.yellowBright("Name"),
      chalk.bold.yellowBright("Type"),
      chalk.bold.yellowBright("Colors"),
      chalk.bold.yellowBright("Preview")
    ],
    style: { head: [], border: ["yellow"] }
  });

  Object.entries(gradients).forEach(([name, gradient]) => {
    const colorBlocks = gradient.colors.map(color => 
      chalk.bgHex(color)("  ".repeat(5))
    ).join("→");
    
    table.push([
      name,
      gradient.type,
      gradient.colors.join(" → "),
      colorBlocks
    ]);
  });

  return table.toString();
};

const printDetailedGradientPreview = (gradient) => {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎨 DETAILED GRADIENT PREVIEW"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  console.log(chalk.bold("Name: ") + chalk.whiteBright(gradient.name));
  console.log(chalk.bold("Type: ") + chalk.whiteBright(gradient.type));
  console.log(chalk.bold("CSS Value: ") + chalk.whiteBright(generateGradientCSS(gradient)));
  console.log("\n" + chalk.bold("Colors:"));
  
  gradient.colors.forEach((color, index) => {
    const colorSample = chalk.bgHex(color)("  ".repeat(10));
    const colorInfo = tinycolor(color);
    console.log(`\n${chalk.bold(`Stop ${index + 1}:`)}`);
    console.log(`  HEX: ${color}`);
    console.log(`  RGB: ${colorInfo.toRgbString()}`);
    console.log(`  HSL: ${colorInfo.toHslString()}`);
    console.log(`  Sample: ${colorSample}`);
  });

  console.log("\n" + chalk.bold("Gradient Preview:"));
  const previewWidth = 40;
  const colorBlockWidth = Math.floor(previewWidth / gradient.colors.length);
  
  const colorBlocks = gradient.colors.map(color => 
    chalk.bgHex(color)("  ".repeat(colorBlockWidth))
  ).join("");
  
  for (let i = 0; i < 5; i++) {
    console.log(colorBlocks);
  }
  console.log("\n");
};

const askForInput = async () => {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎨 STEP 1: GRADIENT TYPE"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  const { gradientType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'gradientType',
      message: 'Select the type of gradient you want to create:',
      choices: [
        { name: 'Linear Gradient', value: 'linear' },
        { name: 'Radial Gradient', value: 'radial' },
        { name: 'Conic Gradient', value: 'conic' }
      ]
    }
  ]);

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎨 STEP 2: GRADIENT COLORS"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  const { colorCount } = await inquirer.prompt([
    {
      type: 'number',
      name: 'colorCount',
      message: 'How many colors do you want in your gradient?',
      default: 2,
      min: 2,
      max: 5
    }
  ]);

  const colors = [];
  for (let i = 0; i < colorCount; i++) {
    const { color } = await inquirer.prompt([
      {
        type: 'input',
        name: 'color',
        message: `Enter color ${i + 1} (HEX, RGB, or HSL):`,
        validate: (input) => {
          const color = tinycolor(input);
          return color.isValid() ? true : 'Please enter a valid color';
        }
      }
    ]);
    colors.push(tinycolor(color).toHexString());
  }

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎨 STEP 3: GRADIENT NAME"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  const { gradientName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'gradientName',
      message: 'Enter a name for your gradient:',
      validate: (input) => {
        if (!input.trim()) return 'Name is required';
        if (!/^[a-zA-Z0-9-]+$/.test(input)) {
          return 'Name should only contain letters, numbers, and hyphens';
        }
        return true;
      }
    }
  ]);

  return {
    type: gradientType,
    colors,
    name: gradientName
  };
};

const generateGradientCSS = (gradient) => {
  const { type, colors } = gradient;
  let cssValue;

  switch (type) {
    case 'linear':
      cssValue = `linear-gradient(to right, ${colors.join(', ')})`;
      break;
    case 'radial':
      cssValue = `radial-gradient(circle, ${colors.join(', ')})`;
      break;
    case 'conic':
      cssValue = `conic-gradient(${colors.join(', ')})`;
      break;
    default:
      cssValue = `linear-gradient(to right, ${colors.join(', ')})`;
  }

  return cssValue;
};

const saveTokensToFile = (tokens, format, folder, fileName) => {
  const outputDir = path.join(__dirname, '..', '..', 'output_files', folder);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `${fileName}.${format}`);
  fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2));
  console.log(chalk.green(`\n✅ Saved ${format.toUpperCase()} tokens to ${filePath}`));
};

const main = async () => {
  try {
    const gradientData = await askForInput();
    
    const tokens = {
      [gradientData.name]: {
        value: generateGradientCSS(gradientData),
        type: gradientData.type,
        colors: gradientData.colors
      }
    };

    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("🎨 PREVIEW"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    console.log(printGradientTable(tokens));
    
    printDetailedGradientPreview(gradientData);

    const { saveTokens } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'saveTokens',
        message: 'Would you like to save these gradient tokens?',
        default: true
      }
    ]);

    if (saveTokens) {
      const { format } = await inquirer.prompt([
        {
          type: 'list',
          name: 'format',
          message: 'Select the format to save the tokens:',
          choices: ['json', 'css', 'scss']
        }
      ]);

      const { folder } = await inquirer.prompt([
        {
          type: 'input',
          name: 'folder',
          message: 'Enter the folder name to save the tokens:',
          default: 'gradients'
        }
      ]);

      const { fileName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'fileName',
          message: 'Enter the file name (without extension):',
          default: 'gradient-tokens'
        }
      ]);

      await showLoader(chalk.yellow("\nSaving tokens"), 1000);
      saveTokensToFile(tokens, format, folder, fileName);
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
};

main(); 