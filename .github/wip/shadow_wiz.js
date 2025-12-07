import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import chalk from "chalk";
import Table from "cli-table3";
import tinycolor from "tinycolor2";
import ora from "ora";

const versionArg = process.argv.find((arg) => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Box Shadow Tokens Wizard - Version ${version}`));
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

const printShadowTable = (shadows) => {
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

const generatePreview = (shadow) => {
  const { x, y, blur, spread, color } = shadow;
  const shadowValue = `${x}px ${y}px ${blur}px ${spread}px ${color}`;
  return shadowValue;
};

const generateSummary = (shadows) => {
  const summary = [];
  for (const [name, shadow] of Object.entries(shadows)) {
    const { x, y, blur, spread, color } = shadow.$value;
    summary.push({
      name,
      type: shadow.$type,
      value: generatePreview(shadow.$value)
    });
  }
  return summary;
};

const printSummary = (shadows) => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("📊 SHADOW SUMMARY"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const summary = generateSummary(shadows);
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Type'),
      chalk.cyan('Value')
    ],
    colWidths: [20, 15, 50]
  });

  summary.forEach(shadow => {
    table.push([
      chalk.yellow(shadow.name),
      chalk.green(shadow.type),
      chalk.white(shadow.value)
    ]);
  });

  console.log(table.toString());
};

const generateShadowValue = (shadow) => {
  const { x, y, blur, spread, color } = shadow;
  const shadowType = shadow.$type === 'inner' ? 'inset ' : '';
  return {
    x: x.toString(),
    y: y.toString(),
    blur: blur.toString(),
    spread: spread.toString(),
    color: shadowType + color
  };
};

const generateShadowName = (baseName, shadowType, includeTypeInName, tokenName, existingShadows = {}) => {
  if (includeTypeInName) {
    return `${shadowType}.${tokenName}.${baseName}`;
  }
  
  // Check if this name already exists and create a unique name if needed
  let finalName = baseName;
  if (existingShadows[finalName]) {
    // If the existing shadow has a different type, add type suffix
    const existingType = existingShadows[finalName].$value.type;
    const currentType = shadowType === 'inner' ? 'innerShadow' : 'dropShadow';
    
    if (existingType !== currentType) {
      finalName = `${baseName}-${shadowType}`;
    }
  }
  
  return finalName;
};

const getNamingOptions = (approach) => {
  switch (approach) {
    case 't-shirt':
      return ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    case 'level':
      return ['1', '2', '3', '4', '5'];
    case 'elevation':
      return ['ground', 'low', 'medium', 'high', 'sky'];
    case 'material':
      return ['dp-1', 'dp-2', 'dp-3', 'dp-4', 'dp-6'];
    case 'contextual':
      return ['card', 'surface', 'button', 'modal', 'dropdown'];
    case 'semantic':
      return ['soft', 'mild', 'moderate', 'strong', 'heavy'];
    case 'interaction':
      return ['hover', 'active', 'focus'];
    default:
      return [];
  }
};

const SHADOW_PRESETS = {
  elevation: {
    ground: { x: 0, y: 1, blur: 2, spread: 0, opacity: 0.1 },
    low: { x: 0, y: 2, blur: 4, spread: 0, opacity: 0.15 },
    medium: { x: 0, y: 4, blur: 8, spread: 0, opacity: 0.2 },
    high: { x: 0, y: 8, blur: 16, spread: 0, opacity: 0.25 },
    sky: { x: 0, y: 12, blur: 24, spread: 0, opacity: 0.3 }
  },
  material: {
    'dp-1': { x: 0, y: 1, blur: 3, spread: 0, opacity: 0.12 },
    'dp-2': { x: 0, y: 3, blur: 6, spread: 0, opacity: 0.16 },
    'dp-3': { x: 0, y: 6, blur: 12, spread: 0, opacity: 0.19 },
    'dp-4': { x: 0, y: 8, blur: 16, spread: 0, opacity: 0.25 },
    'dp-6': { x: 0, y: 12, blur: 24, spread: 0, opacity: 0.30 }
  },
  contextual: {
    card: { x: 0, y: 2, blur: 4, spread: 0, opacity: 0.1 },
    button: { x: 0, y: 1, blur: 2, spread: 0, opacity: 0.1 },
    modal: { x: 0, y: 8, blur: 16, spread: 0, opacity: 0.2 },
    dropdown: { x: 0, y: 4, blur: 8, spread: 0, opacity: 0.15 },
    tooltip: { x: 0, y: 2, blur: 4, spread: 0, opacity: 0.1 }
  },
  interaction: {
    hover: { x: 0, y: 4, blur: 8, spread: 0, opacity: 0.15 },
    active: { x: 0, y: 2, blur: 4, spread: 0, opacity: 0.1 },
    focus: { x: 0, y: 0, blur: 0, spread: 2, opacity: 0.2 }
  }
};

const COLOR_PRESETS = {
  light: {
    subtle: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    strong: 'rgba(0, 0, 0, 0.2)'
  },
  dark: {
    subtle: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: 'rgba(255, 255, 255, 0.2)'
  }
};

const validateShadowValues = (values) => {
  const errors = [];
  
  if (values.blur < 0 || values.blur > 100) {
    errors.push('Blur radius must be between 0 and 100 pixels');
  }
  
  if (values.spread < -50 || values.spread > 50) {
    errors.push('Spread radius must be between -50 and 50 pixels');
  }
  
  if (values.opacity < 0 || values.opacity > 1) {
    errors.push('Opacity must be between 0 and 1');
  }
  
  return errors;
};

const getDefaultValues = (type, intensity) => {
  const baseValues = {
    x: 0,
    y: 0,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.15)'
  };

  // Check if the intensity matches any preset
  for (const [presetType, presets] of Object.entries(SHADOW_PRESETS)) {
    if (presets[intensity]) {
      const values = presets[intensity];
      return {
        x: values.x,
        y: values.y,
        blur: values.blur,
        spread: values.spread,
        color: tinycolor(baseValues.color).setAlpha(values.opacity).toRgbString()
      };
    }
  }

  // Fallback to intensity-based values
  const intensityValues = {
    xs: { x: 0, y: 1, blur: 2, spread: 0, opacity: 0.1 },
    sm: { x: 0, y: 2, blur: 4, spread: 0, opacity: 0.15 },
    md: { x: 0, y: 4, blur: 8, spread: 0, opacity: 0.2 },
    lg: { x: 0, y: 8, blur: 16, spread: 0, opacity: 0.25 },
    xl: { x: 0, y: 12, blur: 24, spread: 0, opacity: 0.3 },
    '2xl': { x: 0, y: 16, blur: 32, spread: 0, opacity: 0.35 }
  };

  const values = intensityValues[intensity] || intensityValues.md;
  return {
    x: values.x,
    y: values.y,
    blur: values.blur,
    spread: values.spread,
    color: tinycolor(baseValues.color).setAlpha(values.opacity).toRgbString()
  };
};

const askForColor = async () => {
  const { useCustomColor } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useCustomColor',
      message: 'Would you like to use a custom color for your shadows?',
      default: false
    }
  ]);

  if (!useCustomColor) {
    return {
      color: 'rgba(0, 0, 0, 0.15)',
      opacity: 0.15
    };
  }

  const { colorFormat } = await inquirer.prompt([
    {
      type: 'list',
      name: 'colorFormat',
      message: 'Select color format:',
      choices: [
        { name: 'HEX', value: 'hex' },
        { name: 'RGB/RGBA', value: 'rgb' },
        { name: 'HSL/HSLA', value: 'hsl' }
      ]
    }
  ]);

  let colorInput;
  switch (colorFormat) {
    case 'hex':
      const { hexColor } = await inquirer.prompt([
        {
          type: 'input',
          name: 'hexColor',
          message: 'Enter HEX color (e.g., #000000):',
          validate: (input) => {
            const color = tinycolor(input);
            return color.isValid() ? true : 'Please enter a valid HEX color';
          }
        }
      ]);
      colorInput = hexColor;
      break;

    case 'rgb':
      const { rgbColor } = await inquirer.prompt([
        {
          type: 'input',
          name: 'rgbColor',
          message: 'Enter RGB/RGBA color (e.g., rgb(0,0,0) or rgba(0,0,0,0.5)):',
          validate: (input) => {
            const color = tinycolor(input);
            return color.isValid() ? true : 'Please enter a valid RGB/RGBA color';
          }
        }
      ]);
      colorInput = rgbColor;
      break;

    case 'hsl':
      const { hslColor } = await inquirer.prompt([
        {
          type: 'input',
          name: 'hslColor',
          message: 'Enter HSL/HSLA color (e.g., hsl(0,0%,0%) or hsla(0,0%,0%,0.5)):',
          validate: (input) => {
            const color = tinycolor(input);
            return color.isValid() ? true : 'Please enter a valid HSL/HSLA color';
          }
        }
      ]);
      colorInput = hslColor;
      break;
  }

  const color = tinycolor(colorInput);
  const { opacity } = await inquirer.prompt([
    {
      type: 'number',
      name: 'opacity',
      message: 'Enter shadow opacity (0-1):',
      default: 0.15,
      validate: (input) => {
        const num = Number(input);
        return num >= 0 && num <= 1 ? true : 'Please enter a number between 0 and 1';
      }
    }
  ]);

  return {
    color: color.toRgbString(),
    opacity
  };
};

const askForNamingOnly = async () => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 NAMING CONVENTION"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { tokenName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'tokenName',
      message: 'Select the token naming convention:',
      choices: [
        { name: 'shadow', value: 'shadow' },
        { name: 'boxShadow', value: 'boxShadow' },
        { name: 'elevation', value: 'elevation' },
        { name: 'depth', value: 'depth' },
        { name: 'Custom', value: 'custom' }
      ]
    }
  ]);

  let customTokenName = tokenName;
  if (tokenName === 'custom') {
    const { customName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customName',
        message: 'Enter your custom token name:',
        validate: (input) => {
          if (!input.trim()) return 'Name is required';
          if (!/^[a-zA-Z0-9-]+$/.test(input)) {
            return 'Name should only contain letters, numbers, and hyphens';
          }
          return true;
        }
      }
    ]);
    customTokenName = customName;
  }

  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 NAMING APPROACH"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { namingApproach } = await inquirer.prompt([
    {
      type: 'list',
      name: 'namingApproach',
      message: 'Select the naming approach:',
      choices: [
        { name: 'T-shirt sizes (xs, sm, md, lg, xl)', value: 't-shirt' },
        { name: 'Levels (1, 2, 3, 4, 5)', value: 'level' },
        { name: 'Elevation (ground, low, medium, high, sky)', value: 'elevation' },
        { name: 'Material Design (dp-1 to dp-6)', value: 'material' },
        { name: 'Contextual (card, button, modal, etc.)', value: 'contextual' },
        { name: 'Interaction (hover, active, focus)', value: 'interaction' },
        { name: 'Custom', value: 'custom' }
      ]
    }
  ]);

  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 TOKEN NAMING OPTIONS"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { includeTypeInName } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'includeTypeInName',
      message: 'Would you like to include the shadow type (outer/inner) in the token names?',
      default: false
    }
  ]);

  return {
    tokenName: customTokenName,
    namingApproach,
    includeTypeInName
  };
};

const askForInput = async () => {
  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 STEP 1: TOKEN NAMING"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { tokenName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'tokenName',
      message: 'Select the token naming convention:',
      choices: [
        { name: 'shadow', value: 'shadow' },
        { name: 'boxShadow', value: 'boxShadow' },
        { name: 'elevation', value: 'elevation' },
        { name: 'depth', value: 'depth' },
        { name: 'Custom', value: 'custom' }
      ]
    }
  ]);

  let customTokenName = tokenName;
  if (tokenName === 'custom') {
    const { customName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customName',
        message: 'Enter your custom token name:',
        validate: (input) => {
          if (!input.trim()) return 'Name is required';
          if (!/^[a-zA-Z0-9-]+$/.test(input)) {
            return 'Name should only contain letters, numbers, and hyphens';
          }
          return true;
        }
      }
    ]);
    customTokenName = customName;
  }

  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 STEP 2: SHADOW TYPE"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { shadowType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'shadowType',
      message: 'Select the shadow type:',
      choices: [
        { name: 'Outer Shadow', value: 'outer' },
        { name: 'Inner Shadow', value: 'inner' }
      ]
    }
  ]);

  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 STEP 3: NAMING APPROACH"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { namingApproach } = await inquirer.prompt([
    {
      type: 'list',
      name: 'namingApproach',
      message: 'Select the naming approach:',
      choices: [
        { name: 'T-shirt sizes (xs, sm, md, lg, xl)', value: 't-shirt' },
        { name: 'Levels (1, 2, 3, 4, 5)', value: 'level' },
        { name: 'Elevation (ground, low, medium, high, sky)', value: 'elevation' },
        { name: 'Material Design (dp-1 to dp-6)', value: 'material' },
        { name: 'Contextual (card, button, modal, etc.)', value: 'contextual' },
        { name: 'Interaction (hover, active, focus)', value: 'interaction' },
        { name: 'Custom', value: 'custom' }
      ]
    }
  ]);

  const { shadowCount } = await inquirer.prompt([
    {
      type: 'number',
      name: 'shadowCount',
      message: 'How many shadows do you want to create?',
      default: 5,
      validate: (input) => {
        const num = Number(input);
        return num > 0 && num <= 10 ? true : 'Please enter a number between 1 and 10';
      }
    }
  ]);

  console.log(chalk.black.bgCyan("\n======================================="));
  console.log(chalk.bold("🎨 TOKEN NAMING OPTIONS"));
  console.log(chalk.black.bgCyan("=======================================\n"));

  const { includeTypeInName } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'includeTypeInName',
      message: 'Would you like to include the shadow type (outer/inner) in the token names?',
      default: false
    }
  ]);

  return {
    tokenName: customTokenName,
    shadowType,
    namingApproach,
    shadowCount,
    includeTypeInName
  };
};

const saveTokensToFile = (tokens, format, folder, fileName) => {
  const outputDir = path.join(__dirname, '..', '..', 'output_files', folder);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `${fileName}.${format}`);
  fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2));
};

const convertTokensToCSS = (tokens) => {
  let css = ':root {\n';
  const processTokens = (obj, prefix = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      if (value && typeof value === "object" && "$value" in value) {
        const shadow = value.$value;
        const cssVar = `--${prefix}${key}`.replace(/\./g, '-');
        const shadowType = shadow.type === 'innerShadow' ? 'inset ' : '';
        const shadowValue = `${shadowType}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
        css += `  ${cssVar}: ${shadowValue};\n`;
      } else if (value && typeof value === "object") {
        processTokens(value, `${prefix}${key}-`);
      }
    });
  };
  processTokens(tokens);
  css += '}\n';
  return css;
};

const convertTokensToSCSS = (tokens) => {
  let scss = '';
  const processTokens = (obj, prefix = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      if (value && typeof value === "object" && "$value" in value) {
        const shadow = value.$value;
        const scssVar = `$${prefix}${key}`.replace(/\./g, '-');
        const shadowType = shadow.type === 'innerShadow' ? 'inset ' : '';
        const shadowValue = `${shadowType}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
        scss += `${scssVar}: ${shadowValue};\n`;
      } else if (value && typeof value === "object") {
        processTokens(value, `${prefix}${key}-`);
      }
    });
  };
  processTokens(tokens);
  return scss;
};

const saveCSSTokensToFile = (tokens, folder, fileName) => {
  const outputDir = path.join(__dirname, '..', '..', 'output_files', folder);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `${fileName}.css`);
  const css = convertTokensToCSS(tokens);
  fs.writeFileSync(filePath, css);
};

const saveSCSSTokensToFile = (tokens, folder, fileName) => {
  const outputDir = path.join(__dirname, '..', '..', 'output_files', folder);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `${fileName}.scss`);
  const scss = convertTokensToSCSS(tokens);
  fs.writeFileSync(filePath, scss);
};

const main = async () => {
  let allShadows = {};
  let previousSettings = null;

  const generateShadows = async (isAdditionalSet = false, previousSettings = null) => {
    console.log(chalk.black.bgCyan("\n======================================="));
    console.log(chalk.bold("🪄 STARTING THE SHADOW TOKENS WIZARD'S MAGIC"));
    console.log(chalk.black.bgCyan("=======================================\n"));

    await showLoader(chalk.bold.yellow("🧚 Casting the magic of tokens"), 1500);

    // Don't clear allShadows - we want to preserve all shadows across sets

    // Show existing shadows if any
    if (Object.keys(allShadows).length > 0) {
      console.log(chalk.black.bgCyan("\n======================================="));
      console.log(chalk.bold("📋 EXISTING SHADOWS"));
      console.log(chalk.black.bgCyan("=======================================\n"));
      printShadowTable(allShadows);
    }

    console.log(
      chalk.whiteBright("\n❤️ Welcome to the Shadow Tokens Wizard script! Let this wizard 🧙 guide you through \ncreating your shadow tokens step by step.") +
      chalk.whiteBright("Generate your tokens and prepare them for using or syncing in ") +
      chalk.underline("Tokens Studio") +
      chalk.whiteBright(". \n✨ As a delightful bonus, you'll receive magical files in ") +
      chalk.underline("SCSS") +
      chalk.whiteBright(" and ") +
      chalk.underline("CSS") +
      chalk.whiteBright(" to test in your implementation!\n")
    );

    let tokenName, shadowType, namingApproach, shadowCount, includeTypeInName;
    
    if (isAdditionalSet && previousSettings) {
      // For additional sets, ask for shadow type first
      console.log(chalk.black.bgCyan("\n======================================="));
      console.log(chalk.bold("🎨 ADDITIONAL SHADOW SET"));
      console.log(chalk.black.bgCyan("=======================================\n"));
      
      const { newShadowType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'newShadowType',
          message: 'What type of shadows do you want to add?',
          choices: [
            { name: 'Outer Shadow', value: 'outer' },
            { name: 'Inner Shadow', value: 'inner' }
          ]
        }
      ]);
      
      shadowType = newShadowType;
      
      // Ask if they want to use the same naming convention
      const { useSameNaming } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useSameNaming',
          message: `Use the same naming convention as before (${previousSettings.namingApproach})?`,
          default: true
        }
      ]);
      
      if (useSameNaming) {
        tokenName = previousSettings.tokenName;
        namingApproach = previousSettings.namingApproach;
        includeTypeInName = previousSettings.includeTypeInName;
      } else {
        const { newTokenName, newNamingApproach, newIncludeTypeInName } = await askForNamingOnly();
        tokenName = newTokenName;
        namingApproach = newNamingApproach;
        includeTypeInName = newIncludeTypeInName;
      }
      
      // Ask for shadow count
      const { newShadowCount } = await inquirer.prompt([
        {
          type: 'number',
          name: 'newShadowCount',
          message: 'How many shadows do you want to create?',
          default: 5,
          validate: (input) => {
            const num = Number(input);
            return num > 0 && num <= 10 ? true : 'Please enter a number between 1 and 10';
          }
        }
      ]);
      
      shadowCount = newShadowCount;
    } else {
      // First time or full input
      const input = await askForInput();
      tokenName = input.tokenName;
      shadowType = input.shadowType;
      namingApproach = input.namingApproach;
      shadowCount = input.shadowCount;
      includeTypeInName = input.includeTypeInName;
    }

    const shadows = {};
    const namingOptions = namingApproach === 'custom' ? [] : getNamingOptions(namingApproach);

    console.log(chalk.black.bgCyan("\n======================================="));
    console.log(chalk.bold("🎨 COLOR CONFIGURATION"));
    console.log(chalk.black.bgCyan("=======================================\n"));

    // Ask for color preferences once for all shadows
    const { useCustomColor } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useCustomColor',
        message: 'Would you like to use a custom color for your shadows?',
        default: false
      }
    ]);

    let colorPreferences;
    if (!useCustomColor) {
      colorPreferences = {
        color: 'rgba(0, 0, 0, 0.15)',
        opacity: 0.15
      };
    } else {
      colorPreferences = await askForColor();
    }

    console.log(chalk.black.bgCyan("\n======================================="));
    console.log(chalk.bold("🎨 SHADOW CONFIGURATION"));
    console.log(chalk.black.bgCyan("=======================================\n"));

    const { configType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'configType',
        message: 'Select configuration type:',
        choices: [
          { name: 'Prefilled Standard Values', value: 'standard' },
          { name: 'Custom Values', value: 'custom' }
        ]
      }
    ]);

    if (configType === 'standard') {
      console.log(chalk.black.bgCyan("\n======================================="));
      console.log(chalk.bold("📋 STANDARD VALUES PREVIEW"));
      console.log(chalk.black.bgCyan("=======================================\n"));

      const previewShadows = {};
      for (let i = 0; i < shadowCount; i++) {
        const baseName = namingApproach === 'custom' ? `shadow-${i + 1}` : (namingOptions[i] || `shadow-${i + 1}`);
        const shadowName = generateShadowName(baseName, shadowType, includeTypeInName, tokenName, allShadows);
        const defaultValues = getDefaultValues(shadowType, shadowName);
        previewShadows[shadowName] = {
          $type: "boxShadow",
          $value: {
            ...defaultValues,
            color: colorPreferences.color,
            opacity: colorPreferences.opacity,
            type: shadowType === 'inner' ? 'innerShadow' : 'dropShadow'
          }
        };
      }
      printShadowTable(previewShadows);

      const { confirmStandard } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmStandard',
          message: 'Would you like to proceed with these standard values?',
          default: true
        }
      ]);

      if (!confirmStandard) {
        console.log(chalk.yellow("\nSwitching to custom values configuration..."));
        configType = 'custom';
      }
    }

    for (let i = 0; i < shadowCount; i++) {
      let shadowName;
      if (namingApproach === 'custom') {
        const { customShadowName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customShadowName',
            message: `Enter name for shadow ${i + 1}:`,
            validate: (input) => {
              if (!input.trim()) return 'Name is required';
              if (!/^[a-zA-Z0-9-]+$/.test(input)) {
                return 'Name should only contain letters, numbers, and hyphens';
              }
              return true;
            }
          }
        ]);
        shadowName = generateShadowName(customShadowName, shadowType, includeTypeInName, tokenName, allShadows);
      } else {
        const baseName = namingOptions[i] || `shadow-${i + 1}`;
        shadowName = generateShadowName(baseName, shadowType, includeTypeInName, tokenName, allShadows);
      }

      let shadowProperties;
      if (configType === 'standard') {
        const defaultValues = getDefaultValues(shadowType, shadowName);
        shadowProperties = {
          ...defaultValues,
          color: colorPreferences.color,
          opacity: colorPreferences.opacity,
          type: shadowType === 'inner' ? 'innerShadow' : 'dropShadow'
        };
      } else {
        console.log(chalk.black.bgCyan("\n======================================="));
        console.log(chalk.bold(`🎨 CUSTOM VALUES FOR SHADOW ${i + 1}`));
        console.log(chalk.black.bgCyan("=======================================\n"));

        const { x } = await inquirer.prompt([
          {
            type: 'number',
            name: 'x',
            message: `Enter horizontal offset (in pixels):`,
            default: 0
          }
        ]);

        const { y } = await inquirer.prompt([
          {
            type: 'number',
            name: 'y',
            message: `Enter vertical offset (in pixels):`,
            default: 4
          }
        ]);

        const { blur } = await inquirer.prompt([
          {
            type: 'number',
            name: 'blur',
            message: `Enter blur radius (in pixels):`,
            default: shadowType === 'outer' ? 24 : 40,
            validate: (input) => {
              const num = Number(input);
              return num >= 0 && num <= 100 ? true : 'Blur radius must be between 0 and 100 pixels';
            }
          }
        ]);

        const { spread } = await inquirer.prompt([
          {
            type: 'number',
            name: 'spread',
            message: `Enter spread radius (in pixels):`,
            default: 0,
            validate: (input) => {
              const num = Number(input);
              return num >= -50 && num <= 50 ? true : 'Spread radius must be between -50 and 50 pixels';
            }
          }
        ]);

        shadowProperties = {
          x,
          y,
          blur,
          spread,
          color: colorPreferences.color,
          opacity: colorPreferences.opacity,
          type: shadowType === 'inner' ? 'innerShadow' : 'dropShadow'
        };

        const errors = validateShadowValues(shadowProperties);
        if (errors.length > 0) {
          console.log(chalk.red('\n⚠️ Validation errors:'));
          errors.forEach(error => console.log(chalk.red(`   - ${error}`)));
          const { retry } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'retry',
              message: 'Would you like to retry with different values?',
              default: true
            }
          ]);
          if (retry) {
            i--; // Retry this shadow
            continue;
          }
        }
      }

      shadows[shadowName] = {
        $type: "boxShadow",
        $value: {
          ...shadowProperties,
          type: shadowType === 'inner' ? 'innerShadow' : 'dropShadow'
        }
      };
    }

    // Add new shadows to the collection
    allShadows = { ...allShadows, ...shadows };

    console.log(chalk.black.bgCyan("\n======================================="));
    console.log(chalk.bold("🎨 PREVIEW"));
    console.log(chalk.black.bgCyan("=======================================\n"));

    printShadowTable(allShadows);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Would you like to save these shadow tokens?',
        default: true
      }
    ]);

    if (confirm) {
      const tokens = {
        [tokenName]: allShadows
      };

      await showLoader(chalk.yellow("\nSaving tokens"), 1000);

      const outputDir = path.join(process.cwd(), 'outputs');
      const tokensDir = path.join(outputDir, 'tokens', 'box-shadow');
      const cssDir = path.join(outputDir, 'css', 'box-shadow');
      const scssDir = path.join(outputDir, 'scss', 'box-shadow');

      // Create directories if they don't exist
      [tokensDir, cssDir, scssDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      const updatedFiles = [];
      const savedNewFiles = [];
      const deletedFiles = [];

      // Save JSON tokens
      const jsonPath = path.join(tokensDir, 'box-shadow-tokens.json');
      if (fs.existsSync(jsonPath)) {
        updatedFiles.push('tokens/box-shadow/box-shadow-tokens.json');
      } else {
        savedNewFiles.push('tokens/box-shadow/box-shadow-tokens.json');
      }
      saveTokensToFile(tokens, 'json', 'box-shadow', 'box-shadow-tokens');

      // Save CSS tokens
      const cssPath = path.join(cssDir, 'box-shadow-tokens.css');
      if (fs.existsSync(cssPath)) {
        updatedFiles.push('css/box-shadow/box-shadow-tokens.css');
      } else {
        savedNewFiles.push('css/box-shadow/box-shadow-tokens.css');
      }
      saveCSSTokensToFile(tokens, 'box-shadow', 'box-shadow-tokens');

      // Save SCSS tokens
      const scssPath = path.join(scssDir, 'box-shadow-tokens.scss');
      if (fs.existsSync(scssPath)) {
        updatedFiles.push('scss/box-shadow/box-shadow-tokens.scss');
      } else {
        savedNewFiles.push('scss/box-shadow/box-shadow-tokens.scss');
      }
      saveSCSSTokensToFile(tokens, 'box-shadow', 'box-shadow-tokens');

      console.log(chalk.black.bgCyan("\n======================================="));
      console.log(chalk.bold("📁 OUTPUT FILES"));
      console.log(chalk.black.bgCyan("=======================================\n"));

      console.log(chalk.yellow("📁 Folder Structure:"));
      console.log(chalk.white("outputs/"));
      console.log(chalk.white("├── tokens/"));
      console.log(chalk.white("│   └── box-shadow/"));
      console.log(chalk.white("│       └── box-shadow-tokens.json"));
      console.log(chalk.white("├── css/"));
      console.log(chalk.white("│   └── box-shadow/"));
      console.log(chalk.white("│       └── box-shadow-tokens.css"));
      console.log(chalk.white("└── scss/"));
      console.log(chalk.white("    └── box-shadow/"));
      console.log(chalk.white("        └── box-shadow-tokens.scss\n"));

      if (updatedFiles.length > 0) {
        console.log(chalk.yellow("📝 Updated Files:"));
        updatedFiles.forEach(file => console.log(chalk.white(`   - ${file}`)));
      }

      if (savedNewFiles.length > 0) {
        console.log(chalk.yellow("\n✨ New Files:"));
        savedNewFiles.forEach(file => console.log(chalk.white(`   - ${file}`)));
      }

      if (deletedFiles.length > 0) {
        console.log(chalk.yellow("\n🗑️  Deleted Files:"));
        deletedFiles.forEach(file => console.log(chalk.white(`   - ${file}`)));
      }

      console.log(chalk.black.bgCyan("\n======================================="));
      console.log(chalk.bold("🔄 GENERATE ANOTHER SET"));
      console.log(chalk.black.bgCyan("=======================================\n"));

      const { generateMore } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'generateMore',
          message: 'Would you like to generate another set of shadow tokens?',
          default: false
        }
      ]);

      if (!generateMore) {
        console.log(chalk.black.bgCyan("\n======================================="));
        console.log(chalk.bold("👋 GOODBYE"));
        console.log(chalk.black.bgCyan("=======================================\n"));
        console.log(chalk.yellow("Thank you for using the Shadow Token Wizard!"));
        console.log(chalk.yellow("Your shadow tokens are ready to use in your design system! 🎨✨\n"));
        return { continue: false, settings: null };
      }
      return { continue: true, settings: { tokenName, shadowType, namingApproach, includeTypeInName } };
    } else {
      console.log(chalk.yellow("\nNo changes were saved. Feel free to run the wizard again!"));
      return { continue: false, settings: null };
    }
  };

  // Initial shadow generation
  let continueGenerating = true;
  let currentSettings = null;
  
  while (continueGenerating) {
    const result = await generateShadows(continueGenerating && currentSettings !== null, currentSettings);
    continueGenerating = result.continue;
    if (result.settings) {
      currentSettings = result.settings;
    }
  }
};

main(); 