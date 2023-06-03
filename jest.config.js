/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testPathIgnorePatterns: ['fixtures'],
  watchPathIgnorePatterns: ['<rootDir>/\\.next/'],
  setupFiles: ['./__tests__/fixtures/envSetup'],

  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.jsx?$': '$1',
    '^.+\\.module\\.css$': 'identity-obj-proxy',
  },

  transform: {
    '^.+\\.tsx?$': ['@swc/jest', { jsc: { transform: { react: { runtime: 'automatic' } } } }],
  },
};
