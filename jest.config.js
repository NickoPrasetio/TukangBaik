/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'babel-jest',
      { configFile: './babel.config.test.js' },
    ],
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss)$': '<rootDir>/src/__tests__/__mocks__/styleMock.ts',
    '\\.(jpg|jpeg|png|gif|svg|ico)$': '<rootDir>/src/__tests__/__mocks__/fileMock.ts',
    '^leaflet$': '<rootDir>/src/__tests__/__mocks__/leaflet.ts',
    '^react-leaflet$': '<rootDir>/src/__tests__/__mocks__/reactLeaflet.tsx',
  },

  testMatch: ['<rootDir>/src/__tests__/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  transformIgnorePatterns: [
    'node_modules/(?!(msw|@mswjs|@bundled-es-modules)/)',
  ],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**',
    '!src/components/providers/**',
    '!src/data/indonesian-cities.ts',
    '!src/__tests__/**',
  ],
};

module.exports = config;
