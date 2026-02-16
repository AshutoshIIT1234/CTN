module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Performance optimizations
  testTimeout: 5000, // Reduced from default 10s to 5s
  maxWorkers: '50%', // Use half of available CPU cores
  cache: true,
  cacheDirectory: '<rootDir>/../.jest-cache',
  // Skip coverage collection during development
  collectCoverage: false,
  // Faster test execution
  verbose: false,
  silent: false,
};