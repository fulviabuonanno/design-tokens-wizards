/**
 * Shadow conversion utilities
 * Handles conversion of shadow tokens to CSS and SCSS formats
 */

/**
 * Converts shadow tokens to CSS custom properties
 * @param {Object} tokens - Shadow tokens object
 * @returns {string} CSS string with custom properties
 */
export const convertTokensToCSS = (tokens) => {
  let css = ':root {\n';
  const processTokens = (obj, prefix = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      if (value && typeof value === "object" && "$value" in value) {
        const shadow = value.$value;
        const cssVar = `--${prefix}${key}`.replace(/\./g, '-');
        const shadowType = shadow.type === 'innerShadow' ? 'inset ' : '';
        const shadowValue = `${shadowType}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
        css += `  ${cssVar}: ${shadowValue};\n`;
      } else if (value && typeof value === "object") {
        processTokens(value, `${prefix}${key}-`);
      }
    });
  };
  processTokens(tokens);
  css += '}\n';
  return css;
};

/**
 * Converts shadow tokens to SCSS variables
 * @param {Object} tokens - Shadow tokens object
 * @returns {string} SCSS string with variables
 */
export const convertTokensToSCSS = (tokens) => {
  let scss = '';
  const processTokens = (obj, prefix = "") => {
    Object.entries(obj).forEach(([key, value]) => {
      if (value && typeof value === "object" && "$value" in value) {
        const shadow = value.$value;
        const scssVar = `$${prefix}${key}`.replace(/\./g, '-');
        const shadowType = shadow.type === 'innerShadow' ? 'inset ' : '';
        const shadowValue = `${shadowType}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
        scss += `${scssVar}: ${shadowValue};\n`;
      } else if (value && typeof value === "object") {
        processTokens(value, `${prefix}${key}-`);
      }
    });
  };
  processTokens(tokens);
  return scss;
};
