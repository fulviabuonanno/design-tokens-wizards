// This plugin runs in Figma's sandbox and has access to the Figma API
// Communication with the UI happens via postMessage

const MIN_MIX = 10;
const MAX_MIX = 90;

// Show UI
figma.showUI(__html__, { width: 400, height: 700 });

// Helper: Convert HEX to RGB (Figma format 0-1)
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

// Helper: Convert RGB (0-1) to HEX
function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

// Helper: Mix two colors
function mixColors(color1: RGB, color2: RGB, percentage: number): RGB {
  const amount = percentage / 100;
  return {
    r: color1.r + (color2.r - color1.r) * amount,
    g: color1.g + (color2.g - color1.g) * amount,
    b: color1.b + (color2.b - color1.b) * amount,
  };
}

// Generate color stops - Incremental
function generateStopsIncremental(
  hex: string,
  step: string,
  stopsCount: number,
  startValue: number
): Record<string, string> {
  const stops: Record<string, string> = {};
  const stepNum = parseInt(step);
  const baseRgb = hexToRgb(hex);
  const white = { r: 1, g: 1, b: 1 };
  const black = { r: 0, g: 0, b: 0 };

  for (let i = 0; i < stopsCount; i++) {
    const key = startValue + i * stepNum;
    const ratio = stopsCount === 1 ? 0 : i / (stopsCount - 1);
    let mixPercentage: number;

    if (ratio < 0.5) {
      mixPercentage = MIN_MIX + (1 - ratio * 2) * (MAX_MIX - MIN_MIX);
      const mixed = mixColors(baseRgb, white, mixPercentage);
      stops[key.toString()] = rgbToHex(mixed);
    } else {
      mixPercentage = MIN_MIX + (ratio - 0.5) * 2 * (MAX_MIX - MIN_MIX);
      const mixed = mixColors(baseRgb, black, mixPercentage);
      stops[key.toString()] = rgbToHex(mixed);
    }
  }

  stops['base'] = hex.toUpperCase();
  return stops;
}

// Generate color stops - Ordinal
function generateStopsOrdinal(
  hex: string,
  padded: boolean,
  stopsCount: number
): Record<string, string> {
  const stops: Record<string, string> = {};
  const baseRgb = hexToRgb(hex);
  const white = { r: 1, g: 1, b: 1 };
  const black = { r: 0, g: 0, b: 0 };

  stops['base'] = hex.toUpperCase();

  for (let i = 0; i < stopsCount; i++) {
    const ratio = stopsCount === 1 ? 0 : i / (stopsCount - 1);
    const key = padded ? (i + 1).toString().padStart(2, '0') : (i + 1).toString();

    const mixPercentage =
      ratio < 0.5
        ? MIN_MIX + (1 - ratio * 2) * (MAX_MIX - MIN_MIX)
        : MIN_MIX + (ratio - 0.5) * 2 * (MAX_MIX - MIN_MIX);

    const mixed = mixColors(baseRgb, ratio < 0.5 ? white : black, mixPercentage);
    stops[key] = rgbToHex(mixed);
  }

  return stops;
}

// Generate color stops - Semantic
function generateStopsSemantic(hex: string, stopsCount: number): Record<string, string> {
  const labelMap: Record<number, string[]> = {
    1: ['base'],
    2: ['dark', 'base', 'light'],
    4: ['darker', 'dark', 'base', 'light', 'lighter'],
    6: ['darkest', 'darker', 'dark', 'base', 'light', 'lighter', 'lightest'],
    8: ['ultra-dark', 'darkest', 'darker', 'dark', 'base', 'light', 'lighter', 'lightest', 'ultra-light'],
    10: ['ultra-dark', 'darkest', 'darker', 'dark', 'semi-dark', 'base', 'semi-light', 'light', 'lighter', 'lightest', 'ultra-light'],
  };

  const labels = labelMap[stopsCount] || labelMap[10];
  const stops: Record<string, string> = {};
  const total = labels.length;
  const baseIndex = Math.floor(total / 2);
  const baseRgb = hexToRgb(hex);
  const white = { r: 1, g: 1, b: 1 };
  const black = { r: 0, g: 0, b: 0 };

  for (let i = 0; i < total; i++) {
    if (i === baseIndex) {
      stops[labels[i]] = hex.toUpperCase();
    } else if (i < baseIndex) {
      const mixPercentage = Math.round(MIN_MIX + ((baseIndex - i) / baseIndex) * (MAX_MIX - MIN_MIX));
      const mixed = mixColors(baseRgb, black, mixPercentage);
      stops[labels[i]] = rgbToHex(mixed);
    } else {
      const mixPercentage = Math.round(
        MIN_MIX + ((i - baseIndex) / (total - 1 - baseIndex)) * (MAX_MIX - MIN_MIX)
      );
      const mixed = mixColors(baseRgb, white, mixPercentage);
      stops[labels[i]] = rgbToHex(mixed);
    }
  }

  return stops;
}

// Generate color stops - Alphabetical
function generateStopsAlphabetical(
  hex: string,
  format: string,
  stopsCount: number
): Record<string, string> {
  const stops: Record<string, string> = {};
  const startCharCode = format === 'uppercase' ? 65 : 97;
  const baseRgb = hexToRgb(hex);
  const white = { r: 1, g: 1, b: 1 };
  const black = { r: 0, g: 0, b: 0 };

  stops['base'] = hex.toUpperCase();

  for (let i = 0; i < stopsCount; i++) {
    const key = String.fromCharCode(startCharCode + i);
    const ratio = stopsCount === 1 ? 0 : i / (stopsCount - 1);
    let mixPercentage: number;

    if (ratio < 0.5) {
      mixPercentage = MIN_MIX + (1 - ratio * 2) * (MAX_MIX - MIN_MIX);
      const mixed = mixColors(baseRgb, white, mixPercentage);
      stops[key] = rgbToHex(mixed);
    } else {
      mixPercentage = MIN_MIX + (ratio - 0.5) * 2 * (MAX_MIX - MIN_MIX);
      const mixed = mixColors(baseRgb, black, mixPercentage);
      stops[key] = rgbToHex(mixed);
    }
  }

  return stops;
}

// Main function to generate color stops
function generateColorStops(config: any): Record<string, string> {
  const { hex, scaleType, stopsCount, incrementalOption, startValue, padded, alphabeticalOption } = config;

  switch (scaleType) {
    case 'incremental':
      return generateStopsIncremental(hex, incrementalOption, stopsCount, startValue);
    case 'ordinal':
      return generateStopsOrdinal(hex, padded, stopsCount);
    case 'semanticStops':
      return generateStopsSemantic(hex, stopsCount);
    case 'alphabetical':
      return generateStopsAlphabetical(hex, alphabeticalOption, stopsCount);
    default:
      return generateStopsOrdinal(hex, padded, stopsCount);
  }
}

// Create Figma paint styles
function createFigmaStyles(config: any, stops: Record<string, string>) {
  const { name, category, namingLevel, batchMode, batchColors } = config;
  let createdCount = 0;

  // Helper to create style name
  const buildStyleName = (colorName: string, stopName: string): string => {
    const parts: string[] = [];
    if (category) parts.push(category);
    if (namingLevel) parts.push(namingLevel);
    parts.push(colorName);
    parts.push(stopName);
    return parts.join('/');
  };

  // Create styles for main color
  Object.entries(stops).forEach(([stopName, hex]) => {
    const styleName = buildStyleName(name, stopName);
    const rgb = hexToRgb(hex);

    // Check if style already exists
    const existingStyle = figma.getLocalPaintStyles().find(style => style.name === styleName);

    if (existingStyle) {
      // Update existing style
      existingStyle.paints = [{ type: 'SOLID', color: rgb }];
    } else {
      // Create new style
      const style = figma.createPaintStyle();
      style.name = styleName;
      style.paints = [{ type: 'SOLID', color: rgb }];
    }

    createdCount++;
  });

  // Handle batch colors if enabled
  if (batchMode && batchColors && batchColors.length > 0) {
    batchColors.forEach((batchColor: any) => {
      const batchStops = generateColorStops(Object.assign({}, config, {
        hex: batchColor.hex,
      }));

      Object.entries(batchStops).forEach(([stopName, hex]) => {
        const styleName = buildStyleName(batchColor.name, stopName);
        const rgb = hexToRgb(hex);

        const existingStyle = figma.getLocalPaintStyles().find(style => style.name === styleName);

        if (existingStyle) {
          existingStyle.paints = [{ type: 'SOLID', color: rgb }];
        } else {
          const style = figma.createPaintStyle();
          style.name = styleName;
          style.paints = [{ type: 'SOLID', color: rgb }];
        }

        createdCount++;
      });
    });
  }

  return createdCount;
}

// Export as JSON tokens format
function exportAsJSON(config: any, stops: Record<string, string>): string {
  const { name, category, namingLevel, batchMode, batchColors } = config;

  const tokens: any = {};

  // Helper to set nested value
  const setNestedValue = (obj: any, path: string[], value: any) => {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  };

  // Add main color
  Object.entries(stops).forEach(([stopName, hex]) => {
    const path: string[] = [];
    if (category) path.push(category);
    if (namingLevel) path.push(namingLevel);
    path.push(name);
    path.push(stopName);

    setNestedValue(tokens, path, {
      $value: hex,
      $type: 'color',
    });
  });

  // Add batch colors
  if (batchMode && batchColors && batchColors.length > 0) {
    batchColors.forEach((batchColor: any) => {
      const batchStops = generateColorStops(Object.assign({}, config, {
        hex: batchColor.hex,
      }));

      Object.entries(batchStops).forEach(([stopName, hex]) => {
        const path: string[] = [];
        if (category) path.push(category);
        if (namingLevel) path.push(namingLevel);
        path.push(batchColor.name);
        path.push(stopName);

        setNestedValue(tokens, path, {
          $value: hex,
          $type: 'color',
        });
      });
    });
  }

  return JSON.stringify(tokens, null, 2);
}

// Handle messages from UI
figma.ui.onmessage = (msg) => {
  if (msg.type === 'generate-preview') {
    const stops = generateColorStops(msg.config);
    figma.ui.postMessage({ type: 'preview-generated', stops });
  } else if (msg.type === 'create-styles') {
    const stops = generateColorStops(msg.config);
    const count = createFigmaStyles(msg.config, stops);
    figma.ui.postMessage({ type: 'styles-created', count });
    figma.notify(`✅ Created ${count} color styles!`);
  } else if (msg.type === 'export-json') {
    const stops = msg.stops;
    const config = msg.config || {};
    const json = exportAsJSON(config, stops);
    figma.ui.postMessage({ type: 'json-exported', json });
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};
