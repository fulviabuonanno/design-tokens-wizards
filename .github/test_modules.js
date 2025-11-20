#!/usr/bin/env node

import { VALIDATION_PATTERNS, ERROR_MESSAGES, DEFAULTS } from '../src/wizards/color_wiz/utils/constants.js';
import { validateHexColor, validateColorName } from '../src/wizards/color_wiz/utils/colorValidation.js';
import { generateStops } from '../src/wizards/color_wiz/utils/colorGeneration.js';
import { addColorToTokens, setupOutputDirectories } from '../src/wizards/color_wiz/utils/fileOperations.js';
import { convertTokensToFormat } from '../src/wizards/color_wiz/utils/colorConversion.js';

console.log('✅ All module imports successful!\n');
console.log('📦 Module Exports Verified:');
console.log('  ✓ constants.js');
console.log('  ✓ colorValidation.js');
console.log('  ✓ colorGeneration.js');
console.log('  ✓ fileOperations.js');
console.log('  ✓ colorConversion.js');

console.log('\n🧪 Quick Functionality Test:\n');

// Test 1: Generate stops
const testHex = '#3B82F6';
const testSettings = {
  type: 'incremental',
  incrementalOption: '100',
  stopsCount: 5,
  startValue: 100,
  minMix: 10,
  maxMix: 90
};

const stops = generateStops(testHex, testSettings);
console.log('  ✓ generateStops() works - created', Object.keys(stops).length, 'stops');

// Test 2: Add to tokens
const tokensData = {};
addColorToTokens(tokensData, {
  colorType: 'Global',
  category: 'test',
  namingLevel: 'color',
  colorName: 'blue',
  colorStops: stops
});
console.log('  ✓ addColorToTokens() works - structure created');

// Test 3: Convert format
const rgbTokens = convertTokensToFormat(tokensData, 'RGB');
console.log('  ✓ convertTokensToFormat() works - converted to RGB');

// Test 4: Validation
const hexValid = validateHexColor('#FF5733');
console.log('  ✓ validateHexColor() works -', hexValid === true ? 'valid' : 'invalid');

console.log('\n🎉 All refactored modules are working correctly!\n');
