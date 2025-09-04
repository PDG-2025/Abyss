module.exports = {
  root: true,
  extends: ['@react-native-community', 'prettier'], // base RN + désactive règles en conflit
  plugins: ['prettier', 'testing-library'],
  env: { 'jest/globals': true },
  rules: {
    'prettier/prettier': ['error'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'testing-library/no-debugging-utils': 'warn',
    'testing-library/no-node-access': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/'],
};
