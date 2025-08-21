module.exports = {
  arrowParens: 'always',
  overrides: [
    {
      files: '*.scss',
      options: { parser: 'scss' },
    },
    {
      files: '*.tsx?',
      options: { parser: 'typescript' },
    },
    {
      files: '*.jsx?',
      options: { parser: 'babel' },
    },
  ],
  singleQuote: true,
  trailingComma: 'es5',
};
