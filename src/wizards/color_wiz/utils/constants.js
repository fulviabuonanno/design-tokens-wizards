/**
 * Constants and configuration values for the color wizard
 */

// Validation patterns
export const VALIDATION_PATTERNS = {
  COLOR_NAME: /^[a-zA-Z0-9.-]*$/,
  HEX_COLOR: /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
};

// Default values
export const DEFAULTS = {
  STOPS_COUNT: 10,
  MIN_STOPS: 1,
  MAX_STOPS: 20,
  MIN_MIX_PERCENTAGE: 10,
  MAX_MIX_PERCENTAGE: 90,
  INCREMENTAL_STEP: '100',
  INCREMENTAL_START: 100,
  LOADER_DURATION: 1500
};

// File paths and names
export const FILE_NAMES = {
  TOKENS: {
    HEX: 'color_tokens_hex.json',
    RGB: 'color_tokens_rgb.json',
    RGBA: 'color_tokens_rgba.json',
    HSL: 'color_tokens_hsl.json',
    OKLCH: 'color_tokens_oklch.json'
  },
  CSS: {
    HEX: 'color_variables_hex.css',
    RGB: 'color_variables_rgb.css',
    RGBA: 'color_variables_rgba.css',
    HSL: 'color_variables_hsl.css',
    OKLCH: 'color_variables_oklch.css'
  },
  SCSS: {
    HEX: 'color_variables_hex.scss',
    RGB: 'color_variables_rgb.scss',
    RGBA: 'color_variables_rgba.scss',
    HSL: 'color_variables_hsl.scss',
    OKLCH: 'color_variables_scss.scss'
  }
};

// Output directory structure
export const OUTPUT_DIRS = {
  BASE: 'output_files',
  TOKENS: 'tokens/json/color',
  CSS: 'tokens/css/color',
  SCSS: 'tokens/scss/color'
};

// Semantic ordering for color stops
export const SEMANTIC_ORDER = [
  "ultra-dark", "darkest", "darker", "dark",
  "semi-dark", "base", "semi-light", "light",
  "lighter", "lightest", "ultra-light"
];

// Scale type options
export const SCALE_TYPES = {
  INCREMENTAL: 'incremental',
  ORDINAL: 'ordinal',
  ALPHABETICAL: 'alphabetical',
  SEMANTIC: 'semanticStops'
};

// Category presets
export const CATEGORY_PRESETS = [
   'core',
  'global',
   'primitives',
  'foundation',
  'basics',
  'essentials',
  'roots',
  'custom'
];

// Naming level presets
export const NAMING_LEVEL_PRESETS = [
  'color',
  'colour',
  'palette',
  'scheme',
  'custom'
];

// Incremental step options
export const INCREMENTAL_STEPS = [
  { name: "100 in 100 (e.g., 100, 200, 300, 400)", value: '100' },
  { name: "50 in 50 (e.g., 50, 100, 150, 200)", value: '50' },
  { name: "25 in 25 (e.g., 25, 50, 75, 100)", value: '25' },
  { name: "10 in 10 (e.g., 10, 20, 30, 40)", value: '10' }
];

// Semantic stops count options
export const SEMANTIC_STOPS_OPTIONS = [1, 2, 4, 6, 8, 10];

// Color format choices
export const COLOR_FORMATS = {
  RGB: 'rgb',
  RGBA: 'rgba',
  HSL: 'hsl',
  OKLCH: 'oklch'
};

// Error messages
export const ERROR_MESSAGES = {
  EMPTY_COLOR_NAME: "Please provide a name for your color. This field cannot be empty.",
  INVALID_COLOR_NAME: "Name should only contain letters, numbers, hyphens, and dots.",
  DUPLICATE_COLOR_NAME: (name) => `A color with the name "${name}" already exists. Please choose a different name.`,
  DUPLICATE_BATCH_COLOR: (name) => `You've already added a color with the name "${name}". Please choose a different name.`,
  INVALID_HEX: "Invalid HEX color. Please provide a valid HEX color (e.g., #FF5733 or FF5733).",
  EMPTY_HEX: "Please provide a HEX color value.",
  INVALID_STOPS_RANGE: "Enter a number between 1 and 20.",
  INVALID_PERCENTAGE: "Enter a number between 0 and 100."
};

// Warning messages
export const WARNING_MESSAGES = {
  MIN_MIX_ZERO: "\n⚠️  Warning: Using 0% will result in pure white/black colors at the extremes.",
  MAX_MIX_HUNDRED: "\n⚠️  Warning: Using 100% will result in pure white/black colors at the extremes."
};

// UI messages
export const UI_MESSAGES = {
  WELCOME: "\n✨ Welcome to the Color Tokens Wizard! 🧙✨ Ready to sprinkle some color magic into your design system? Let's create beautiful color tokens together!",
  FIGMA_INFO: "\n\n🎨 Your tokens will be ready to sync with JSON format for Tokens Studio in Figma in a snap! 🌟 And here's the magical bonus: you'll get SCSS and CSS files to bring your color tokens to life! ✨",
  START_OVER: "\nNo problem! Let's start over 🧩 since you didn't confirm to move forward with the nomenclature.",
  BATCH_NOTE: (count) => `\n💡 Note: All ${count} colors will use the same scale configuration.`,
  PROCESSING_COLORS: (count) => `🎨 PROCESSING ${count} ADDITIONAL COLOR${count > 1 ? 'S' : ''}`,
  SUCCESS_PROCESSED: (total, additional) => `\n✅ Successfully processed ${total} color${additional > 0 ? 's' : ''} with the same scale settings!\n`
};

// Color scale presets
export const COLOR_SCALE_PRESETS = {
  // Popular frameworks
  tailwind: {
    name: 'Tailwind CSS',
    description: 'Tailwind CSS v3 color system (50-950)',
    type: 'incremental',
    incrementalOption: '100',
    startValue: 50,
    stopsCount: 10,
    minMix: 10,
    maxMix: 90,
    includeBase: false
  },

  material: {
    name: 'Material Design',
    description: 'Material Design color palette (100-900)',
    type: 'incremental',
    incrementalOption: '100',
    startValue: 100,
    stopsCount: 9,
    minMix: 12,
    maxMix: 88,
    includeBase: false
  },

  bootstrap: {
    name: 'Bootstrap',
    description: 'Bootstrap 5 color system (100-900)',
    type: 'incremental',
    incrementalOption: '100',
    startValue: 100,
    stopsCount: 9,
    minMix: 15,
    maxMix: 85,
    includeBase: false
  },

  chakra: {
    name: 'Chakra UI',
    description: 'Chakra UI color scales (50-950)',
    type: 'incremental',
    incrementalOption: '100',
    startValue: 50,
    stopsCount: 10,
    minMix: 10,
    maxMix: 90,
    includeBase: false
  },

  // Component libraries
  ant: {
    name: 'Ant Design',
    description: 'Ant Design color palette (1-10)',
    type: 'ordinal',
    padded: false,
    stopsCount: 10,
    minMix: 10,
    maxMix: 90,
    includeBase: true
  },

  mantine: {
    name: 'Mantine UI',
    description: 'Mantine color system (0-9)',
    type: 'ordinal',
    padded: false,
    stopsCount: 10,
    minMix: 8,
    maxMix: 92,
    includeBase: false
  },

  radix: {
    name: 'Radix Colors',
    description: 'Radix UI color scale (01-12)',
    type: 'ordinal',
    padded: true,
    stopsCount: 12,
    minMix: 5,
    maxMix: 95,
    includeBase: false
  },

  // Enterprise systems
  carbon: {
    name: 'IBM Carbon',
    description: 'Carbon Design System (10-100)',
    type: 'incremental',
    incrementalOption: '10',
    startValue: 10,
    stopsCount: 10,
    minMix: 5,
    maxMix: 95,
    includeBase: false
  },

  spectrum: {
    name: 'Adobe Spectrum',
    description: 'Adobe Spectrum colors (100-1400)',
    type: 'incremental',
    incrementalOption: '100',
    startValue: 100,
    stopsCount: 14,
    minMix: 12,
    maxMix: 88,
    includeBase: false
  },

  // Minimal scales
  fiveShades: {
    name: 'Five Shades',
    description: 'Minimal 5-stop scale (100-500)',
    type: 'incremental',
    incrementalOption: '100',
    startValue: 100,
    stopsCount: 5,
    minMix: 20,
    maxMix: 80,
    includeBase: false
  },

  sevenShades: {
    name: 'Seven Shades',
    description: 'Balanced 7-stop scale (100-700)',
    type: 'incremental',
    incrementalOption: '100',
    startValue: 100,
    stopsCount: 7,
    minMix: 15,
    maxMix: 85,
    includeBase: false
  },

  // Semantic scales
  simpleSemantic: {
    name: 'Simple Semantic',
    description: 'Basic semantic scale (dark, base, light)',
    type: 'semanticStops',
    stopsCount: 2,
    minMix: 25,
    maxMix: 75,
    includeBase: true
  },

  extendedSemantic: {
    name: 'Extended Semantic',
    description: 'Full semantic range (10 variations)',
    type: 'semanticStops',
    stopsCount: 10,
    minMix: 10,
    maxMix: 90,
    includeBase: true
  },

  // Alphabetical
  alphabeticalTen: {
    name: 'Alphabetical A-J',
    description: '10-stop alphabetical scale (A-J)',
    type: 'alphabetical',
    alphabeticalOption: 'uppercase',
    stopsCount: 10,
    minMix: 10,
    maxMix: 90,
    includeBase: false
  }
};

// Preset categories for organization
export const PRESET_CATEGORIES = {
  popular: {
    name: '🔥 Popular Frameworks',
    description: 'Industry-standard design systems',
    presets: ['tailwind', 'material', 'bootstrap', 'chakra']
  },
  components: {
    name: '🧩 Component Libraries',
    description: 'UI component library scales',
    presets: ['ant', 'mantine', 'radix']
  },
  enterprise: {
    name: '🏢 Enterprise Systems',
    description: 'Enterprise design systems',
    presets: ['carbon', 'spectrum']
  },
  minimal: {
    name: '🎨 Minimal Scales',
    description: 'Simple, focused color scales',
    presets: ['fiveShades', 'sevenShades', 'simpleSemantic', 'extendedSemantic']
  },
  other: {
    name: '📝 Other Formats',
    description: 'Alternative naming schemes',
    presets: ['alphabeticalTen']
  }
};
