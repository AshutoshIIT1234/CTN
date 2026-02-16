// Ultra-fast test configuration for development
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const fastConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 2000, // Fast but reasonable timeout
  maxWorkers: 1, // Single worker for fastest startup
  bail: true, // Stop on first failure
  silent: true, // Minimal output
  verbose: false,
  collectCoverage: false,
  // Only run essential component tests
  testMatch: [
    '**/components/**/*.test.(ts|tsx)',
  ],
  // Skip slow integration and e2e tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '.*\\.integration\\.(test|spec)\\.(ts|tsx)$',
    '.*\\.e2e\\.(test|spec)\\.(ts|tsx)$',
  ],
};

module.exports = createJestConfig(fastConfig);