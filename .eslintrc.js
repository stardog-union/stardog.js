module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: ['prettier'],
  extends: [
    'airbnb-base',
    'prettier',
    'plugin:jest/recommended',
    '@blueprintjs/eslint-config',
    'plugin:prettier/recommended',
  ],
  rules: {
    curly: ['warn', 'all'],
    'header/header': 'off',
    'import/no-mutable-exports': 'off',
    'import/order': 'off',
    'import/prefer-default-export': 'off',
    'jest/expect-expect': ['warn', { assertFunctionNames: ['expect*'] }],
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'no-console': 'warn',
    'no-return-await': 'off',
    'no-underscore-dangle': 'off',
    'object-curly-spacing': 'error',
    'prettier/prettier': 'warn',
    radix: 'off',
    'sort-imports': 'off',

    // TODO remove these:
    'no-unused-vars': 'off',
  },
};
