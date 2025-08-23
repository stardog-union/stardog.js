/** @type {import('jest').Config} */
module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
  testRegex: 'test/cluster/.+\\.spec\\.js$',
};
