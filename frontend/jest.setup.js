import '@testing-library/jest-dom'

// Configure fast-check for ultra-fast execution
const fc = require('fast-check');
fc.configureGlobal({
  numRuns: 1, // Minimal iterations for speed
  timeout: 100, // Very fast timeout
  verbose: false,
  seed: 42, // Fixed seed for reproducibility
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => children,
}))

// Suppress console warnings during tests
const originalConsoleWarn = console.warn
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalConsoleWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalConsoleWarn
})