#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import { argbFromHex, hexFromArgb, TonalPalette } from '@material/material-color-utilities';
import path from 'path';

const versionArg = process.argv.find(arg => arg.startsWith("--version="));
if (versionArg) {
  const version = versionArg.split("=")[1];
  console.log(chalk.bold.whiteBright.bgGray(capitalize(`Material UI Incantation - version ${version}`)));
}

// Define steps for different color types
const defaultSteps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
const neutralSteps = [0, 4, 6, 10, 12, 17, 20, 22, 24, 30, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96, 98, 99, 100];

function generateTonalPalette(baseHex, isNeutral = false) {
  const argb = argbFromHex(baseHex);
  const palette = TonalPalette.fromInt(argb);
  const result = {};
  const steps = isNeutral ? neutralSteps : defaultSteps;
  for (const t of steps) {
    result[t] = hexFromArgb(palette.tone(t));
  }
  return result;
}

function buildColorTokens(name, scale) {
  const obj = {};
  const steps = name === 'neutral' ? neutralSteps : defaultSteps;
  for (const step of steps) {
    obj[step] = {
      value: scale[step],
      type: 'color',
    };
  }
  return obj;
}

function buildCSSVariables(colorName, scale) {
  let css = '';
  const steps = colorName === 'neutral' ? neutralSteps : defaultSteps;
  for (const step of steps) {
    css += `  --md-ref-palette-${colorName}-${step}: ${scale[step]}; /* ${colorName} ${step} */\n`;
  }
  return css;
}

function buildSCSSVariables(colorName, scale) {
  let scss = '';
  const steps = colorName === 'neutral' ? neutralSteps : defaultSteps;
  for (const step of steps) {
    scss += `$md-ref-palette-${colorName}-${step}: ${scale[step]}; // ${colorName} ${step}\n`;
  }
  return scss;
}

async function main() {
  console.clear();
  console.log(chalk.bgBlueBright.bold.white(' 🎨 Design Tokens Wizard - Material You Color Palette '));
  console.log();
  console.log(chalk.black.bgYellowBright("\n======================================="));
  console.log(chalk.bold("📝 COLOR PALETTE SETUP"));
  console.log(chalk.black.bgYellowBright("=======================================\n"));
  console.log(chalk.whiteBright("Define the base hex for your palette colors.\n"));
  console.log(chalk.whiteBright("• PRIMARY: Main color of your palette."));
  console.log(chalk.whiteBright("• SECONDARY, TERTIARY, ERROR: Optionally define these. Leave blank to skip."));
  console.log(chalk.whiteBright("• NEUTRAL, NEUTRAL VARIANT: Useful for backgrounds, surfaces, and borders. Leave blank to skip.\n"));

  const questions = [
    {
      type: 'input',
      name: 'primary',
      message: 'Enter base hex for PRIMARY (e.g. #FABADA):',
      filter: (input) => {
        if (!input) return '';
        if (typeof input === 'string') {
          const trimmed = input.trim();
          if (trimmed.length === 6 && /^[0-9A-Fa-f]{6}$/.test(trimmed)) return '#' + trimmed;
          if (trimmed[0] === '#' && trimmed.length === 7 && /^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
        }
        return input;
      },
      validate: (input) => {
        if (!input) return 'Primary color is required. Please enter a valid hex color like #123ABC';
        return /^#([0-9A-Fa-f]{6})$/.test(input) || 'Please enter a valid hex color like #123ABC';
      },
    },
    {
      type: 'input',
      name: 'secondary',
      message: 'Enter base hex for SECONDARY (or leave blank to skip):',
      filter: (input) => {
        if (!input) return '';
        if (typeof input === 'string') {
          const trimmed = input.trim();
          if (trimmed.length === 6 && /^[0-9A-Fa-f]{6}$/.test(trimmed)) return '#' + trimmed;
          if (trimmed[0] === '#' && trimmed.length === 7 && /^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
        }
        return input;
      },
      validate: (input) => input === '' || /^#([0-9A-Fa-f]{6})$/.test(input) || 'Please enter a valid hex color like #123ABC or leave blank',
    },
    {
      type: 'input',
      name: 'tertiary',
      message: 'Enter base hex for TERTIARY (or leave blank to skip):',
      filter: (input) => {
        if (!input) return '';
        if (typeof input === 'string') {
          const trimmed = input.trim();
          if (trimmed.length === 6 && /^[0-9A-Fa-f]{6}$/.test(trimmed)) return '#' + trimmed;
          if (trimmed[0] === '#' && trimmed.length === 7 && /^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
        }
        return input;
      },
      validate: (input) => input === '' || /^#([0-9A-Fa-f]{6})$/.test(input) || 'Please enter a valid hex color like #123ABC or leave blank',
    },
    {
      type: 'input',
      name: 'error',
      message: 'Enter base hex for ERROR (or leave blank to skip):',
      filter: (input) => {
        if (!input) return '';
        if (typeof input === 'string') {
          const trimmed = input.trim();
          if (trimmed.length === 6 && /^[0-9A-Fa-f]{6}$/.test(trimmed)) return '#' + trimmed;
          if (trimmed[0] === '#' && trimmed.length === 7 && /^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
        }
        return input;
      },
      validate: (input) => input === '' || /^#([0-9A-Fa-f]{6})$/.test(input) || 'Please enter a valid hex color like #123ABC or leave blank',
    },
    {
      type: 'input',
      name: 'neutral',
      message: 'Enter base hex for NEUTRAL (or leave blank to skip):',
      filter: (input) => {
        if (!input) return '';
        if (typeof input === 'string') {
          const trimmed = input.trim();
          if (trimmed.length === 6 && /^[0-9A-Fa-f]{6}$/.test(trimmed)) return '#' + trimmed;
          if (trimmed[0] === '#' && trimmed.length === 7 && /^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
        }
        return input;
      },
      validate: (input) => input === '' || /^#([0-9A-Fa-f]{6})$/.test(input) || 'Please enter a valid hex color like #123ABC or leave blank',
    },
    {
      type: 'input',
      name: 'neutralVariant',
      message: 'Enter base hex for NEUTRAL VARIANT (or leave blank to skip):',
      filter: (input) => {
        if (!input) return '';
        if (typeof input === 'string') {
          const trimmed = input.trim();
          if (trimmed.length === 6 && /^[0-9A-Fa-f]{6}$/.test(trimmed)) return '#' + trimmed;
          if (trimmed[0] === '#' && trimmed.length === 7 && /^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
        }
        return input;
      },
      validate: (input) => input === '' || /^#([0-9A-Fa-f]{6})$/.test(input) || 'Please enter a valid hex color like #123ABC or leave blank',
    },
  ];

  const answers = await inquirer.prompt(questions);

  const palette = {};
  for (const [key, val] of Object.entries(answers)) {
    if (!val) continue;
    const colorKey = key.toLowerCase().replace(/variant/, '-variant');
    const scale = generateTonalPalette(val, colorKey === 'neutral');
    palette[colorKey] = buildColorTokens(colorKey, scale);
  }

  const output = {
    md: {
      ref: {
        palette: palette
      }
    }
  };

  let cssOutput = ':root {\n';
  let scssOutput = '';
  for (const [key, val] of Object.entries(answers)) {
    if (!val) continue;
    const colorKey = key.toLowerCase().replace(/variant/, '-variant');
    const scale = generateTonalPalette(val, colorKey === 'neutral');
    cssOutput += buildCSSVariables(colorKey, scale);
    scssOutput += buildSCSSVariables(colorKey, scale);
  }
  cssOutput += '}\n';

  const outputDir = `output_files/tokens/md`;
  const refDir = `${outputDir}/ref`;
  const sysDir = `${outputDir}/sys`;

  // Create directories if they don't exist
  if (!fs.existsSync(refDir)) {
    fs.mkdirSync(refDir, { recursive: true });
  }
  if (!fs.existsSync(sysDir)) {
    fs.mkdirSync(sysDir, { recursive: true });
  }

  // Write ref files
  fs.writeFileSync(`${refDir}/md-ref-color-tokens.json`, JSON.stringify(output, null, 2));
  fs.writeFileSync(`${refDir}/md-ref-color-variables.css`, cssOutput);
  fs.writeFileSync(`${refDir}/md-ref-color-variables.scss`, scssOutput);

  // Generate system colors
  const sysColorMap = {
    light: {
      primary: `{md.ref.palette.primary.40}`,
      onPrimary: `{md.ref.palette.primary.100}`,
      primaryContainer: `{md.ref.palette.primary.90}`,
      onPrimaryContainer: `{md.ref.palette.primary.30}`,
      primaryFixed: `{md.ref.palette.primary.90}`,
      onPrimaryFixed: `{md.ref.palette.primary.10}`,
      primaryFixedDim: `{md.ref.palette.primary.80}`,
      onPrimaryFixedVariant: `{md.ref.palette.primary.30}`,
      inversePrimary: `{md.ref.palette.primary.80}`,
      background: `{md.ref.palette.neutral.98}`,
      onBackground: `{md.ref.palette.neutral.10}`,
      surface: `{md.ref.palette.neutral.98}`,
      surfaceBright: `{md.ref.palette.neutral.98}`,
      surfaceDim: `{md.ref.palette.neutral.87}`,
      onSurface: `{md.ref.palette.neutral.10}`,
      onSurfaceVariant: `{md.ref.palette.neutral-variant.30}`,
      surfaceContainerLowest: `{md.ref.palette.neutral.100}`,
      surfaceContainerLow: `{md.ref.palette.neutral.96}`,
      surfaceContainer: `{md.ref.palette.neutral.94}`,
      surfaceContainerHigh: `{md.ref.palette.neutral.92}`,
      surfaceContainerHighest: `{md.ref.palette.neutral.90}`,
      surfaceVariant: `{md.ref.palette.neutral-variant.90}`,
      inverseSurface: `{md.ref.palette.neutral.20}`,
      inverseOnSurface: `{md.ref.palette.neutral.95}`,
      shadow: `{md.ref.palette.neutral.0}`,
      scrim: `{md.ref.palette.neutral.0}`,
      surfaceTint: `{md.ref.palette.primary.40}`,
      outline: `{md.ref.palette.neutral-variant.50}`,
      outlineVariant: `{md.ref.palette.neutral-variant.80}`,
      error: `{md.ref.palette.error.40}`,
      onError: `{md.ref.palette.error.100}`,
      errorContainer: `{md.ref.palette.error.90}`,
      onErrorContainer: `{md.ref.palette.error.30}`,
      secondary: `{md.ref.palette.secondary.40}`,
      onSecondary: `{md.ref.palette.secondary.100}`,
      secondaryContainer: `{md.ref.palette.secondary.90}`,
      onSecondaryContainer: `{md.ref.palette.secondary.30}`,
      tertiary: `{md.ref.palette.tertiary.40}`,
      onTertiary: `{md.ref.palette.tertiary.100}`,
      tertiaryContainer: `{md.ref.palette.tertiary.90}`,
      onTertiaryContainer: `{md.ref.palette.tertiary.30}`,
      secondaryFixed: `{md.ref.palette.secondary.90}`,
      onSecondaryFixed: `{md.ref.palette.secondary.10}`,
      secondaryFixedDim: `{md.ref.palette.secondary.80}`,
      onSecondaryFixedVariant: `{md.ref.palette.secondary.30}`,
      tertiaryFixed: `{md.ref.palette.tertiary.90}`,
      onTertiaryFixed: `{md.ref.palette.tertiary.10}`,
      tertiaryFixedDim: `{md.ref.palette.tertiary.80}`,
      onTertiaryFixedVariant: `{md.ref.palette.tertiary.30}`,
      surfaceTintColor: `{md.ref.palette.primary.40}`
    },
    dark: {
      primary: `{md.ref.palette.primary.80}`,
      onPrimary: `{md.ref.palette.primary.20}`,
      primaryContainer: `{md.ref.palette.primary.30}`,
      onPrimaryContainer: `{md.ref.palette.primary.90}`,
      primaryFixed: `{md.ref.palette.primary.90}`,
      onPrimaryFixed: `{md.ref.palette.primary.10}`,
      primaryFixedDim: `{md.ref.palette.primary.80}`,
      onPrimaryFixedVariant: `{md.ref.palette.primary.30}`,
      inversePrimary: `{md.ref.palette.primary.80}`,
      background: `{md.ref.palette.neutral.6}`,
      onBackground: `{md.ref.palette.neutral.90}`,
      surface: `{md.ref.palette.neutral.6}`,
      surfaceBright: `{md.ref.palette.neutral.24}`,
      surfaceDim: `{md.ref.palette.neutral.6}`,
      onSurface: `{md.ref.palette.neutral.90}`,
      onSurfaceVariant: `{md.ref.palette.neutral-variant.80}`,
      surfaceContainerLowest: `{md.ref.palette.neutral.4}`,
      surfaceContainerLow: `{md.ref.palette.neutral.10}`,
      surfaceContainer: `{md.ref.palette.neutral.12}`,
      surfaceContainerHigh: `{md.ref.palette.neutral.17}`,
      surfaceContainerHighest: `{md.ref.palette.neutral.22}`,
      surfaceVariant: `{md.ref.palette.neutral-variant.30}`,
      inverseSurface: `{md.ref.palette.neutral.90}`,
      inverseOnSurface: `{md.ref.palette.neutral.20}`,
      shadow: `{md.ref.palette.neutral.0}`,
      scrim: `{md.ref.palette.neutral.0}`,
      surfaceTint: `{md.ref.palette.primary.80}`,
      outline: `{md.ref.palette.neutral-variant.60}`,
      outlineVariant: `{md.ref.palette.neutral-variant.30}`,
      error: `{md.ref.palette.error.80}`,
      onError: `{md.ref.palette.error.20}`,
      errorContainer: `{md.ref.palette.error.30}`,
      onErrorContainer: `{md.ref.palette.error.90}`,
      secondary: `{md.ref.palette.secondary.80}`,
      onSecondary: `{md.ref.palette.secondary.20}`,
      secondaryContainer: `{md.ref.palette.secondary.30}`,
      onSecondaryContainer: `{md.ref.palette.secondary.90}`,
      tertiary: `{md.ref.palette.tertiary.80}`,
      onTertiary: `{md.ref.palette.tertiary.20}`,
      tertiaryContainer: `{md.ref.palette.tertiary.30}`,
      onTertiaryContainer: `{md.ref.palette.tertiary.90}`,
      secondaryFixed: `{md.ref.palette.secondary.90}`,
      onSecondaryFixed: `{md.ref.palette.secondary.10}`,
      secondaryFixedDim: `{md.ref.palette.secondary.80}`,
      onSecondaryFixedVariant: `{md.ref.palette.secondary.30}`,
      tertiaryFixed: `{md.ref.palette.tertiary.90}`,
      onTertiaryFixed: `{md.ref.palette.tertiary.10}`,
      tertiaryFixedDim: `{md.ref.palette.tertiary.80}`,
      onTertiaryFixedVariant: `{md.ref.palette.tertiary.30}`,
      surfaceTintColor: `{md.ref.palette.primary.80}`
    }
  };

  // Generate system color tokens
  const sysColorTokens = {
    md: {
      sys: {
        light: {},
        dark: {}
      }
    }
  };

  // Group colors by category
  const colorGroups = {
    'primary-colors': [
      'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
      'primaryFixed', 'onPrimaryFixed', 'primaryFixedDim', 'onPrimaryFixedVariant',
      'inversePrimary'
    ],
    'surface-colors': [
      'background', 'onBackground', 'surface', 'surfaceBright', 'surfaceDim',
      'onSurface', 'onSurfaceVariant', 'surfaceContainerLowest', 'surfaceContainerLow',
      'surfaceContainer', 'surfaceContainerHigh', 'surfaceContainerHighest',
      'surfaceVariant', 'inverseSurface', 'inverseOnSurface', 'shadow', 'scrim',
      'surfaceTint', 'surfaceTintColor'
    ],
    'outline-colors': [
      'outline', 'outlineVariant'
    ],
    'error-colors': [
      'error', 'onError', 'errorContainer', 'onErrorContainer'
    ],
    'secondary-colors': [
      'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
      'secondaryFixed', 'onSecondaryFixed', 'secondaryFixedDim', 'onSecondaryFixedVariant'
    ],
    'tertiary-colors': [
      'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
      'tertiaryFixed', 'onTertiaryFixed', 'tertiaryFixedDim', 'onTertiaryFixedVariant'
    ]
  };

  // Process each mode (light/dark)
  for (const mode in sysColorMap) {
    const modeColors = sysColorMap[mode];

    // Create groups and add colors to their respective groups
    for (const [groupName, colorKeys] of Object.entries(colorGroups)) {
      const groupColors = {};
      for (const colorKey of colorKeys) {
        if (modeColors[colorKey]) {
          groupColors[colorKey] = {
            value: modeColors[colorKey],
            type: 'color'
          };
        }
      }
      if (Object.keys(groupColors).length > 0) {
        sysColorTokens.md.sys[mode][groupName] = groupColors;
      }
    }
  }

  // Generate CSS variables for system colors
  let sysCss = ':root {\n';
  for (const mode in sysColorMap) {
    sysCss += `\n  /* ${mode} mode */\n`;
    for (const [groupName, colorKeys] of Object.entries(colorGroups)) {
      for (const colorKey of colorKeys) {
        if (sysColorMap[mode][colorKey]) {
          const colorValue = sysColorMap[mode][colorKey];
          const match = colorValue.match(/^\{md\.ref\.palette\.([a-zA-Z0-9\-]+)\.(\d+)\}$/);
          if (match) {
            const [_, color, step] = match;
            sysCss += `  --md-sys-${mode}-${colorKey}: var(--md-ref-palette-${color}-${step});\n`;
          }
        }
      }
    }
  }
  sysCss += '}\n';

  // Generate SCSS variables for system colors
  let sysScss = '';
  for (const mode in sysColorMap) {
    sysScss += `// ${mode} mode\n`;
    for (const [groupName, colorKeys] of Object.entries(colorGroups)) {
      for (const colorKey of colorKeys) {
        if (sysColorMap[mode][colorKey]) {
          const colorValue = sysColorMap[mode][colorKey];
          const match = colorValue.match(/^\{md\.ref\.palette\.([a-zA-Z0-9\-]+)\.(\d+)\}$/);
          if (match) {
            const [_, color, step] = match;
            sysScss += `$md-sys-${mode}-${colorKey}: $md-ref-palette-${color}-${step};\n`;
          }
        }
      }
    }
    sysScss += '\n';
  }

  // Debug logging
  console.log(chalk.yellow('Debug: Generated content lengths:'));
  console.log(chalk.yellow(`CSS content length: ${sysCss.length}`));
  console.log(chalk.yellow(`SCSS content length: ${sysScss.length}`));
  console.log(chalk.yellow('First few lines of CSS:'));
  console.log(chalk.yellow(sysCss.split('\n').slice(0, 5).join('\n')));
  console.log(chalk.yellow('First few lines of SCSS:'));
  console.log(chalk.yellow(sysScss.split('\n').slice(0, 5).join('\n')));

  // Ensure the sys directory exists
  if (!fs.existsSync(sysDir)) {
    fs.mkdirSync(sysDir, { recursive: true });
  }

  // Write system color files
  try {
    // Write JSON file
    fs.writeFileSync(
      path.join(sysDir, 'md-sys-color-tokens.json'),
      JSON.stringify(sysColorTokens, null, 2)
    );

    // Write CSS file
    fs.writeFileSync(
      path.join(sysDir, 'md-sys-color-variables.css'),
      sysCss
    );

    // Write SCSS file
    fs.writeFileSync(
      path.join(sysDir, 'md-sys-color-variables.scss'),
      sysScss
    );

    console.log(chalk.green(`✅ Files generated:`));
    console.log(chalk.yellow(`  Ref files at ${refDir}:`));
    console.log(chalk.yellow(`    • md-ref-color-tokens.json`));
    console.log(chalk.yellow(`    • md-ref-color-variables.css`));
    console.log(chalk.yellow(`    • md-ref-color-variables.scss`));
    console.log(chalk.cyan(`  Sys files at ${sysDir}:`));
    console.log(chalk.cyan(`    • md-sys-color-tokens.json`));
    console.log(chalk.cyan(`    • md-sys-color-variables.css`));
    console.log(chalk.cyan(`    • md-sys-color-variables.scss`));
  } catch (error) {
    console.error(chalk.red('Error generating system color files:'), error);
    console.error(chalk.red('Error details:'), {
      sysDir,
      error: error.message,
      stack: error.stack
    });
  }

  console.log();
  console.log(chalk.green.bold('✅  Color tokens generated!'));
  console.log();
}

main();
