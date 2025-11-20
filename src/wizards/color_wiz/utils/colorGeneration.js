import tinycolor from "tinycolor2";
import { DEFAULTS, SEMANTIC_ORDER } from "./constants.js";

// Memoization cache for color mixing operations
const colorMixCache = new Map();

// Export for backward compatibility
const MIN_MIX = DEFAULTS.MIN_MIX_PERCENTAGE;
const MAX_MIX = DEFAULTS.MAX_MIX_PERCENTAGE;
const semanticOrder = SEMANTIC_ORDER;

/**
 * Memoized version of tinycolor.mix() to cache repeated color calculations
 * @param {string} color1 - First color (hex string)
 * @param {string} color2 - Second color (hex string, typically "white" or "black")
 * @param {number} percentage - Mix percentage (0-100)
 * @returns {string} - Resulting hex color (uppercase)
 */
const memoizedColorMix = (color1, color2, percentage) => {
  // Create cache key from parameters
  const cacheKey = `${color1}|${color2}|${percentage}`;

  // Check if result exists in cache
  if (colorMixCache.has(cacheKey)) {
    return colorMixCache.get(cacheKey);
  }

  // Calculate color mix
  const result = tinycolor.mix(color1, color2, percentage).toHexString().toUpperCase();

  // Store in cache
  colorMixCache.set(cacheKey, result);

  return result;
};

/**
 * Clears the color mix cache
 * Should be called when starting a new session or to free memory
 */
export const clearColorMixCache = () => {
  colorMixCache.clear();
};

/**
 * Generates incremental color stops (e.g., 100, 200, 300...)
 * @param {string} hex - Base color hex value
 * @param {Object} config - Configuration object
 * @param {string} config.step - Step increment ('10', '25', '50', '100')
 * @param {number} config.stopsCount - Number of stops to generate
 * @param {number} config.startValue - Starting value (default: 100)
 * @param {number} config.minMix - Minimum mix percentage
 * @param {number} config.maxMix - Maximum mix percentage
 * @returns {Object} - Object with stop names as keys and hex values
 */
export const generateStopsIncremental = (hex, {
  step = '50',
  stopsCount = 10,
  startValue = 100,
  minMix = MIN_MIX,
  maxMix = MAX_MIX
} = {}) => {
  const stops = {};
  const stepNum = parseInt(step);
  const startNum = parseInt(startValue) || 100;
  for (let i = 0; i < stopsCount; i++) {
    const key = startNum + (i * stepNum);
    const ratio = stopsCount === 1 ? 0 : i / (stopsCount - 1);
    let mixPercentage;
    if (ratio < 0.5) {
      mixPercentage = minMix + (1 - ratio * 2) * (maxMix - minMix);
      stops[key] = memoizedColorMix(hex, "white", mixPercentage);
    } else {
      mixPercentage = minMix + ((ratio - 0.5) * 2) * (maxMix - minMix);
      stops[key] = memoizedColorMix(hex, "black", mixPercentage);
    }
  }
  stops["base"] = tinycolor(hex).toHexString().toUpperCase();
  return stops;
};

/**
 * Generates ordinal color stops (e.g., 1, 2, 3... or 01, 02, 03...)
 * @param {string} hex - Base color hex value
 * @param {Object} config - Configuration object
 * @param {boolean} config.padded - Whether to pad numbers with zeros
 * @param {number} config.stopsCount - Number of stops to generate
 * @param {number} config.minMix - Minimum mix percentage
 * @param {number} config.maxMix - Maximum mix percentage
 * @returns {Object} - Object with stop names as keys and hex values
 */
export const generateStopsOrdinal = (hex, {
  padded = true,
  stopsCount = 10,
  minMix = MIN_MIX,
  maxMix = MAX_MIX
} = {}) => {
  const stops = {};

  stops["base"] = tinycolor(hex).toHexString().toUpperCase();

  for (let i = 0; i < stopsCount; i++) {
    const ratio = stopsCount === 1 ? 0 : i / (stopsCount - 1);
    const key = padded ? String(i + 1).padStart(2, '0') : String(i + 1);

    const mixPercentage = ratio < 0.5
      ? minMix + (1 - ratio * 2) * (maxMix - minMix)
      : minMix + ((ratio - 0.5) * 2) * (maxMix - minMix);
    stops[key] = memoizedColorMix(hex, ratio < 0.5 ? "white" : "black", mixPercentage);
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

/**
 * Generates semantic color stops (e.g., dark, base, light...)
 * @param {string} hex - Base color hex value
 * @param {Object} config - Configuration object
 * @param {number} config.stopsCount - Number of stops (1, 2, 4, 6, 8, 10)
 * @param {number} config.minMix - Minimum mix percentage
 * @param {number} config.maxMix - Maximum mix percentage
 * @returns {Object} - Object with stop names as keys and hex values
 */
export const generateStopsSemantic = (hex, {
  stopsCount,
  minMix = MIN_MIX,
  maxMix = MAX_MIX
} = {}) => {
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

  for (let i = 0; i < total; i++) {
    if (i === baseIndex) {
      stops[labels[i]] = tinycolor(hex).toHexString().toUpperCase();
    } else if (i < baseIndex) {
      const mixPercentage = Math.round(
        minMix + ((baseIndex - i) / baseIndex) * (maxMix - minMix)
      );
      stops[labels[i]] = memoizedColorMix(hex, "black", mixPercentage);
    } else {
      const mixPercentage = Math.round(
        minMix + ((i - baseIndex) / (total - 1 - baseIndex)) * (maxMix - minMix)
      );
      stops[labels[i]] = memoizedColorMix(hex, "white", mixPercentage);
    }
  }
  return stops;
};

/**
 * Generates alphabetical color stops (e.g., A, B, C... or a, b, c...)
 * @param {string} hex - Base color hex value
 * @param {Object} config - Configuration object
 * @param {string} config.format - 'uppercase' or 'lowercase'
 * @param {number} config.stopsCount - Number of stops to generate
 * @param {number} config.minMix - Minimum mix percentage
 * @param {number} config.maxMix - Maximum mix percentage
 * @returns {Object} - Object with stop names as keys and hex values
 */
export const generateStopsAlphabetical = (hex, {
  format = 'uppercase',
  stopsCount = 10,
  minMix = MIN_MIX,
  maxMix = MAX_MIX
} = {}) => {
  const stops = {};
  const startCharCode = format === 'uppercase' ? 65 : 97;

  stops["base"] = tinycolor(hex).toHexString().toUpperCase();

  for (let i = 0; i < stopsCount; i++) {
    const key = String.fromCharCode(startCharCode + i);
    const ratio = stopsCount === 1 ? 0 : i / (stopsCount - 1);
    let mixPercentage;
    if (ratio < 0.5) {
      mixPercentage = minMix + (1 - ratio * 2) * (maxMix - minMix);
      stops[key] = memoizedColorMix(hex, "white", mixPercentage);
    } else {
      mixPercentage = minMix + ((ratio - 0.5) * 2) * (maxMix - minMix);
      stops[key] = memoizedColorMix(hex, "black", mixPercentage);
    }
  }
  return stops;
};

/**
 * Calculates middle keys based on scale type
 * @param {Object} stops - The color stops object
 * @param {Object} scaleSettings - The scale settings
 * @returns {Array} - Array of middle key names
 */
export const calculateMiddleKeys = (stops, scaleSettings) => {
  const stopKeys = Object.keys(stops).filter(k => k !== "base");
  const middleKeys = [];

  if (stopKeys.length === 0) {
    return middleKeys;
  }

  if (scaleSettings.type === "incremental" || scaleSettings.type === "ordinal") {
    const numericKeys = stopKeys.map(Number).sort((a, b) => a - b);
    if (numericKeys.length % 2 === 1) {
      middleKeys.push(String(numericKeys[Math.floor(numericKeys.length / 2)]));
    } else {
      middleKeys.push(
        String(numericKeys[numericKeys.length / 2 - 1]),
        String(numericKeys[numericKeys.length / 2])
      );
    }
  } else if (scaleSettings.type === "alphabetical") {
    const alphaKeys = stopKeys.sort();
    if (alphaKeys.length % 2 === 1) {
      middleKeys.push(alphaKeys[Math.floor(alphaKeys.length / 2)]);
    } else {
      middleKeys.push(
        alphaKeys[alphaKeys.length / 2 - 1],
        alphaKeys[alphaKeys.length / 2]
      );
    }
  } else if (scaleSettings.type === "semanticStops") {
    const ordered = stopKeys.slice().sort((a, b) => semanticOrder.indexOf(a) - semanticOrder.indexOf(b));
    if (ordered.length % 2 === 1) {
      middleKeys.push(ordered[Math.floor(ordered.length / 2)]);
    } else {
      middleKeys.push(
        ordered[ordered.length / 2 - 1],
        ordered[ordered.length / 2]
      );
    }
  }

  return middleKeys;
};

/**
 * Factory function to generate stops based on scale settings
 * Eliminates repeated if-else chains throughout the codebase
 * @param {string} hex - Base color hex value
 * @param {Object} scaleSettings - Scale configuration object
 * @returns {Object} - Generated color stops
 */
export const generateStops = (hex, scaleSettings) => {
  const generators = {
    incremental: () => generateStopsIncremental(hex, {
      step: scaleSettings.incrementalOption,
      stopsCount: scaleSettings.stopsCount,
      startValue: scaleSettings.startValue,
      minMix: scaleSettings.minMix,
      maxMix: scaleSettings.maxMix
    }),
    semanticStops: () => generateStopsSemantic(hex, {
      stopsCount: scaleSettings.stopsCount,
      minMix: scaleSettings.minMix,
      maxMix: scaleSettings.maxMix
    }),
    alphabetical: () => generateStopsAlphabetical(hex, {
      format: scaleSettings.alphabeticalOption,
      stopsCount: scaleSettings.stopsCount,
      minMix: scaleSettings.minMix,
      maxMix: scaleSettings.maxMix
    }),
    ordinal: () => generateStopsOrdinal(hex, {
      padded: scaleSettings.padded,
      stopsCount: scaleSettings.stopsCount,
      minMix: scaleSettings.minMix,
      maxMix: scaleSettings.maxMix
    })
  };

  const generator = generators[scaleSettings.type] || generators.ordinal;
  return generator();
};

export { MIN_MIX, MAX_MIX, semanticOrder };
