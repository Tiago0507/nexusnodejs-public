/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",

  testEnvironment: "node",

  clearMocks: true,

  setupFilesAfterEnv: ["./jest.setup.js"],

  coverageDirectory: "coverage",
  
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/tests/**",
    "!src/**/*.spec.ts",
    "!src/**/*.test.ts",
    "!src/seed.ts",
    "!src/**/*.model.ts"
  ],

  coveragePathIgnorePatterns: [
    "/node_modules/",
    ".model.ts"
  ],
};
