// jest.config.js
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: "tsconfig.jest.json"
    }
  }
};