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
    es6: true,
    jest: true
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    "no-undef": "off",
    "no-unused-vars": "off",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }
    ]
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx", "**/__mocks__/**/*.{ts,tsx}"]
    }
  ]
};
