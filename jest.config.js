/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testPathIgnorePatterns: ['fixtures'],
  watchPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/public/build/'],
  setupFiles: ['./__tests__/fixtures/envSetup'],

  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.jsx?$': '$1',
    '^.+\\.module\\.css$': 'identity-obj-proxy',
  },

  transform: {
    '^.+\\.tsx?$': ['@swc/jest', { jsc: { transform: { react: { runtime: 'automatic' } } } }],
    '^.+\\.jsx?$': ['@swc/jest', { jsc: { transform: { react: { runtime: 'automatic' } } } }],
  },
};
