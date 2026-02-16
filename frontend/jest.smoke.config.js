// Smoke test configuration - only critical tests
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const smokeConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 1000, // Very fast timeout
  maxWorkers: 1, // Single worker
  bail: true, // Stop on first failure
  silent: true, // Minimal output
  verbose: false,
  collectCoverage: false,
  // Run only one critical test
  testMatch: [
    '**/components/layout/MainLayout.test.tsx',
  ],
  // Skip everything else
  testPathIgnorePatterns: [
    '/node_modules/',
    '.*\\.integration\\.(test|spec)\\.(ts|tsx)$',
    '.*\\.e2e\\.(test|spec)\\.(ts|tsx)$',
  ],
};

module.exports = createJestConfig(smokeConfig);