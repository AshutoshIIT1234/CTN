// Ultra-fast test configuration for development
const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  testTimeout: 2000, // Fast timeout but not too aggressive
  maxWorkers: 1, // Single worker for fastest startup
  bail: 1, // Stop on first failure
  silent: true, // Minimal output
  verbose: false,
  collectCoverage: false,
  // Remove testRegex to avoid conflict
  testRegex: undefined,
  // Run only essential fast tests
  testMatch: [
    '**/auth/**/*.spec.ts',
    '**/college/**/*.spec.ts',
  ],
  // Skip slow integration tests - fixed regex patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '.*\\.integration\\.(test|spec)\\.ts$',
    '.*\\.e2e\\.(test|spec)\\.ts$',
  ],
};