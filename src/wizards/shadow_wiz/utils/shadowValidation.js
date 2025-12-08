/**
 * Shadow validation utilities
 * Handles validation of shadow property values
 */

/**
 * Validates shadow values against acceptable ranges
 * @param {Object} values - Shadow values to validate
 * @param {number} values.blur - Blur radius
 * @param {number} values.spread - Spread radius
 * @param {number} values.opacity - Opacity value
 * @returns {string[]} Array of validation error messages (empty if valid)
 */
export const validateShadowValues = (values) => {
  const errors = [];

  if (values.blur < 0 || values.blur > 100) {
    errors.push('Blur radius must be between 0 and 100 pixels');
  }

  if (values.spread < -50 || values.spread > 50) {
    errors.push('Spread radius must be between -50 and 50 pixels');
  }

  if (values.opacity < 0 || values.opacity > 1) {
    errors.push('Opacity must be between 0 and 1');
  }

  return errors;
};
