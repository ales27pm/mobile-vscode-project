module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:react/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: ["./tsconfig.json"]
  },
  env: {
    node: true,
    browser: true,
    es6: true
  },
  rules: {
    // Custom ESLint rules (if any)
  }
};
