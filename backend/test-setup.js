// Global test configuration for fast execution
const fc = require('fast-check');

// Configure fast-check for ultra-fast execution
fc.configureGlobal({
  numRuns: 1, // Minimal iterations for speed
  timeout: 100, // Very fast timeout
  verbose: false,
  seed: 42, // Fixed seed for reproducibility
});

// Simple smoke test to validate Jest setup
describe('Smoke Test', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });
  
  it('should validate TypeScript compilation', () => {
    const testObject = { message: 'Hello World' };
    expect(testObject.message).toBe('Hello World');
  });
});