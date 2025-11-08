// This plugin runs in Figma's sandbox and has access to the Figma API
// Communication with the UI happens via postMessage

const MIN_MIX = 10;
const MAX_MIX = 90;
const MAX_STOPS = 20;
const MIN_STOPS = 1;

// Show UI with resize enabled
figma.showUI(__html__, {
  width: 420,
  height: 740,
  themeColors: true,
  title: 'Design Tokens Wizard'
});

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

  // Enforce stops limit
  const validStopsCount = Math.max(MIN_STOPS, Math.min(MAX_STOPS, stopsCount));

  switch (scaleType) {
    case 'incremental':
      return generateStopsIncremental(hex, incrementalOption, validStopsCount, startValue);
    case 'ordinal':
      return generateStopsOrdinal(hex, padded, validStopsCount);
    case 'semanticStops':
      return generateStopsSemantic(hex, validStopsCount);
    case 'alphabetical':
      return generateStopsAlphabetical(hex, alphabeticalOption, validStopsCount);
    default:
      return generateStopsOrdinal(hex, padded, validStopsCount);
  }
}

// Helper to create token name
function buildTokenName(colorName: string, stopName: string, category?: string, namingLevel?: string): string {
  const parts: string[] = [];
  if (category) parts.push(category);
  if (namingLevel) parts.push(namingLevel);
  parts.push(colorName);
  parts.push(stopName);
  return parts.join('/');
}

// Create Figma paint styles
function createFigmaStyles(config: any, stops: Record<string, string>) {
  const { name, category, namingLevel, batchMode, batchColors } = config;
  let createdCount = 0;

  // Create styles for main color
  Object.entries(stops).forEach(([stopName, hex]) => {
    const styleName = buildTokenName(name, stopName, category, namingLevel);
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
        const styleName = buildTokenName(batchColor.name, stopName, category, namingLevel);
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

// Create Figma variables
function createFigmaVariables(config: any, stops: Record<string, string>) {
  const { name, category, namingLevel, batchMode, batchColors } = config;
  let createdCount = 0;

  // Get or create a collection
  const collectionName = category || 'Color Tokens';
  let collection = figma.variables.getLocalVariableCollections().find(c => c.name === collectionName);

  if (!collection) {
    collection = figma.variables.createVariableCollection(collectionName);
  }

  // Create variables for main color
  Object.entries(stops).forEach(([stopName, hex]) => {
    const variableName = buildTokenName(name, stopName, undefined, namingLevel);
    const rgb = hexToRgb(hex);

    // Convert RGB to RGBA for variables
    const rgba = { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 };

    // Check if variable already exists in this collection
    const existingVariable = figma.variables.getLocalVariables().find(
      v => v.name === variableName && v.variableCollectionId === collection.id
    );

    if (existingVariable) {
      // Update existing variable
      existingVariable.setValueForMode(collection.modes[0].modeId, rgba);
    } else {
      // Create new variable
      const variable = figma.variables.createVariable(variableName, collection, 'COLOR');
      variable.setValueForMode(collection.modes[0].modeId, rgba);
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
        const variableName = buildTokenName(batchColor.name, stopName, undefined, namingLevel);
        const rgb = hexToRgb(hex);
        const rgba = { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 };

        const existingVariable = figma.variables.getLocalVariables().find(
          v => v.name === variableName && v.variableCollectionId === collection.id
        );

        if (existingVariable) {
          existingVariable.setValueForMode(collection.modes[0].modeId, rgba);
        } else {
          const variable = figma.variables.createVariable(variableName, collection, 'COLOR');
          variable.setValueForMode(collection.modes[0].modeId, rgba);
        }

        createdCount++;
      });
    });
  }

  return createdCount;
}

// Export as JSON tokens format (Design Tokens W3C)
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

// Export as Tokens Studio JSON format
function exportAsTokensStudio(config: any, stops: Record<string, string>): string {
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
      value: hex,
      type: 'color',
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
          value: hex,
          type: 'color',
        });
      });
    });
  }

  return JSON.stringify(tokens, null, 2);
}

// Handle messages from UI
figma.ui.onmessage = (msg) => {
  if (msg.type === 'generate-preview') {
    const { batchMode, batchColors } = msg.config;

    if (batchMode && batchColors && batchColors.length > 0) {
      // Generate stops for all batch colors
      const allStops: Record<string, Record<string, string>> = {};

      batchColors.forEach((batchColor: any) => {
        const batchConfig = Object.assign({}, msg.config, {
          hex: batchColor.hex,
        });
        const stops = generateColorStops(batchConfig);
        allStops[batchColor.name] = stops;
      });

      figma.ui.postMessage({ type: 'preview-generated', stops: allStops, batchMode: true });
    } else {
      // Single color mode
      const stops = generateColorStops(msg.config);
      figma.ui.postMessage({ type: 'preview-generated', stops, batchMode: false });
    }
  } else if (msg.type === 'create-tokens') {
    const stops = generateColorStops(msg.config);
    const format = msg.config.outputFormat || 'styles';

    if (format === 'styles') {
      const count = createFigmaStyles(msg.config, stops);
      figma.ui.postMessage({ type: 'tokens-created', format: 'styles', count });
      figma.notify(`✅ Created ${count} color styles!`);
    } else if (format === 'variables') {
      const count = createFigmaVariables(msg.config, stops);
      figma.ui.postMessage({ type: 'tokens-created', format: 'variables', count });
      figma.notify(`✅ Created ${count} color variables!`);
    } else if (format === 'both') {
      const stylesCount = createFigmaStyles(msg.config, stops);
      const variablesCount = createFigmaVariables(msg.config, stops);
      figma.ui.postMessage({
        type: 'tokens-created',
        format: 'both',
        stylesCount,
        variablesCount
      });
      figma.notify(`✅ Created ${stylesCount} styles and ${variablesCount} variables!`);
    } else if (format === 'tokens-studio') {
      const json = exportAsTokensStudio(msg.config, stops);
      figma.ui.postMessage({ type: 'tokens-created', format: 'tokens-studio', json });
    }
  } else if (msg.type === 'export-json') {
    const stops = msg.stops;
    const config = msg.config || {};
    const json = exportAsJSON(config, stops);
    figma.ui.postMessage({ type: 'json-exported', json });
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};
