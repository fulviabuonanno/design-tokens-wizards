/**
 * Shadow generation utilities
 * Handles generation of shadow values and names
 */

import tinycolor from "tinycolor2";
import { SHADOW_PRESETS, INTENSITY_VALUES } from "./constants.js";

/**
 * Generates a unique shadow name with proper type handling
 * @param {string} baseName - Base name for the shadow
 * @param {string} shadowType - Type of shadow ('outer' or 'inner')
 * @param {boolean} includeTypeInName - Whether to include type in name
 * @param {string} tokenName - Token category name
 * @param {Object} existingShadows - Existing shadows to check for conflicts
 * @returns {string} Generated shadow name
 */
export const generateShadowName = (baseName, shadowType, includeTypeInName, tokenName, existingShadows = {}) => {
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

/**
 * Gets default shadow values based on type and intensity
 * @param {string} type - Shadow type ('outer' or 'inner')
 * @param {string} intensity - Intensity level or preset name
 * @returns {Object} Shadow values (x, y, blur, spread, color)
 */
export const getDefaultValues = (type, intensity) => {
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
  const values = INTENSITY_VALUES[intensity] || INTENSITY_VALUES.md;
  return {
    x: values.x,
    y: values.y,
    blur: values.blur,
    spread: values.spread,
    color: tinycolor(baseValues.color).setAlpha(values.opacity).toRgbString()
  };
};

/**
 * Generates a summary of all shadows for display
 * @param {Object} shadows - Shadows object
 * @returns {Array} Array of shadow summaries
 */
export const generateSummary = (shadows) => {
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

/**
 * Generates a preview string for a shadow value
 * @param {Object} shadow - Shadow value object
 * @returns {string} CSS shadow value string
 */
export const generatePreview = (shadow) => {
  const { x, y, blur, spread, color } = shadow;
  const shadowValue = `${x}px ${y}px ${blur}px ${spread}px ${color}`;
  return shadowValue;
};
