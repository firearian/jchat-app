module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: "@typescript-eslint/parser", // if not already added
  plugins: ["solid"],
  extends: ["eslint:recommended", "plugin:solid/typescript"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      tsx: true,
    },
  },
  rules: {},
};
