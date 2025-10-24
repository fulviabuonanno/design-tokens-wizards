import tinycolor from "tinycolor2";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import chalk from "chalk";
import Table from "cli-table3";
import { useOklchConverter } from "@builtwithjavascript/oklch-converter";

const oklchConverter = useOklchConverter();

const versionArg = process.argv.find((arg) => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(`Color Tokens Wizard - Version ${version}`));
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

const formatStopsOutput = (stops) => {
  return Object.entries(stops)
    .map(([key, value]) => {
      const sample = chalk.bgHex(value).white("     "); 
      return `${key}: ${value} ${sample}`;
    })
    .join(",\n");
};

const printStopsTable = (stops, mode = "semantic stops", padded = false) => {
  let entries = Object.entries(stops);

  if (mode === "semantic stops") {
    const semanticOrder = [
      "ultra-light", "lightest", "lighter", "light",
      "semi-light", "base", "semi-dark", "dark",
      "darker", "darkest", "ultra-dark"
    ];
    entries.sort((a, b) => {
      const aIndex = semanticOrder.indexOf(a[0]);
      const bIndex = semanticOrder.indexOf(b[0]);
      return aIndex - bIndex;
    });
  } else if (mode === "ordinal" || mode === "incremental" || mode === "alphabetical") {
    if (padded) {
      entries.forEach(([key, value], idx) => {
        if (key !== "base") {
          entries[idx][0] = key.padStart(2, "0");
        }
      });
    }
    
    entries.sort((a, b) => {
      
      if (a[0] === "base") return -1;
      if (b[0] === "base") return 1;
      
      if (mode === "alphabetical") {
        return a[0].localeCompare(b[0]);
      } else if (mode === "ordinal") {
        
        const aNum = parseInt(a[0], 10);
        const bNum = parseInt(b[0], 10);
        return aNum - bNum;
      } else {
        return parseInt(a[0], 10) - parseInt(b[0], 10);
      }
    });
  }

  const table = new Table({
    head: [
      chalk.bold.yellowBright("Scale"), 
      chalk.bold.yellowBright("HEX"), 
      chalk.bold.yellowBright("Sample")
    ],
    style: { head: [], border: ["yellow"] }
  });

  entries.forEach(([key, value]) => {
    const sampleText = "  Sample  ";
    table.push([
      key, 
      value, 
      chalk.bgHex(value)(chalk.white(sampleText))
    ]);
  });

  return table.toString();
};

const displayExistingColors = (tokensData) => {
  if (Object.keys(tokensData).length === 0) {
    return;
  }
  
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎨 EXISTING COLORS"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));
  
  let colorCount = 0;
  
  const processTokens = (obj, path = []) => {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        if ('$value' in obj[key] && '$type' in obj[key] && obj[key].$type === 'color') {
          const colorValue = obj[key].$value;
          const colorPath = [...path, key].join('.');
          console.log(`${chalk.bold(colorPath)}: ${colorValue} ${chalk.bgHex(colorValue).white("     ")}`);
          colorCount++;
        } else {
          processTokens(obj[key], [...path, key]);
        }
      }
    }
  };
  
  processTokens(tokensData);
  console.log(chalk.gray(`\nTotal colors: ${colorCount}\n`));
};

const askForInput = async (tokensData, previousConcept = null, formatChoices = null, scaleSettings = null) => {
  
  let tokenType = 'global';
  let category = null;
  let namingLevel = null;
  
  if (Object.keys(tokensData).length > 0) {
    displayExistingColors(tokensData);
    
    // Find existing structure
    const findSettings = (obj, path = []) => {
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          if ('$value' in obj[key] && '$type' in obj[key] && obj[key].$type === 'color') {
            return path;
          } else {
            const result = findSettings(obj[key], [...path, key]);
            if (result) return result;
          }
        }
      }
      return null;
    };
    
    const colorPath = findSettings(tokensData);
    if (colorPath && colorPath.length > 0) {
      if (colorPath.length >= 1) {
        category = colorPath[0];
      }
      if (colorPath.length >= 2) {
        const potentialNamingLevel = colorPath[1];
        const isNamingLevel = ['color', 'colour', 'palette', 'scheme'].includes(potentialNamingLevel);
        if (isNamingLevel) {
          namingLevel = potentialNamingLevel;
        }
      }
    }
    
    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("ℹ️ USING EXISTING SETTINGS"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));
    
    console.log(chalk.whiteBright(`Type: Global`));
    if (category) console.log(chalk.whiteBright(`Category: ${category}`));
    if (namingLevel) console.log(chalk.whiteBright(`Naming Level: ${namingLevel}`));
    console.log();
    
    console.log(chalk.yellowBright("📝 Note: New colors will maintain the same naming structure as existing ones."));
    console.log(chalk.yellowBright("   This ensures consistency across your design system.\n"));
  } else {
    
    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("🎨 STEP 1: TOKEN TYPE"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    let { tokenType: selectedTokenType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'tokenType',
        message: 'Select the type of color tokens you want to create:\n>>>',
        choices: [
          { name: 'Global Colors', value: 'global' },
          { name: 'Semantic Colors', value: 'semantic' }
        ]
      }
    ]);
    
    tokenType = selectedTokenType;

    if (tokenType === 'semantic') {
      console.log(chalk.yellow("\n⚠️  Semantic color tokens are coming soon!"));
      console.log(chalk.yellow("This feature will allow you to create color tokens based on their meaning and purpose in your design system."));
      console.log(chalk.yellow("For now, we recommend using Global Colors to create your color tokens."));
      console.log(chalk.yellow("Global Colors provide a solid foundation for your design system and can be used to build semantic tokens later.\n"));
      
      const { continueWithGlobal } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueWithGlobal',
          message: 'Would you like to continue with Global Colors instead?\n>>>',
          default: true
        }
      ]);

      if (!continueWithGlobal) {
        console.log(chalk.bold.red("\n🚫 Exiting the wizard. Please check back later for semantic color support."));
        process.exit(0);
      }
      
      tokenType = 'global';
    }

    if (tokenType === 'global') {
      console.log(chalk.black.bgYellowBright("\n======================================="));
      console.log(chalk.bold("📁 STEP 2: GLOBAL CATEGORY"));
      console.log(chalk.black.bgYellowBright("=======================================\n"));

      console.log(chalk.whiteBright("Categories help organize your colors into logical groups and create a clear hierarchy in your design system."));
      console.log(chalk.whiteBright("\nExamples: primitives, foundation, core, basics, essentials, global, roots, custom \n"));

      const { includeCategory } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'includeCategory',
          message: 'Would you like to include a category in your color naming?\n>>>',
          default: true
        }
      ]);

      if (includeCategory) {
        const { globalCategory } = await inquirer.prompt([
          {
            type: 'list',
            name: 'globalCategory',
            message: 'Select a category for your global colors:\n>>>',
            choices: [
              { name: 'primitives', value: 'primitives' },
              { name: 'foundation', value: 'foundation' },
              { name: 'core', value: 'core' },
              { name: 'basics', value: 'basics' },
              { name: 'essentials', value: 'essentials' },
              { name: 'global', value: 'global' },
              { name: 'roots', value: 'roots' },
              { name: 'custom', value: 'custom' }
            ]
          }
        ]);

        if (globalCategory === 'custom') {
          const { customCategory } = await inquirer.prompt([
            {
              type: 'input',
              name: 'customCategory',
              message: 'Enter your custom category name:\n>>>',
              validate: (input) => {
                const trimmedInput = input.trim();
                if (!trimmedInput.match(/^[a-zA-Z0-9.-]*$/)) {
                  return "Category name should only contain letters, numbers, hyphens, and dots.";
                }
                return true;
              }
            }
          ]);
          category = customCategory.trim();
        } else {
          category = globalCategory;
        }

        const { confirmCategory } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmCategory',
            message: `Do you want to continue with the category "${category}"?\n>>>`,
            default: true
          }
        ]);

        if (!confirmCategory) {
          console.log(chalk.bold.greenBright("\nNo problem! Let's start over 🧩 since you didn't confirm the category."));
          return await askForInput(tokensData);
        }
      }
      
      console.log(chalk.black.bgYellowBright("\n======================================="));
      console.log(chalk.bold("📝 STEP 3: NAMING LEVEL"));
      console.log(chalk.black.bgYellowBright("=======================================\n"));

      console.log(chalk.whiteBright("The naming level provides context about how the color should be used in your design system."));
      console.log(chalk.whiteBright("\nExamples: color (single color), palette (group of colors), scheme (color combinations)\n"));

      const { includeNamingLevel } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'includeNamingLevel',
          message: 'Would you like to include a naming level in your color naming?\n>>>',
          default: true
        }
      ]);

      if (includeNamingLevel) {
        const { level } = await inquirer.prompt([
          {
            type: 'list',
            name: 'level',
            message: 'Select a naming level for your colors:\n>>>',
            choices: [
              { name: 'color', value: 'color' },
              { name: 'colour', value: 'colour' },
              { name: 'palette', value: 'palette' },
              { name: 'scheme', value: 'scheme' },
              { name: 'custom', value: 'custom' }
            ]
          }
        ]);

        if (level === 'custom') {
          const { customLevel } = await inquirer.prompt([
            {
              type: 'input',
              name: 'customLevel',
              message: 'Enter your custom naming level:\n>>>',
              validate: (input) => {
                const trimmedInput = input.trim();
                if (!trimmedInput.match(/^[a-zA-Z0-9.-]*$/)) {
                  return "Naming level should only contain letters, numbers, hyphens, and dots.";
                }
                return true;
              }
            }
          ]);
          namingLevel = customLevel.trim();
        } else {
          namingLevel = level;
        }

        const { confirmLevel } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmLevel',
            message: `Do you want to continue with the naming level "${namingLevel}"?\n>>>`,
            default: true
          }
        ]);

        if (!confirmLevel) {
          console.log(chalk.bold.greenBright("\nNo problem! Let's start over 🧩 since you didn't confirm the naming level."));
          return await askForInput(tokensData);
        }
      }
    }
  }

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎨 STEP 4: BATCH MODE"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  console.log(chalk.whiteBright("You can add a single color or multiple colors at once."));
  console.log(chalk.whiteBright("When adding multiple colors, they will all use the same scale configuration.\n"));

  const { colorMode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'colorMode',
      message: 'How many colors would you like to add?\n>>>',
      choices: [
        { name: 'Single color', value: 'single' },
        { name: 'Multiple colors (batch mode)', value: 'batch' }
      ],
      default: 'single'
    }
  ]);

  // Collection to store all colors (hex + name pairs)
  let allColors = [];

  if (colorMode === 'single') {
    // Single color mode - original flow
    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("🎨 STEP 5: SELECT COLOR"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    const hexResponse = await inquirer.prompt([
      {
        type: "input",
        name: "hex",
        message: "Enter a HEX value to use as base color (e.g., #FABADA):\n>>>",
        validate: (input) =>
          tinycolor(input).isValid() ? true : "Invalid HEX color. Please provide a valid HEX color."
      }
    ]);
    const hex = tinycolor(hexResponse.hex).toHexString().toUpperCase();

    const baseColorPreview = chalk.bgHex(hex).white("  Sample  ");
    console.log(`\n${chalk.bold("Selected color:")}`);
    console.log(`   HEX: ${chalk.whiteBright(hex)}`);
    console.log(`   Preview: ${baseColorPreview}\n`);

    const nameResponse = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: `Enter a name for the ${namingLevel || 'color'} (e.g., blue, yellow, red):\n>>>`,
        validate: (input) => {
          const trimmedInput = input.trim();
          if (!trimmedInput || trimmedInput.length === 0) {
            return "Please provide a name for your color. This field cannot be empty.";
          }
          if (!trimmedInput.match(/^[a-zA-Z0-9.-]*$/)) {
            return "Name should only contain letters, numbers, hyphens, and dots.";
          }

          const checkPath = [];
          if (category) checkPath.push(category);
          if (namingLevel) checkPath.push(namingLevel);

          let currentObj = tokensData;
          for (const segment of checkPath) {
            if (!currentObj[segment]) break;
            currentObj = currentObj[segment];
          }

          if (currentObj && currentObj[trimmedInput]) {
            return `A color with the name "${trimmedInput}" already exists. Please choose a different name.`;
          }

          return true;
        }
      }
    ]);

    allColors.push({
      hex: hex,
      name: nameResponse.name.trim()
    });

  } else {
    // Batch mode - collect multiple colors first
    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("🎨 STEP 5: ADD MULTIPLE COLORS"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    console.log(chalk.yellowBright("💡 You can add multiple colors at once. They will all use the same scale configuration."));
    console.log(chalk.gray("   You can enter HEX values with or without the # symbol."));
    console.log(chalk.gray("   Format: Separate multiple values with commas (,) or semicolons (;)"));
    console.log(chalk.gray("   Example: #FF5733, 3498DB; 2ECC71 or FF5733,3498DB,2ECC71\n"));

    const { batchMethod } = await inquirer.prompt([
      {
        type: 'list',
        name: 'batchMethod',
        message: 'How would you like to add colors?\n>>>',
        choices: [
          { name: 'Enter multiple HEX codes at once (comma or semicolon separated)', value: 'bulk' },
          { name: 'Add one color at a time', value: 'individual' }
        ]
      }
    ]);

    if (batchMethod === 'bulk') {
      // Bulk entry mode
      const { hexValues } = await inquirer.prompt([
        {
          type: 'input',
          name: 'hexValues',
          message: 'Enter HEX values separated by commas or semicolons (e.g., #FF5733, 3498DB; 2ECC71):\n>>>',
          validate: (input) => {
            if (!input || input.trim().length === 0) {
              return "Please provide at least one HEX value.";
            }

            const hexCodes = input.split(/[,;]/).map(h => h.trim()).filter(h => h.length > 0);

            if (hexCodes.length === 0) {
              return "Please provide at least one valid HEX value.";
            }

            const invalidCodes = hexCodes.filter(hex => {
              const hexWithHash = hex.startsWith('#') ? hex : `#${hex}`;
              return !tinycolor(hexWithHash).isValid();
            });

            if (invalidCodes.length > 0) {
              return `Invalid HEX code(s): ${invalidCodes.join(', ')}. Please check and try again.`;
            }

            return true;
          }
        }
      ]);

      const hexCodes = hexValues.split(/[,;]/)
        .map(h => h.trim())
        .filter(h => h.length > 0)
        .map(h => {
          const normalized = h.startsWith('#') ? h : `#${h}`;
          return tinycolor(normalized).toHexString().toUpperCase();
        });

      console.log(chalk.greenBright(`\n✅ Found ${hexCodes.length} valid HEX code(s)!\n`));

      for (let i = 0; i < hexCodes.length; i++) {
        const currentHex = hexCodes[i];
        const colorPreview = chalk.bgHex(currentHex).white("  Sample  ");

        console.log(chalk.bold(`Color ${i + 1} of ${hexCodes.length}:`));
        console.log(`   HEX: ${chalk.whiteBright(currentHex)} ${colorPreview}`);

        const { colorName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'colorName',
            message: `Enter a name for this color (e.g., blue, yellow, red):\n>>>`,
            validate: (input) => {
              const trimmedInput = input.trim();
              if (!trimmedInput || trimmedInput.length === 0) {
                return "Please provide a name for your color. This field cannot be empty.";
              }
              if (!trimmedInput.match(/^[a-zA-Z0-9.-]*$/)) {
                return "Name should only contain letters, numbers, hyphens, and dots.";
              }

              const checkPath = [];
              if (category) checkPath.push(category);
              if (namingLevel) checkPath.push(namingLevel);

              let currentObj = tokensData;
              for (const segment of checkPath) {
                if (!currentObj[segment]) break;
                currentObj = currentObj[segment];
              }

              if (currentObj && currentObj[trimmedInput]) {
                return `A color with the name "${trimmedInput}" already exists. Please choose a different name.`;
              }

              if (allColors.some(c => c.name === trimmedInput)) {
                return `You've already added a color with the name "${trimmedInput}". Please choose a different name.`;
              }

              return true;
            }
          }
        ]);

        allColors.push({
          hex: currentHex,
          name: colorName.trim()
        });

        console.log(chalk.greenBright(`   ✓ Added: ${colorName.trim()}\n`));
      }

    } else {
      // Individual entry mode
      let addingMore = true;
      while (addingMore) {
        const colorInput = await inquirer.prompt([
          {
            type: "input",
            name: "hex",
            message: "Enter a HEX value (with or without #, e.g., #FABADA or FABADA):\n>>>",
            validate: (input) => {
              const normalized = input.trim().startsWith('#') ? input.trim() : `#${input.trim()}`;
              return tinycolor(normalized).isValid() ? true : "Invalid HEX color. Please provide a valid HEX color.";
            }
          },
          {
            type: "input",
            name: "name",
            message: `Enter a name for this ${namingLevel || 'color'} (e.g., blue, yellow, red):\n>>>`,
            validate: (input) => {
              const trimmedInput = input.trim();
              if (!trimmedInput || trimmedInput.length === 0) {
                return "Please provide a name for your color. This field cannot be empty.";
              }
              if (!trimmedInput.match(/^[a-zA-Z0-9.-]*$/)) {
                return "Name should only contain letters, numbers, hyphens, and dots.";
              }

              const checkPath = [];
              if (category) checkPath.push(category);
              if (namingLevel) checkPath.push(namingLevel);

              let currentObj = tokensData;
              for (const segment of checkPath) {
                if (!currentObj[segment]) break;
                currentObj = currentObj[segment];
              }

              if (currentObj && currentObj[trimmedInput]) {
                return `A color with the name "${trimmedInput}" already exists. Please choose a different name.`;
              }

              if (allColors.some(c => c.name === trimmedInput)) {
                return `You've already added a color with the name "${trimmedInput}". Please choose a different name.`;
              }

              return true;
            }
          }
        ]);

        const normalizedHex = colorInput.hex.trim().startsWith('#')
          ? colorInput.hex.trim()
          : `#${colorInput.hex.trim()}`;
        const finalHex = tinycolor(normalizedHex).toHexString().toUpperCase();

        const colorPreview = chalk.bgHex(finalHex).white("  Sample  ");
        console.log(`\n${chalk.bold("Color added:")}`);
        console.log(`   Name: ${chalk.whiteBright(colorInput.name.trim())}`);
        console.log(`   HEX: ${chalk.whiteBright(finalHex)}`);
        console.log(`   Preview: ${colorPreview}\n`);

        allColors.push({
          hex: finalHex,
          name: colorInput.name.trim()
        });

        const { addAnother } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'addAnother',
            message: '➕ Add another color?\n>>>',
            default: true
          }
        ]);

        addingMore = addAnother;
      }
    }

    console.log(chalk.greenBright(`\n✅ Total colors collected: ${allColors.length}`));
    console.log(chalk.yellowBright("All colors will use the same scale settings you configure next.\n"));
  }

  // Extract first color for backward compatibility
  const firstColor = allColors[0];
  const hex = firstColor.hex;
  const concept = firstColor.name;
  const finalConcept = concept || "color";

  // Remaining colors (if any) for batch processing
  const additionalColors = allColors.slice(1);

  let stops, newScaleSettings;
  
  while (true) {
    if (scaleSettings) {
      newScaleSettings = scaleSettings;
      console.log(chalk.black.bgYellowBright("\n======================================="));
      console.log(chalk.bold("➡️ STEP 6: CURRENT SCALE"));
      console.log(chalk.black.bgYellowBright("=======================================\n"));
      
      // Display scale information in a more visually appealing way
      console.log(chalk.bold("📊 Scale Information:"));
      console.log(`  ${chalk.bold("Type:")} ${chalk.whiteBright(scaleSettings.type)}`);
      
      // Add additional details based on scale type
      if (scaleSettings.type === "ordinal") {
        console.log(`  ${chalk.bold("Format:")} ${chalk.whiteBright(scaleSettings.padded ? 'Padded (01, 02...)' : 'Unpadded (1, 2...)')}`);
      } else if (scaleSettings.type === "incremental") {
        console.log(`  ${chalk.bold("Step size:")} ${chalk.whiteBright(scaleSettings.incrementalOption)}`);
        console.log(`  ${chalk.bold("Start value:")} ${chalk.whiteBright(scaleSettings.startValue || 100)}`);
      } else if (scaleSettings.type === "alphabetical") {
        // No additional details needed for alphabetical
      }
      
      console.log(`  ${chalk.bold("Number of stops:")} ${chalk.whiteBright(scaleSettings.stopsCount)}`);
      console.log();
      stops = newScaleSettings.type === "incremental" 
        ? generateStopsIncremental(hex, newScaleSettings.incrementalOption, newScaleSettings.stopsCount, newScaleSettings.startValue)
        : (newScaleSettings.type === "semanticStops" 
             ? generateStopsSemantic(hex, newScaleSettings.stopsCount)
             : generateStopsOrdinal(hex, newScaleSettings.padded, newScaleSettings.stopsCount));
    } else {
      console.log(chalk.black.bgYellowBright("\n======================================="));
      console.log(chalk.bold("🔢 STEP 6: SELECT SCALE TYPE"));
      console.log(chalk.black.bgYellowBright("=======================================\n"));
      const { scaleType } = await inquirer.prompt([
        {
          type: "list",
          name: "scaleType",
          message: "Select the scale type for your color:\n>>>",
          choices: [
            { name: "Incremental (e.g., 100, 200, 300, 400)", value: "incremental" },
            { name: "Ordinal (e.g., 1, 2, 3, 4)", value: "ordinal" },
            { name: 'Alphabetical (e.g., A, B, C, D)', value: 'alphabetical' },
            { name: "Semantic Stops (e.g. dark, base, light)", value: "semanticStops" }
          ]
        }
      ]);
      let ordinalPadded, incrementalChoice, stopsCount, alphabeticalOption;
      if (scaleType === "ordinal") {
        const { ordinalOption } = await inquirer.prompt([
          {
            type: 'list',
            name: 'ordinalOption',
            message: "For Ordinal scale, choose the format:\n>>>",
            choices: [
              { name: "Padded (e.g., 01, 02, 03, 04)", value: 'padded' },
              { name: "Unpadded (e.g., 1, 2, 3, 4)", value: 'unpadded' }
            ]
          }
        ]);
        ordinalPadded = ordinalOption === 'padded';
      } else if (scaleType === "incremental") {
        incrementalChoice = await inquirer.prompt([
          {
            type: 'list',
            name: 'incrementalOption',
            message: "For Incremental scale, choose the step increment:\n>>>",
            choices: [
              { name: "100 in 100 (e.g., 100, 200, 300, 400)", value: '100' },
              { name: "50 in 50 (e.g., 50, 100, 150, 200)", value: '50' },
              { name: "25 in 25 (e.g., 25, 50, 75, 100)", value: '25' },
              { name: "10 in 10 (e.g., 10, 20, 30, 40)", value: '10' },
            ]
          }
        ]);
      } else if (scaleType === "alphabetical") {
        const { alphabeticalOption: option } = await inquirer.prompt([
          {
            type: "list",
            name: "alphabeticalOption",
            message: "For Alphabetical scale, choose the format:\n>>>",
            choices: [
              { name: "Uppercase (e.g., A, B, C, D)", value: 'uppercase' },
              { name: "Lowercase (e.g., a, b, c, d)", value: 'lowercase' }
            ]
          }
        ]);
        alphabeticalOption = option;
      } else if (scaleType === "semanticStops") {
        const { semanticStopsCount } = await inquirer.prompt([
          {
            type: "list",
            name: "semanticStopsCount",
            message: "Select the number of stops for the semantic scale:\n>>>",
            choices: [
              { name: "1", value: 1 },
              { name: "2", value: 2 },
              { name: "4", value: 4 },
              { name: "6", value: 6 },
              { name: "8", value: 8 },
              { name: "10", value: 10 }
            ]
          }
        ]);
        stopsCount = semanticStopsCount;
      }
      if (scaleType !== "semanticStops") {
        const response = await inquirer.prompt([
          {
            type: "number",
            name: "stopsCount",
            message: "How many values would you like to include in the color scale? (1-20):\n>>>",
            default: 10,
            validate: (input) => {
              const num = Number(input);
              return num >= 1 && num <= 20 ? true : "Enter a number between 1 and 20.";
            }
          }
        ]);
        stopsCount = response.stopsCount;
      }

      const { minMix, maxMix } = await customizeColorRanges();

      newScaleSettings = {
        type: scaleType,
        padded: scaleType === "ordinal" ? ordinalPadded : null,
        incrementalOption: scaleType === "incremental" ? incrementalChoice.incrementalOption : undefined,
        startValue: scaleType === "incremental" ? incrementalChoice.startValue : undefined,
        alphabeticalOption: scaleType === "alphabetical" ? alphabeticalOption : undefined,
        stopsCount: stopsCount,
        minMix: minMix,
        maxMix: maxMix
      };
      stops = scaleType === "incremental"
        ? generateStopsIncremental(hex, newScaleSettings.incrementalOption, stopsCount, incrementalChoice.startValue)
        : (scaleType === "semanticStops"
             ? generateStopsSemantic(hex, stopsCount)
             : (scaleType === "alphabetical"
                  ? generateStopsAlphabetical(hex, alphabeticalOption, stopsCount)
                  : generateStopsOrdinal(hex, ordinalPadded, stopsCount)));
    }
    
    let mode, padded;
    if (newScaleSettings.type === "ordinal") {
      mode = "ordinal";
      padded = newScaleSettings.padded; 
    } else if (newScaleSettings.type === "incremental") {
      mode = "incremental";
      padded = false;
    } else if (newScaleSettings.type === "semanticStops") {
      mode = "semantic stops";
      padded = true; 
    } else if (newScaleSettings.type === "alphabetical") {
      mode = "alphabetical";
      padded = false;
    } else {
      mode = "stops"; 
      padded = false;
    }

    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold(`🔍 STEP 7: ${allColors.length > 1 ? 'COLORS' : 'COLOR'} PREVIEW`));
    console.log(chalk.black.bgYellowBright("=======================================\n"));

    console.log(
      chalk.bold("Type: ") + chalk.whiteBright(tokenType === 'global' ? 'Global' : 'Semantic') +
      (category ? chalk.bold("  Category: ") + chalk.whiteBright(category) : "") +
      (namingLevel ? chalk.bold("  Level: ") + chalk.whiteBright(namingLevel) : "")
    );

    if (allColors.length > 1) {
      console.log(chalk.bold("  Colors: ") + chalk.whiteBright(`${allColors.length} colors in batch mode\n`));
    } else {
      console.log(chalk.bold("  Name: ") + chalk.whiteBright(finalConcept) + "\n");
    }

    if (tokenType === 'global') {
      if (allColors.length > 1) {
        console.log(chalk.bold("📝 Naming Examples:"));
        allColors.slice(0, 3).forEach(color => {
          const namingExample = `${category}.${namingLevel}.${color.name}`;
          console.log(chalk.whiteBright(`   ${namingExample}`));
        });
        if (allColors.length > 3) {
          console.log(chalk.gray(`   ... and ${allColors.length - 3} more`));
        }
        console.log(chalk.gray("   This is how your colors will be referenced in the tokens\n"));
      } else {
        const namingExample = `${category}.${namingLevel}.${finalConcept}`;
        console.log(chalk.bold("📝 Naming Example:"));
        console.log(chalk.whiteBright(`   ${namingExample}`));
        console.log(chalk.gray("   This is how your color will be referenced in the tokens\n"));
      }
    }

    // Show preview for first color
    console.log(chalk.bold(`Preview of "${finalConcept}":\n`));
    console.log(printStopsTable(stops, mode, padded));

    // If in batch mode, show a summary of other colors
    if (allColors.length > 1) {
      console.log(chalk.yellowBright(`\n💡 Note: All ${allColors.length} colors will use the same scale configuration.`));
      console.log(chalk.gray("   Additional colors:"));
      additionalColors.forEach(color => {
        const preview = chalk.bgHex(color.hex).white("  ●  ");
        console.log(chalk.gray(`   - ${color.name}: ${color.hex} ${preview}`));
      });
      console.log();
    }
    
    // Find the middle key(s) depending on the scale type
    let stopKeys = Object.keys(stops).filter(k => k !== "base");
    let middleKeys = [];
    if (stopKeys.length > 0) {
      if (newScaleSettings.type === "incremental" || newScaleSettings.type === "ordinal") {
        let numericKeys = stopKeys.map(Number).sort((a, b) => a - b);
        if (numericKeys.length % 2 === 1) {
          middleKeys = [String(numericKeys[Math.floor(numericKeys.length / 2)])];
        } else {
          middleKeys = [
            String(numericKeys[numericKeys.length / 2 - 1]),
            String(numericKeys[numericKeys.length / 2])
          ];
        }
      } else if (newScaleSettings.type === "alphabetical") {
        let alphaKeys = stopKeys.sort();
        if (alphaKeys.length % 2 === 1) {
          middleKeys = [alphaKeys[Math.floor(alphaKeys.length / 2)]];
        } else {
          middleKeys = [
            alphaKeys[alphaKeys.length / 2 - 1],
            alphaKeys[alphaKeys.length / 2]
          ];
        }
      } else if (newScaleSettings.type === "semanticStops") {
        let ordered = stopKeys.slice().sort((a, b) => semanticOrder.indexOf(a) - semanticOrder.indexOf(b));
        if (ordered.length % 2 === 1) {
          middleKeys = [ordered[Math.floor(ordered.length / 2)]];
        } else {
          middleKeys = [
            ordered[ordered.length / 2 - 1],
            ordered[ordered.length / 2]
          ];
        }
      }
    }
    // Ask user if they want 'base' to be one of the middle tones
    if (middleKeys.length > 0) {
      const { useMiddleToneAsBase } = await inquirer.prompt([
        {
          type: "confirm",
          name: "useMiddleToneAsBase",
          message: `Do you want the value 'base' to be one of the middle tones (${middleKeys.map(k => k).join(', ')})?\n>>>`,
          default: false
        }
      ]);
      if (useMiddleToneAsBase) {
        let chosenMiddleTone = middleKeys[0];
        if (middleKeys.length > 1) {
          const { selectedMiddleTone } = await inquirer.prompt([
            {
              type: "list",
              name: "selectedMiddleTone",
              message: "Which of the middle tones do you want to use as 'base'?\n>>>",
              choices: middleKeys.map(k => ({
                name: `${k} (${stops[k]})`,
                value: k
              })),
              default: middleKeys[1]
            }
          ]);
          chosenMiddleTone = selectedMiddleTone;
        }
        // Swap: assign the original hex (from base) to the middle tone and remove base
        stops[chosenMiddleTone] = stops["base"];
        delete stops["base"];
      }
    }
    
    const { confirmColor } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmColor",
        message: "Would you like to continue with this nomenclature?\n>>>",
        default: true
      }
    ]);

    if (!confirmColor) {
      console.log(chalk.bold.greenBright("\nNo problem! Let's start over 🧩 since you didn't confirm to move forward with the nomenclature."));
      return await askForInput(tokensData);
    } else {
      break;
    }
  }
  return {
    hex: hex.trim(),
    concept,
    stops,
    colorType: tokenType === 'global' ? 'Global' : 'Semantic',
    category: category,
    namingLevel: namingLevel,
    formatChoices,
    scaleSettings: newScaleSettings,
    additionalColors: additionalColors  // Include batch colors
  };
};

const MIN_MIX = 10;  
const MAX_MIX = 90;  

const generateStopsIncremental = (hex, step = '50', stopsCount = 10, startValue = 100) => {
  const stops = {};
  const stepNum = parseInt(step);
  const startNum = parseInt(startValue) || 100; // Default to 100 if not provided or invalid
  
  for (let i = 0; i < stopsCount; i++) {
    const key = startNum + (i * stepNum); 
    const ratio = stopsCount === 1 ? 0 : i / (stopsCount - 1);
    let mixPercentage;
    if (ratio < 0.5) {
      mixPercentage = MIN_MIX + (1 - ratio * 2) * (MAX_MIX - MIN_MIX);
      stops[key] = tinycolor.mix(hex, "white", mixPercentage).toHexString().toUpperCase();
    } else {
      mixPercentage = MIN_MIX + ((ratio - 0.5) * 2) * (MAX_MIX - MIN_MIX);
      stops[key] = tinycolor.mix(hex, "black", mixPercentage).toHexString().toUpperCase();
    }
  }
  stops["base"] = tinycolor(hex).toHexString().toUpperCase();
  return stops;
};

const generateStopsOrdinal = (hex, padded = true, stopsCount = 10) => {
  const stops = {};
  
  stops["base"] = tinycolor(hex).toHexString().toUpperCase();
  
  for (let i = 0; i < stopsCount; i++) {
    const ratio = stopsCount === 1 ? 0 : i / (stopsCount - 1);
    const key = padded ? String(i + 1).padStart(2, '0') : String(i + 1);
    
    const mixPercentage = ratio < 0.5 
      ? MIN_MIX + (1 - ratio * 2) * (MAX_MIX - MIN_MIX)
      : MIN_MIX + ((ratio - 0.5) * 2) * (MAX_MIX - MIN_MIX);
    stops[key] = tinycolor.mix(hex, ratio < 0.5 ? "white" : "black", mixPercentage).toHexString().toUpperCase();
  }
  
  if (padded) {
    const sortedEntries = Object.entries(stops).sort((a, b) => {
      if (a[0] === "base") return -1;
      if (b[0] === "base") return 1;
      return Number(a[0]) - Number(b[0]);
    });
    return Object.fromEntries(sortedEntries);
  }
  return stops;
};

const generateStopsSemantic = (hex, stopsCount) => {
  let labels;
  
  switch (stopsCount) {
    case 1:
      labels = ["base"];
      break;
    case 2:
      labels = ["dark", "base", "light"];
      break;
    case 4:
      labels = ["darker", "dark", "base", "light", "lighter"];
      break;
    case 6:
      labels = ["darkest", "darker", "dark", "base", "light", "lighter", "lightest"];
      break;
    case 8:
      labels = ["ultra-dark", "darkest", "darker", "dark", "base", "light", "lighter", "lightest", "ultra-light"];
      break;
    case 10:
      labels = ["ultra-dark", "darkest", "darker", "dark", "semi-dark", "base", "semi-light", "light", "lighter", "lightest", "ultra-light"];
      break;
    default:
      const defaultLabels = ["ultra-dark", "darkest", "darker", "dark", "base", "light", "lighter", "lightest", "ultra-light"];
      labels = [];
      const extra = Math.max(0, stopsCount + 2 - defaultLabels.length);
      if (extra > 0) {
        labels = defaultLabels.slice();
        while (labels.length < stopsCount + 2) {
          labels.unshift(defaultLabels[0]);
          labels.push(defaultLabels[defaultLabels.length - 1]);
        }
      } else {
        const step = Math.floor(defaultLabels.length / (stopsCount + 1));
        for (let i = 0; i < stopsCount + 2; i++) {
          labels.push(defaultLabels[Math.min(i * step, defaultLabels.length - 1)]);
        }
      }
      break;
  }
  
  const stops = {};
  const total = labels.length;
  const baseIndex = Math.floor(total / 2);
  
  const MIN_MIX = 10; 
  const MAX_MIX = 90; 
  
  for (let i = 0; i < total; i++) {
    if (i === baseIndex) {
      stops[labels[i]] = tinycolor(hex).toHexString().toUpperCase();
    } else if (i < baseIndex) {
      const mixPercentage = Math.round(
        MIN_MIX + ((baseIndex - i) / baseIndex) * (MAX_MIX - MIN_MIX)
      );
      stops[labels[i]] = tinycolor.mix(hex, "black", mixPercentage).toHexString().toUpperCase();
    } else {
      const mixPercentage = Math.round(
        MIN_MIX + ((i - baseIndex) / (total - 1 - baseIndex)) * (MAX_MIX - MIN_MIX)
      );
      stops[labels[i]] = tinycolor.mix(hex, "white", mixPercentage).toHexString().toUpperCase();
    }
  }
  return stops;
};

const generateStopsAlphabetical = (hex, format = 'uppercase', stopsCount = 10) => {
  const stops = {};
  const startCharCode = format === 'uppercase' ? 65 : 97; 
  
  stops["base"] = tinycolor(hex).toHexString().toUpperCase();
  
  for (let i = 0; i < stopsCount; i++) {
    const key = String.fromCharCode(startCharCode + i);
    const ratio = stopsCount === 1 ? 0 : i / (stopsCount - 1);
    let mixPercentage;
    if (ratio < 0.5) {
      mixPercentage = MIN_MIX + (1 - ratio * 2) * (MAX_MIX - MIN_MIX);
      stops[key] = tinycolor.mix(hex, "white", mixPercentage).toHexString().toUpperCase();
    } else {
      mixPercentage = MIN_MIX + ((ratio - 0.5) * 2) * (MAX_MIX - MIN_MIX);
      stops[key] = tinycolor.mix(hex, "black", mixPercentage).toHexString().toUpperCase();
    }
  }
  return stops;
};

const semanticOrder = [
  "ultra-dark", "darkest", "darker", "dark",
  "semi-dark", "base", "semi-light", "light",
  "lighter", "lightest", "ultra-light"
];

const customStringify = (obj, indent = 2) => {
  const spacer = " ".repeat(indent);
  const stringify = (value, currentIndent) => {
    if (value === null || typeof value !== "object") {
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      const items = value.map(item => stringify(item, currentIndent + indent));
      return "[\n" + " ".repeat(currentIndent + indent) + items.join(",\n" + " ".repeat(currentIndent + indent)) + "\n" + " ".repeat(currentIndent) + "]";
    }
    let keys = Object.keys(value);
    
    keys.sort((a, b) => {
      if (a === "$value") return -1;
      if (b === "$value") return 1;
      if (a === "$type") return -1;
      if (b === "$type") return 1;
      return a.localeCompare(b);
    });

    if (keys.includes("base")) {
      keys = ["base", ...keys.filter(k => k !== "base")];
    }
    let result = "{\n";
    keys.forEach((key, idx) => {
      result += " ".repeat(currentIndent + indent) + JSON.stringify(key) + ": " + stringify(value[key], currentIndent + indent);
      if (idx < keys.length - 1) result += ",\n";
    });
    result += "\n" + " ".repeat(currentIndent) + "}";
    return result;
  };
  return stringify(obj, 0);
};

const saveTokensToFile = (tokensData, format, folder, fileName) => {
  const filePath = path.join(folder, fileName.replace("hex", format.toLowerCase()));
  fs.writeFileSync(filePath, customStringify(tokensData, 2));
};

const deleteUnusedFormatFiles = (folders, formats) => {
  if (!formats) return [];
  
  const formatFiles = {
    RGB: {
      tokens: "color_tokens_rgb.json",
      css: "color_variables_rgb.css",
      scss: "color_variables_rgb.scss"
    },
    RGBA: {
      tokens: "color_tokens_rgba.json",
      css: "color_variables_rgba.css",
      scss: "color_variables_rgba.scss"
    },
    HSL: {
      tokens: "color_tokens_hsl.json",
      css: "color_variables_hsl.css",
      scss: "color_variables_hsl.scss"
    },
    HEX: {
      css: "color_variables_hex.css",
      scss: "color_variables_hex.scss"
    },
    OKLCH: {
      tokens: "color_tokens_oklch.json",
      css: "color_variables_oklch.css",
      scss: "color_variables_oklch.scss"
    }
  };

  const deletedFiles = [];

  for (const [format, filesByFolder] of Object.entries(formatFiles)) {
    
    if (format === "HEX") continue;
    if (!formats[`generate${format}`]) {
      for (const [folderKey, fileName] of Object.entries(filesByFolder)) {
        const folderPath = folders[folderKey];
        const filePath = path.join(folderPath, fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedFiles.push(filePath);
        }
      }
    }
  }

  return deletedFiles;
};

const convertTokensToCSS = (tokens) => {
  let cssVariables = ":root {\n";
  const processTokens = (obj, prefix = "") => {
    let keys = Object.keys(obj);
    if (keys.length) {
      
      if (keys.every(k => semanticOrder.includes(k))) {
        keys = keys.sort((a, b) => semanticOrder.indexOf(a) - semanticOrder.indexOf(b));
      } else if (keys.every(k => /^\d{2}$/.test(k))) {
        keys = keys.sort((a, b) => Number(a) - Number(b));
      } else if (keys.every(k => !isNaN(Number(k)) || k === "base")) {
        keys = keys.filter(k => k !== "base").sort((a, b) => Number(a) - Number(b));
      } else {
        keys = keys.sort((a, b) => a.localeCompare(b));
      }
      
      if (obj.hasOwnProperty("base")) {
        keys = keys.filter(k => k !== "base");
        keys.unshift("base");
      }
      for (const key of keys) {
        if (obj[key] && typeof obj[key] === "object" && "$value" in obj[key]) {
          cssVariables += `  --${prefix}${key}: ${obj[key].$value};\n`;
        } else {
          processTokens(obj[key], `${prefix}${key}-`);
        }
      }
    }
  };
  processTokens(tokens);
  cssVariables += "}";
  return cssVariables;
};

const convertTokensToSCSS = (tokens) => {
  let scssVariables = "";
  const processTokens = (obj, prefix = "") => {
    let keys = Object.keys(obj);
    if (keys.length) {
      if (keys.every(k => semanticOrder.includes(k))) {
        keys = keys.sort((a, b) => semanticOrder.indexOf(a) - semanticOrder.indexOf(b));
      } else if (keys.every(k => /^\d{2}$/.test(k))) {
        keys = keys.sort((a, b) => Number(a) - Number(b));
      } else if (keys.every(k => !isNaN(Number(k)) || k === "base")) {
        keys = keys.filter(k => k !== "base").sort((a, b) => Number(a) - Number(b));
      } else {
        keys = keys.sort((a, b) => a.localeCompare(b));
      }
      
      if (obj.hasOwnProperty("base")) {
        keys = keys.filter(k => k !== "base");
        keys.unshift("base");
      }
      for (const key of keys) {
        if (obj[key] && typeof obj[key] === "object" && "$value" in obj[key]) {
          scssVariables += `$${prefix}${key}: ${obj[key].$value};\n`;
        } else {
          processTokens(obj[key], `${prefix}${key}-`);
        }
      }
    }
  };
  processTokens(tokens);
  return scssVariables;
};

const saveCSSTokensToFile = (tokens, folder, fileName) => {
  const cssContent = convertTokensToCSS(tokens);
  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, cssContent);
};

const saveSCSSTokensToFile = (tokens, folder, fileName) => {
  const scssContent = convertTokensToSCSS(tokens);
  const filePath = path.join(folder, fileName);
  fs.writeFileSync(filePath, scssContent);
};

const convertTokensToFormat = (tokens, format) => {
  const converted = JSON.parse(JSON.stringify(tokens));
  const convertRecursive = (obj) => {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === "object" && "$value" in obj[key]) {
        const { $value, $type, ...rest } = obj[key];
        if (format === "RGB") {
          obj[key] = { $value: tinycolor($value).toRgbString(), $type, ...rest };
        } else if (format === "RGBA") {
          const rgba = tinycolor($value).toRgb();
          obj[key] = { $value: `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`, $type, ...rest };
        } else if (format === "HSL") {
          obj[key] = { $value: tinycolor($value).toHslString(), $type, ...rest };
        } else if (format === "OKLCH") {
          obj[key] = { $value: oklchConverter.hexToOklchString($value), $type, ...rest };
        }
      } else if (obj[key] && typeof obj[key] === "object") {
        convertRecursive(obj[key]);
      }
    }
  };
  convertRecursive(converted);
  return converted;
};

const customizeColorRanges = async () => {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎨 CUSTOMIZE COLOR RANGES"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  console.log(chalk.whiteBright("Default range is between 10% and 90%:"));
  console.log(chalk.whiteBright("  • 10% minimum ensures colors never get too close to pure white/black"));
  console.log(chalk.whiteBright("  • 90% maximum ensures middle steps maintain good contrast with the base color"));
  console.log(chalk.whiteBright("\nYou can customize these values between 0% and 100%:"));
  console.log(chalk.whiteBright("  • Lower minimum values will create more extreme light/dark variations"));
  console.log(chalk.whiteBright("  • Higher maximum values will create more subtle variations\n"));

  const { customizeRanges } = await inquirer.prompt([
    {
      type: "confirm",
      name: "customizeRanges",
      message: "Would you like to customize the color mix ranges?\n>>>",
      default: false
    }
  ]);

  let minMix = MIN_MIX;
  let maxMix = MAX_MIX;

  if (customizeRanges) {
    const ranges = await inquirer.prompt([
      {
        type: "number",
        name: "minMix",
        message: "Enter minimum mix percentage (0-100):\n>>>",
        default: MIN_MIX,
        validate: (input) => {
          const num = Number(input);
          if (num === 0) {
            console.log(chalk.yellow("\n⚠️  Warning: Using 0% will result in pure white/black colors at the extremes."));
          }
          return num >= 0 && num <= 100 ? true : "Enter a number between 0 and 100.";
        }
      },
      {
        type: "number",
        name: "maxMix",
        message: "Enter maximum mix percentage (0-100):\n>>>",
        default: MAX_MIX,
        validate: (input) => {
          const num = Number(input);
          if (num === 100) {
            console.log(chalk.yellow("\n⚠️  Warning: Using 100% will result in pure white/black colors at the extremes."));
          }
          return num >= 0 && num <= 100 ? true : "Enter a number between 0 and 100.";
        }
      }
    ]);
    minMix = ranges.minMix;
    maxMix = ranges.maxMix;
  }

  return { minMix, maxMix };
};

const main = async () => {
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🪄 STARTING THE COLOR WIZARD'S MAGIC"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  await showLoader(chalk.bold.magenta("🦄 Casting the magic of tokens"), 1500);

  console.log(
    chalk.whiteBright("\n✨ Welcome to the Color Tokens Wizard! 🧙✨ Ready to sprinkle some color magic into your design system? Let's create beautiful color tokens together!") +
    chalk.whiteBright("\n\n🎨 Your tokens will be ready to sync with ") +
    chalk.underline("JSON format for Tokens Studio in Figma") +
    chalk.whiteBright(" in a snap! 🌟 And here's the magical bonus: you'll get ") +
    chalk.underline("SCSS") +
    chalk.whiteBright(" and ") +
    chalk.underline("CSS") +
    chalk.whiteBright(" files to bring your color tokens to life! ✨")
  );

  let tokensData = {};
  const outputsDir = path.join(__dirname, "..", "..", "output_files");
  const tokensFolder = path.join(outputsDir, "tokens/json/color");
  const cssFolder = path.join(outputsDir, "tokens/css/color");
  const scssFolder = path.join(outputsDir, "tokens/scss/color");
  let namingChoice = null;
  let previousConcept = null;
  let formatChoices = null;
  let scaleSettings = null;

  if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);
  if (!fs.existsSync(tokensFolder)) fs.mkdirSync(tokensFolder, { recursive: true });
  if (!fs.existsSync(cssFolder)) fs.mkdirSync(cssFolder, { recursive: true });
  if (!fs.existsSync(scssFolder)) fs.mkdirSync(scssFolder, { recursive: true });

  let addMoreColors = true;

  while (addMoreColors) {
    const input = await askForInput(tokensData, previousConcept, formatChoices, scaleSettings);
    if (!input) return;

    const { hex, concept, variant, generateRGB, generateRGBA, generateHSL, generateOKLCH, stops, namingChoice: newNamingChoice, formatChoices: newFormatChoices, scaleSettings: newScaleSettings, colorType, additionalColors } = input;

    namingChoice = newNamingChoice;
    previousConcept = concept;
    formatChoices = newFormatChoices;
    scaleSettings = newScaleSettings;

    const color = tinycolor(hex);

    const finalConcept = concept || "color";

    const { category, namingLevel } = input;

    // Helper function to add a color to tokensData
    const addColorToTokens = (colorHex, colorName, colorStops) => {
      if (colorType === 'Global') {
        if (category && namingLevel) {
          if (!tokensData[category]) {
            tokensData[category] = {};
          }
          if (!tokensData[category][namingLevel]) {
            tokensData[category][namingLevel] = {};
          }
          tokensData[category][namingLevel][colorName] = Object.fromEntries(
            Object.entries(colorStops).map(([k, v]) => [k, { $value: tinycolor(v).toHexString().toUpperCase(), $type: "color" }])
          );
        } else if (category) {
          if (!tokensData[category]) {
            tokensData[category] = {};
          }
          tokensData[category][colorName] = Object.fromEntries(
            Object.entries(colorStops).map(([k, v]) => [k, { $value: tinycolor(v).toHexString().toUpperCase(), $type: "color" }])
          );
        } else if (namingLevel) {
          if (!tokensData[namingLevel]) {
            tokensData[namingLevel] = {};
          }
          tokensData[namingLevel][colorName] = Object.fromEntries(
            Object.entries(colorStops).map(([k, v]) => [k, { $value: tinycolor(v).toHexString().toUpperCase(), $type: "color" }])
          );
        } else {
          tokensData[colorName] = Object.fromEntries(
            Object.entries(colorStops).map(([k, v]) => [k, { $value: tinycolor(v).toHexString().toUpperCase(), $type: "color" }])
          );
        }
      } else {
        tokensData[colorName] = Object.fromEntries(
          Object.entries(colorStops).map(([k, v]) => [k, { $value: tinycolor(v).toHexString().toUpperCase(), $type: "color" }])
        );
      }
    };

    // Add the first/main color
    addColorToTokens(hex, finalConcept, stops);

    // Process additional colors if batch mode was used
    if (additionalColors && additionalColors.length > 0) {
      console.log(chalk.black.bgYellowBright("\n======================================="));
      console.log(chalk.bold(`🎨 PROCESSING ${additionalColors.length} ADDITIONAL COLOR${additionalColors.length > 1 ? 'S' : ''}`));
      console.log(chalk.black.bgYellowBright("=======================================\n"));

      for (const additionalColor of additionalColors) {
        // Generate stops for this additional color using the same settings
        let additionalStops;
        if (newScaleSettings.type === "incremental") {
          additionalStops = generateStopsIncremental(
            additionalColor.hex,
            newScaleSettings.incrementalOption,
            newScaleSettings.stopsCount,
            newScaleSettings.startValue
          );
        } else if (newScaleSettings.type === "semanticStops") {
          additionalStops = generateStopsSemantic(
            additionalColor.hex,
            newScaleSettings.stopsCount
          );
        } else if (newScaleSettings.type === "alphabetical") {
          additionalStops = generateStopsAlphabetical(
            additionalColor.hex,
            newScaleSettings.alphabeticalOption,
            newScaleSettings.stopsCount
          );
        } else {
          additionalStops = generateStopsOrdinal(
            additionalColor.hex,
            newScaleSettings.padded,
            newScaleSettings.stopsCount
          );
        }

        // Apply middle tone logic if needed
        let stopKeys = Object.keys(additionalStops).filter(k => k !== "base");
        let middleKeys = [];
        if (stopKeys.length > 0) {
          if (newScaleSettings.type === "incremental" || newScaleSettings.type === "ordinal") {
            let numericKeys = stopKeys.map(Number).sort((a, b) => a - b);
            if (numericKeys.length % 2 === 1) {
              middleKeys = [String(numericKeys[Math.floor(numericKeys.length / 2)])];
            } else {
              middleKeys = [
                String(numericKeys[numericKeys.length / 2 - 1]),
                String(numericKeys[numericKeys.length / 2])
              ];
            }
          } else if (newScaleSettings.type === "alphabetical") {
            let alphaKeys = stopKeys.sort();
            if (alphaKeys.length % 2 === 1) {
              middleKeys = [alphaKeys[Math.floor(alphaKeys.length / 2)]];
            } else {
              middleKeys = [
                alphaKeys[alphaKeys.length / 2 - 1],
                alphaKeys[alphaKeys.length / 2]
              ];
            }
          } else if (newScaleSettings.type === "semanticStops") {
            const semanticOrder = [
              "ultra-dark", "darkest", "darker", "dark",
              "semi-dark", "base", "semi-light", "light",
              "lighter", "lightest", "ultra-light"
            ];
            let ordered = stopKeys.slice().sort((a, b) => semanticOrder.indexOf(a) - semanticOrder.indexOf(b));
            if (ordered.length % 2 === 1) {
              middleKeys = [ordered[Math.floor(ordered.length / 2)]];
            } else {
              middleKeys = [
                ordered[ordered.length / 2 - 1],
                ordered[ordered.length / 2]
              ];
            }
          }
        }

        // Automatically apply middle tone logic (use first middle key if available)
        if (middleKeys.length > 0 && additionalStops["base"]) {
          additionalStops[middleKeys[0]] = additionalStops["base"];
          delete additionalStops["base"];
        }

        // Add this color to tokens
        addColorToTokens(additionalColor.hex, additionalColor.name, additionalStops);

        console.log(chalk.greenBright(`✓ Added: ${additionalColor.name} (${additionalColor.hex})`));
      }

      console.log(chalk.greenBright(`\n✅ Successfully processed ${1 + additionalColors.length} color${additionalColors.length > 0 ? 's' : ''} with the same scale settings!\n`));
    }

    const ensureValueBeforeType = (obj) => {
      if (obj && typeof obj === 'object') {
        if ('$value' in obj && '$type' in obj) {
          const { $value, $type, ...rest } = obj;
          return { $value, $type, ...rest };
        }
        return Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [k, ensureValueBeforeType(v)])
        );
      }
      return obj;
    };

    tokensData = ensureValueBeforeType(tokensData);

    const hexJsonExisted = fs.existsSync(path.join(tokensFolder, 'color_tokens_hex.json'));
    const hexCssExisted  = fs.existsSync(path.join(cssFolder, 'color_variables_hex.css'));
    const hexScssExisted = fs.existsSync(path.join(scssFolder, 'color_variables_hex.scss'));

    const convFilesPreexistence = {
      RGB: {
        tokens: fs.existsSync(path.join(tokensFolder, 'color_tokens_rgb.json')),
        css:    fs.existsSync(path.join(cssFolder, 'color_variables_rgb.css')),
        scss:   fs.existsSync(path.join(scssFolder, 'color_variables_rgb.scss'))
      },
      RGBA: {
        tokens: fs.existsSync(path.join(tokensFolder, 'color_tokens_rgba.json')),
        css:    fs.existsSync(path.join(cssFolder, 'color_variables_rgba.css')),
        scss:   fs.existsSync(path.join(scssFolder, 'color_variables_rgba.scss'))
      },
      HSL: {
        tokens: fs.existsSync(path.join(tokensFolder, 'color_tokens_hsl.json')),
        css:    fs.existsSync(path.join(cssFolder, 'color_variables_hsl.css')),
        scss:   fs.existsSync(path.join(scssFolder, 'color_variables_hsl.scss'))
      },
      OKLCH: {
        tokens: fs.existsSync(path.join(tokensFolder, 'color_tokens_oklch.json')),
        css:    fs.existsSync(path.join(cssFolder, 'color_variables_oklch.css')),
        scss:   fs.existsSync(path.join(scssFolder, 'color_variables_oklch.scss'))
      }
    };

    saveTokensToFile(tokensData, 'hex', tokensFolder, 'color_tokens_hex.json');
    saveCSSTokensToFile(tokensData, cssFolder, 'color_variables_hex.css');
    saveSCSSTokensToFile(tokensData, scssFolder, 'color_variables_hex.scss');

    if (generateRGB) {
      const tokensRGBData = JSON.parse(JSON.stringify(tokensData));
      Object.entries(tokensRGBData).forEach(([concept, variants]) => {
        Object.entries(variants).forEach(([variant, colors]) => {
          Object.entries(colors).forEach(([key, token]) => {
            if (token && typeof token === "object" && token.$value) {
              tokensRGBData[concept][variant][key].$value = tinycolor(token.$value).toRgbString();
            } else if (typeof token === "string") {
              tokensRGBData[concept][variant][key] = { $value: tinycolor(token).toRgbString(), $type: "color" };
            }
          });
        });
      });
      saveTokensToFile(tokensRGBData, 'rgb', tokensFolder, 'color_tokens_rgb.json');
    }
    
    if (generateRGBA) {
      const tokensRGBAData = JSON.parse(JSON.stringify(tokensData));
      Object.entries(tokensRGBAData).forEach(([concept, variants]) => {
        Object.entries(variants).forEach(([variant, colors]) => {
          Object.entries(colors).forEach(([key, token]) => {
            if (token && typeof token === "object" && token.$value) {
              const rgba = tinycolor(token.$value).toRgb(); 
              tokensRGBAData[concept][variant][key].$value = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
            } else if (typeof token === "string") {
              const rgba = tinycolor(token).toRgb();
              tokensRGBAData[concept][variant][key] = { $value: `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`, $type: "color" };
            }
          });
        });
      });
      saveTokensToFile(tokensRGBAData, 'rgba', tokensFolder, 'color_tokens_rgba.json');
    }
    
    if (generateHSL) {
      const tokensHSLData = JSON.parse(JSON.stringify(tokensData));
      Object.entries(tokensHSLData).forEach(([concept, variants]) => {
        Object.entries(variants).forEach(([variant, colors]) => {
          Object.entries(colors).forEach(([key, token]) => {
            if (token && typeof token === "object" && token.$value) {
              tokensHSLData[concept][variant][key].$value = tinycolor(token.$value).toHslString();
            } else if (typeof token === "string") {
              tokensHSLData[concept][variant][key] = { $value: tinycolor(token).toHslString(), $type: "color" };
            }
          });
        });
      });
      saveTokensToFile(tokensHSLData, 'hsl', tokensFolder, 'color_tokens_hsl.json');
    }

    if (generateOKLCH) {
      const tokensOKLCHData = JSON.parse(JSON.stringify(tokensData));
      Object.entries(tokensOKLCHData).forEach(([concept, variants]) => {
        Object.entries(variants).forEach(([variant, colors]) => {
          Object.entries(colors).forEach(([key, token]) => {
            if (token && typeof token === "object" && token.$value) {
              tokensOKLCHData[concept][variant][key].$value = oklchConverter.hexToOklchString(token.$value);
            } else if (typeof token === "string") {
              tokensOKLCHData[concept][variant][key] = { $value: oklchConverter.hexToOklchString(token), $type: "color" };
            }
          });
        });
      });
      saveTokensToFile(tokensOKLCHData, 'oklch', tokensFolder, 'color_tokens_oklch.json');
    }

    deleteUnusedFormatFiles({ tokens: tokensFolder, css: cssFolder, scss: scssFolder }, formatChoices);

    saveCSSTokensToFile(tokensData, cssFolder, 'color_variables_hex.css');

    saveSCSSTokensToFile(tokensData, scssFolder, 'color_variables_hex.scss');

    console.log(chalk.black.bgYellowBright("\n======================================="));
    console.log(chalk.bold("➕ EXTRA STEP: ADD MORE COLORS"));
    console.log(chalk.black.bgYellowBright("=======================================\n"));
  
    addMoreColors = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addMoreColors',
        message: "🎨 Would you like to add another color?\n>>>",
        default: false
      }
    ]).then(answers => answers.addMoreColors);
  }

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🔄 CONVERTING COLOR TOKENS TO OTHER FORMATS"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  const convertAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'convert',
      message: 'Would you like to convert the color tokens to other formats (RGB, RGBA, HSL and/or OKLCH)?\n>>>',
      default: false
    }
  ]);

  let formatsAnswer = { formats: [] };
  if (convertAnswer.convert) {
    formatsAnswer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'formats',
        message: 'Please, select the formats you want to use to convert your color tokens (leave empty to skip):\n>>>',
        choices: [
          { name: 'RGB', value: 'rgb' },
          { name: 'RGBA', value: 'rgba' },
          { name: 'HSL', value: 'hsl' },
          { name: 'OKLCH', value: 'oklch' }
        ]
      }
    ]);
  }

  let conversionFormats = { generateRGB: false, generateRGBA: false, generateHSL: false, generateOKLCH: false };

  let updatedFiles = [];
  let savedNewFiles = [];

  const formatPaths = {};

  formatsAnswer.formats.forEach(unit => {
    const formatKey = unit.toUpperCase();
    conversionFormats[`generate${formatKey}`] = true;

    formatPaths[unit] = {
      json: path.join(tokensFolder, `color_tokens_${unit}.json`),
      css: path.join(cssFolder, `color_variables_${unit}.css`),
      scss: path.join(scssFolder, `color_variables_${unit}.scss`)
    };

    const existedBefore = Object.values(formatPaths[unit]).some(fs.existsSync);

    const tokensConverted = convertTokensToFormat(tokensData, formatKey);
    saveTokensToFile(tokensConverted, formatKey, tokensFolder, `color_tokens_${unit}.json`);
    saveCSSTokensToFile(tokensConverted, cssFolder, `color_variables_${unit}.css`);
    saveSCSSTokensToFile(tokensConverted, scssFolder, `color_variables_${unit}.scss`);

    if (existedBefore) {
      updatedFiles.push(...Object.values(formatPaths[unit]));
    } else {
      savedNewFiles.push(...Object.values(formatPaths[unit]));
    }
  });

  const deletedFiles = deleteUnusedFormatFiles(
    { tokens: tokensFolder, css: cssFolder, scss: scssFolder },
    conversionFormats
  );

  const hexPaths = {
    json: path.join(tokensFolder, 'color_tokens_hex.json'),
    css: path.join(cssFolder, 'color_variables_hex.css'),
    scss: path.join(scssFolder, 'color_variables_hex.scss')
  };

  const hexExistence = {
    json: fs.existsSync(hexPaths.json),
    css: fs.existsSync(hexPaths.css),
    scss: fs.existsSync(hexPaths.scss)
  };

  saveTokensToFile(tokensData, "HEX", tokensFolder, "color_tokens_hex.json");
  saveCSSTokensToFile(tokensData, cssFolder, "color_variables_hex.css");
  saveSCSSTokensToFile(tokensData, scssFolder, "color_variables_hex.scss");

  Object.entries(hexExistence).forEach(([key, existed]) => {
    if (existed) {
      updatedFiles.push(hexPaths[key]); 
    } else {
      savedNewFiles.push(hexPaths[key]); 
    }
  });

  await showLoader(chalk.bold.magenta("\n🌈Finalizing your spell"), 1500);

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("📄 OUTPUT FILES"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  console.log(chalk.whiteBright("📂 Files are organized in the following folders:"));
  console.log(chalk.whiteBright("   -> /outputs_files/tokens/color: JSON Token Files"));
  console.log(chalk.whiteBright("   -> /outputs_files/css/color: CSS variables"));
  console.log(chalk.whiteBright("   -> /outputs_files/scss/color: SCSS variables\n"));

  if (updatedFiles.length > 0) {
    console.log(chalk.whiteBright("🆕 Updated:"));
    updatedFiles.forEach(filePath => {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(chalk.whiteBright("   -> " + relativePath));
    });
  }

  if (savedNewFiles.length > 0) {
    console.log(chalk.whiteBright("\n✅ Saved:"));
    savedNewFiles.forEach(filePath => console.log(chalk.whiteBright(`   -> ${path.relative(process.cwd(), filePath)}`)));
  }

  if (deletedFiles.length > 0) {
    console.log(""); 
    console.log(chalk.whiteBright("🗑️ Deleted:"));
    deletedFiles.forEach(filePath => {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(chalk.whiteBright("   -> " + relativePath));
    });
  }

  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("🎉🪄 SPELL COMPLETED"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));

  console.log(
    chalk.bold.whiteBright("Thank you for summoning the ") +
    chalk.bold.yellow("Color Tokens Wizard") +
    chalk.bold.whiteBright("! ❤️🧙🎨\n")
  );
  console.log(chalk.black.bgYellowBright("=======================================\n"));
};

main();