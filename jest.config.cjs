/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",

  testEnvironment: "node",

  clearMocks: true,

  setupFilesAfterEnv: ["./jest.setup.js"],

  coveragePathIgnorePatterns: [
    "/node_modules/",
    ".model.ts"
  ],
};