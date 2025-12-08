/**
 * Constants for shadow token generation
 * Contains all shadow presets, color presets, and naming options
 */

/**
 * Shadow presets for different naming approaches
 * Each preset contains x, y, blur, spread, and opacity values
 */
export const SHADOW_PRESETS = {
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

/**
 * Color presets for light and dark themes
 */
export const COLOR_PRESETS = {
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

/**
 * Get naming options based on the selected approach
 * @param {string} approach - The naming approach
 * @returns {string[]} Array of naming options
 */
export const getNamingOptions = (approach) => {
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

/**
 * Intensity-based values for T-shirt sizing
 */
export const INTENSITY_VALUES = {
  xs: { x: 0, y: 1, blur: 2, spread: 0, opacity: 0.1 },
  sm: { x: 0, y: 2, blur: 4, spread: 0, opacity: 0.15 },
  md: { x: 0, y: 4, blur: 8, spread: 0, opacity: 0.2 },
  lg: { x: 0, y: 8, blur: 16, spread: 0, opacity: 0.25 },
  xl: { x: 0, y: 12, blur: 24, spread: 0, opacity: 0.3 },
  '2xl': { x: 0, y: 16, blur: 32, spread: 0, opacity: 0.35 }
};
