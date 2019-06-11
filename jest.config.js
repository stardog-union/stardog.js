module.exports = {
  roots: ['<rootDir>/test'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};
