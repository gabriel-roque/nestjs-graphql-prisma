/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': path.join(__dirname, '../src/', '$1'),
    '^test/(.*)$': path.join(__dirname, '../test', '$1'),
  },
};
