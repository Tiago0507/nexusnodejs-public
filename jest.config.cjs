/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    // Para que Jest entienda TypeScript
    preset: "ts-jest",

    // Simula un entorno Node.js (no navegador)
    testEnvironment: "node",

    // Limpia mocks entre pruebas para que no haya fugas
    clearMocks: true,

    // Archivo que se ejecuta antes de correr los tests
    setupFilesAfterEnv: ["./jest.setup.js"],

    // Rutas/archivos a ignorar en cobertura
    coveragePathIgnorePatterns: [
        "/node_modules/",
        ".model.ts"   // tus modelos de mongoose no cuentan para coverage
    ],
};
