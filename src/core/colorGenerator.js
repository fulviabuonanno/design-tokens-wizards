/**
 * Core color generation module
 * Shared between CLI wizard and Figma plugin
 */

// Color mixing constants
export const MIN_MIX = 10;
export const MAX_MIX = 90;

// Semantic color scale order
export const SEMANTIC_ORDER = [
  "ultra-dark", "darkest", "darker", "dark",
  "semi-dark", "base", "semi-light", "light",
  "lighter", "lightest", "ultra-light"
];

/**
 * Generate incremental color stops (e.g., 100, 200, 300)
 * @param {string} hex - Base color in HEX format
 * @param {string} step - Step size ('10', '25', '50', '100')
 * @param {number} stopsCount - Number of stops to generate
 * @param {number} startValue - Starting value for scale
 * @param {object} tinycolor - Tinycolor instance
 * @returns {object} Object mapping stop names to HEX values
 */
export const generateStopsIncremental = (hex, step = '50', stopsCount = 10, startValue = 100, tinycolor) => {
  const stops = {};
  const stepNum = parseInt(step);
  const startNum = parseInt(startValue) || 100;

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

/**
 * Generate ordinal color stops (e.g., 1, 2, 3 or 01, 02, 03)
 * @param {string} hex - Base color in HEX format
 * @param {boolean} padded - Whether to pad numbers with zeros
 * @param {number} stopsCount - Number of stops to generate
 * @param {object} tinycolor - Tinycolor instance
 * @returns {object} Object mapping stop names to HEX values
 */
export const generateStopsOrdinal = (hex, padded = true, stopsCount = 10, tinycolor) => {
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

/**
 * Generate semantic color stops (e.g., light, base, dark)
 * @param {string} hex - Base color in HEX format
 * @param {number} stopsCount - Number of stops to generate
 * @param {object} tinycolor - Tinycolor instance
 * @returns {object} Object mapping stop names to HEX values
 */
export const generateStopsSemantic = (hex, stopsCount, tinycolor) => {
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

/**
 * Generate alphabetical color stops (e.g., A, B, C or a, b, c)
 * @param {string} hex - Base color in HEX format
 * @param {string} format - 'uppercase' or 'lowercase'
 * @param {number} stopsCount - Number of stops to generate
 * @param {object} tinycolor - Tinycolor instance
 * @returns {object} Object mapping stop names to HEX values
 */
export const generateStopsAlphabetical = (hex, format = 'uppercase', stopsCount = 10, tinycolor) => {
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

/**
 * Calculate middle keys for a given scale type
 * @param {object} stops - Color stops object
 * @param {string} scaleType - Type of scale
 * @returns {array} Array of middle key names
 */
export const calculateMiddleKeys = (stops, scaleType) => {
  let stopKeys = Object.keys(stops).filter(k => k !== "base");
  let middleKeys = [];

  if (stopKeys.length === 0) return middleKeys;

  if (scaleType === "incremental" || scaleType === "ordinal") {
    let numericKeys = stopKeys.map(Number).sort((a, b) => a - b);
    if (numericKeys.length % 2 === 1) {
      middleKeys = [String(numericKeys[Math.floor(numericKeys.length / 2)])];
    } else {
      middleKeys = [
        String(numericKeys[numericKeys.length / 2 - 1]),
        String(numericKeys[numericKeys.length / 2])
      ];
    }
  } else if (scaleType === "alphabetical") {
    let alphaKeys = stopKeys.sort();
    if (alphaKeys.length % 2 === 1) {
      middleKeys = [alphaKeys[Math.floor(alphaKeys.length / 2)]];
    } else {
      middleKeys = [
        alphaKeys[alphaKeys.length / 2 - 1],
        alphaKeys[alphaKeys.length / 2]
      ];
    }
  } else if (scaleType === "semanticStops") {
    let ordered = stopKeys.slice().sort((a, b) => SEMANTIC_ORDER.indexOf(a) - SEMANTIC_ORDER.indexOf(b));
    if (ordered.length % 2 === 1) {
      middleKeys = [ordered[Math.floor(ordered.length / 2)]];
    } else {
      middleKeys = [
        ordered[ordered.length / 2 - 1],
        ordered[ordered.length / 2]
      ];
    }
  }

  return middleKeys;
};

/**
 * Convert hex to RGB components
 * @param {string} hex - HEX color
 * @returns {object} RGB components {r, g, b}
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
};

/**
 * Generate color stops based on configuration
 * @param {object} config - Configuration object
 * @returns {object} Generated color stops
 */
export const generateColorStops = (config, tinycolor) => {
  const { hex, scaleType, stopsCount, padded, incrementalOption, startValue, alphabeticalOption } = config;

  switch (scaleType) {
    case "incremental":
      return generateStopsIncremental(hex, incrementalOption, stopsCount, startValue, tinycolor);
    case "ordinal":
      return generateStopsOrdinal(hex, padded, stopsCount, tinycolor);
    case "semanticStops":
      return generateStopsSemantic(hex, stopsCount, tinycolor);
    case "alphabetical":
      return generateStopsAlphabetical(hex, alphabeticalOption, stopsCount, tinycolor);
    default:
      return generateStopsOrdinal(hex, padded, stopsCount, tinycolor);
  }
};
