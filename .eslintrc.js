module.exports = {
  root: true,
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    sourceType: "module",
    babelOptions: {
      presets: [
        require.resolve("babel-preset-expo"),
        require.resolve("metro-react-native-babel-preset"),
      ],
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:react-native/all",
  ],
  ignorePatterns: [
    "**/*.test.js",
    "**/*.spec.js",
    "**/__tests__/**",
    "**/tests/**",
    "jest.config.js",
    "node_modules/",
    "__mocks__/",
  ],
  plugins: ["react", "react-native", "import"],
  env: {
    "react-native/react-native": true,
  },
  rules: {
    quotes: ["off"],
    "import/no-commonjs": "off",
    "import/namespace": "off",
    "react-native/no-inline-styles": "off",
    "react-native/no-color-literals": "off",
    "react-native/sort-styles": "off",
    "react/display-name": "off",
    "react/no-unescaped-entities": "off",
    "react-native/split-platform-components": "off",
    "no-unused-vars": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  overrides: [
    {
      files: ["jest.setup.js"],
      env: {
        jest: true,
      },
    },
  ],
};
