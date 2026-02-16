// Minimal test configuration - fastest possible execution
const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  testTimeout: 500, // Ultra-fast timeout
  maxWorkers: 1, // Single worker
  bail: 1, // Stop on first failure
  silent: true, // Minimal output
  verbose: false,
  collectCoverage: false,
  // Remove testRegex to avoid conflict
  testRegex: undefined,
  // Run only one critical test
  testMatch: [
    '**/auth/auth.service.spec.ts',
  ],
  // Skip everything else - fixed regex patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '.*\\.integration\\.(test|spec)\\.ts$',
    '.*\\.e2e\\.(test|spec)\\.ts$',
    '.*/post/.*',
    '.*/resource/.*',
    '.*/moderator/.*',
    '.*/admin/.*',
    '.*/college/.*',
  ],
  // Reduce property test iterations even further
  setupFilesAfterEnv: ['<rootDir>/../test-setup.js'],
};