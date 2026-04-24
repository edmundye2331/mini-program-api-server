module.exports = {
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
  testEnvironment: 'node',
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/logs/**',
    '!**/cert/**',
    '!**/scripts/**',
    '!**/database/**',
    '!**/docs/**',
    '!**/examples/**',
    '!**/public/**',
  ],
};
