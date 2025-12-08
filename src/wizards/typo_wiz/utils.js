import chalk from 'chalk';
import Table from 'cli-table3';

export async function showLoader(message, duration) {
  console.log(message);
  return new Promise(resolve => setTimeout(resolve, duration));
}

export function createSettingsTable(rows) {
  const table = new Table({
    head: [chalk.bold("Setting"), chalk.bold("Option")],
    style: { head: ["red"], border: ["red"] }
  });

  rows.forEach(row => table.push(row));
  return table.toString();
}

export function createValuesTable(values) {
  const table = new Table({
    head: [chalk.bold("Token Name"), chalk.bold("Value")],
    style: { head: ["red"], border: ["red"] }
  });

  Object.entries(values).forEach(([name, data]) => {
    const value = typeof data === 'object' && data.$value ? data.$value : data;
    table.push([name, value]);
  });

  return table.toString();
}

export function convertToUnit(value, unit) {
  if (unit === 'px') {
    return parseFloat(value.toFixed(2)).toString();
  } else if (unit === 'rem' || unit === 'em') {
    const converted = (value / 16).toFixed(2);
    return parseFloat(converted).toString();
  }
  return parseFloat(value.toFixed(2)).toString();
}

export function calculateSizes(scaleInfo, numSizes) {
  const sizes = [];
  const MIN_FONT_SIZE = 12;

  if (scaleInfo.method === 'grid4' || scaleInfo.method === 'grid8' || scaleInfo.method === 'custom') {
    const baseSize = Math.max(scaleInfo.base, MIN_FONT_SIZE);
    const step = scaleInfo.step;
    const halfSizes = Math.floor(numSizes / 2);
    const remainingSizes = numSizes - halfSizes;

    for (let i = halfSizes; i > 0; i--) {
      const size = Math.max(baseSize - (i * step), MIN_FONT_SIZE);
      sizes.push(convertToUnit(size, scaleInfo.unit));
    }

    sizes.push(convertToUnit(baseSize, scaleInfo.unit));

    for (let i = 1; i < remainingSizes; i++) {
      const size = baseSize + (i * step);
      sizes.push(convertToUnit(size, scaleInfo.unit));
    }
  } else if (scaleInfo.method === 'modular') {
    const baseSize = Math.max(scaleInfo.base, MIN_FONT_SIZE);
    const ratio = scaleInfo.ratio;
    const halfSizes = Math.floor(numSizes / 2);
    const remainingSizes = numSizes - halfSizes;

    for (let i = halfSizes; i > 0; i--) {
      const size = Math.max(baseSize / Math.pow(ratio, i), MIN_FONT_SIZE);
      sizes.push(convertToUnit(size, scaleInfo.unit));
    }

    sizes.push(convertToUnit(baseSize, scaleInfo.unit));

    for (let i = 1; i < remainingSizes; i++) {
      const size = baseSize * Math.pow(ratio, i);
      sizes.push(convertToUnit(size, scaleInfo.unit));
    }
  } else if (scaleInfo.method === 'fibonacci') {
    const baseSize = Math.max(scaleInfo.base, MIN_FONT_SIZE);
    const ratio = scaleInfo.ratio; // Golden Ratio (1.618)

    // Generate Fibonacci sequence
    let current = baseSize;
    sizes.push(convertToUnit(current, scaleInfo.unit));

    for (let i = 1; i < numSizes; i++) {
      current *= ratio;
      sizes.push(convertToUnit(current, scaleInfo.unit));
    }
  }

  return sizes;
}

export function getDescriptiveName(setting, value) {
  if (setting === 'namingConvention') {
    if (value === 'tshirt') return 'T-shirt size';
    if (value === 'incremental') return 'Incremental';
    if (value === 'ordinal') return 'Ordinal';
    if (value === 'alphabetical') return 'Alphabetical';
    return value;
  }

  if (setting === 'scaleType') {
    if (value === '4') return '4-Point Grid System';
    if (value === '8') return '8-Point Grid System';
    if (value === 'modular') return 'Modular Scale';
    if (value === 'custom') return 'Custom Intervals';
    if (value === 'fibonacci') return 'Fibonacci Scale';
    return value;
  }

  return value;
}

export function generateCSSVariables(tokenObj, prefix) {
  let cssLines = [];
  let cssClasses = [];
  const tshirtOrder = [
    "3xs", "2xs", "xs", "sm", "md", "lg", "xl",
    "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl",
    "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"
  ];

  function resolveTokenReference(ref) {
    // Resolve token references like {typography.fontFamily.primary}
    if (typeof ref === 'string' && ref.startsWith('{') && ref.endsWith('}')) {
      const path = ref.slice(1, -1).split('.');
      // Join with hyphens to create variable name like --typography-fontFamily-primary
      return `var(--${path.join('-')})`;
    }
    return ref;
  }

  function process(obj, currentPrefix = "") {
    let keys = Object.keys(obj);
    if (keys.length) {
      const allNumeric = keys.every(k => /^\d+$/.test(k));
      const allTshirt = keys.every(k => tshirtOrder.includes(k));
      if (allNumeric) {
        keys = keys.map(Number).sort((a, b) => a - b).map(String);
      } else if (allTshirt) {
        keys = keys.sort((a, b) => tshirtOrder.indexOf(a) - tshirtOrder.indexOf(b));
      } else {
        keys = keys.sort((a, b) => a.localeCompare(b));
      }
      for (const key of keys) {
        if (obj[key] && typeof obj[key] === 'object' && '$value' in obj[key]) {
          const value = obj[key].$value;
          // Handle composite tokens (objects) by creating utility classes
          if (typeof value === 'object' && value !== null) {
            const className = `.${currentPrefix}${key}`.replace(/--/g, '-');
            let classContent = [];

            if (value.fontFamily) {
              const resolved = resolveTokenReference(value.fontFamily);
              // Only add if it's not referencing a null token
              if (!resolved.includes('null')) {
                classContent.push(`  font-family: ${resolved};`);
              }
            }
            if (value.fontSize) {
              const resolved = resolveTokenReference(value.fontSize);
              if (!resolved.includes('null')) {
                classContent.push(`  font-size: ${resolved};`);
              }
            }
            if (value.fontWeight) {
              const resolved = resolveTokenReference(value.fontWeight);
              if (!resolved.includes('null')) {
                classContent.push(`  font-weight: ${resolved};`);
              }
            }
            if (value.lineHeight) {
              const resolved = resolveTokenReference(value.lineHeight);
              if (!resolved.includes('null')) {
                classContent.push(`  line-height: ${resolved};`);
              }
            }
            if (value.letterSpacing) {
              const resolved = resolveTokenReference(value.letterSpacing);
              if (!resolved.includes('null')) {
                classContent.push(`  letter-spacing: ${resolved};`);
              }
            }

            if (classContent.length > 0) {
              cssClasses.push(`${className} {\n${classContent.join('\n')}\n}`);
            }
          } else {
            cssLines.push(`  --${currentPrefix}${key}: ${value};`);
          }
        } else {
          process(obj[key], `${currentPrefix}${key}-`);
        }
      }
    }
  }
  process(tokenObj, prefix);

  let output = `:root {\n${cssLines.join('\n')}\n}`;
  if (cssClasses.length > 0) {
    output += '\n\n/* Typography Composite Tokens as Utility Classes */\n' + cssClasses.join('\n\n');
  }
  return output;
}

export function generateSCSSVariables(tokenObj, prefix) {
  let scss = '';
  let scssMixins = [];
  const tshirtOrder = [
    "3xs", "2xs", "xs", "sm", "md", "lg", "xl",
    "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl",
    "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"
  ];

  function resolveTokenReference(ref) {
    // Resolve token references like {typography.fontFamily.primary}
    if (typeof ref === 'string' && ref.startsWith('{') && ref.endsWith('}')) {
      const path = ref.slice(1, -1).split('.');
      // Join with hyphens to create variable name like $typography-fontFamily-primary
      return `$${path.join('-')}`;
    }
    return ref;
  }

  function process(obj, currentPrefix = "") {
    let keys = Object.keys(obj);
    if (keys.length) {
      const allNumeric = keys.every(k => /^\d+$/.test(k));
      const allTshirt = keys.every(k => tshirtOrder.includes(k));
      if (allNumeric) {
        keys = keys.map(Number).sort((a, b) => a - b).map(String);
      } else if (allTshirt) {
        keys = keys.sort((a, b) => tshirtOrder.indexOf(a) - tshirtOrder.indexOf(b));
      } else {
        keys = keys.sort((a, b) => a.localeCompare(b));
      }
      for (const key of keys) {
        if (obj[key] && typeof obj[key] === 'object' && '$value' in obj[key]) {
          const value = obj[key].$value;
          // Handle composite tokens (objects) by creating mixins
          if (typeof value === 'object' && value !== null) {
            const mixinName = `${currentPrefix}${key}`.replace(/^-+/, '');
            let mixinContent = [];

            if (value.fontFamily) {
              const resolved = resolveTokenReference(value.fontFamily);
              // Only add if it's not referencing a null token
              if (!resolved.includes('null')) {
                mixinContent.push(`  font-family: ${resolved};`);
              }
            }
            if (value.fontSize) {
              const resolved = resolveTokenReference(value.fontSize);
              if (!resolved.includes('null')) {
                mixinContent.push(`  font-size: ${resolved};`);
              }
            }
            if (value.fontWeight) {
              const resolved = resolveTokenReference(value.fontWeight);
              if (!resolved.includes('null')) {
                mixinContent.push(`  font-weight: ${resolved};`);
              }
            }
            if (value.lineHeight) {
              const resolved = resolveTokenReference(value.lineHeight);
              if (!resolved.includes('null')) {
                mixinContent.push(`  line-height: ${resolved};`);
              }
            }
            if (value.letterSpacing) {
              const resolved = resolveTokenReference(value.letterSpacing);
              if (!resolved.includes('null')) {
                mixinContent.push(`  letter-spacing: ${resolved};`);
              }
            }

            if (mixinContent.length > 0) {
              scssMixins.push(`@mixin ${mixinName} {\n${mixinContent.join('\n')}\n}`);
            }
          } else {
            scss += `$${currentPrefix}${key}: ${value};\n`;
          }
        } else {
          process(obj[key], `${currentPrefix}${key}-`);
        }
      }
    }
  }
  process(tokenObj, prefix);

  if (scssMixins.length > 0) {
    scss += '\n// Typography Composite Tokens as Mixins\n' + scssMixins.join('\n\n');
  }
  return scss;
}

export function sortKeysForJSON(obj) {
  const tshirtOrder = [
    "3xs", "2xs", "xs", "sm", "md", "lg", "xl",
    "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl",
    "9xl", "10xl", "11xl", "12xl", "13xl", "14xl", "15xl"
  ];
  let keys = Object.keys(obj);
  const allNumeric = keys.every(k => /^\d+$/.test(k));
  const allTshirt = keys.every(k => tshirtOrder.includes(k));
  if (allNumeric) {
    keys = keys.map(Number).sort((a, b) => a - b).map(String);
  } else if (allTshirt) {
    keys = keys.sort((a, b) => tshirtOrder.indexOf(a) - tshirtOrder.indexOf(b));
  } else {
    keys = keys.sort((a, b) => a.localeCompare(b));
  }
  const sortedObj = {};
  for (const key of keys) {
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      sortedObj[key] = sortKeysForJSON(obj[key]);
    } else {
      sortedObj[key] = obj[key];
    }
  }
  return sortedObj;
}

export function convertLetterSpacing(value, fromUnit, toUnit) {
  // Convert to px first (base unit)
  let pxValue;
  switch (fromUnit) {
    case 'rem':
      pxValue = parseFloat(value) * 16;
      break;
    case 'em':
      pxValue = parseFloat(value) * 16;
      break;
    case '%':
      pxValue = (parseFloat(value) / 100) * 16;
      break;
    case 'px':
      pxValue = parseFloat(value);
      break;
    default:
      return value; // Return original value if fromUnit is unknown
  }

  // Convert from px to target unit
  switch (toUnit) {
    case 'rem':
    case 'em':
      const convertedValue = (pxValue / 16).toFixed(2);
      return convertedValue.replace(/\.?0+$/, '');
    case '%':
      return ((pxValue / 16) * 100).toFixed(2);
    case 'px':
      return pxValue.toString();
    default:
      return value; // Return original value if toUnit is unknown
  }
}
