// jest.config.js
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  verbose: true,
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^file-type$": "<rootDir>/tests/__mocks__/file-type.js",
    "^jsonwebtoken$": "<rootDir>/tests/__mocks__/jsonwebtoken.js"
  },
    modulePathIgnorePatterns: [
      "<rootDir>/dist/",
      "<rootDir>/tests/__mocks__/jsonwebtoken.ts"
    ],
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: "tsconfig.jest.json"
    }
  }
};