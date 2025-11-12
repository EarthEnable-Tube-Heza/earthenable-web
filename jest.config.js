const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/$1',
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/index.ts', // Re-export files
  ],
  coverageThreshold: {
    // Target 80%+ for tested modules (UI components and utilities)
    'src/components/ui/Alert.tsx': {
      branches: 90,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    'src/components/ui/Badge.tsx': {
      branches: 85,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    'src/components/ui/Button.tsx': {
      branches: 85,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    'src/components/ui/Card.tsx': {
      branches: 90,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    'src/components/ui/Input.tsx': {
      branches: 85,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    'src/components/ui/Spinner.tsx': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    'src/components/ui/Toast.tsx': {
      branches: 90,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    'src/lib/theme/utils.ts': {
      branches: 65,
      functions: 100,
      lines: 95,
      statements: 95,
    },
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
