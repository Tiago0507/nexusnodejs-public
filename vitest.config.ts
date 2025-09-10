import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./tests/setup.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "text-summary", "html", "lcov"],
            reportsDirectory: "./coverage",
            include: [
                "src/services/**/*.ts",
                "src/controllers/**/*.ts",
                "src/middlewares/**/*.ts",
                //"src/repositories/**/*.ts",
            ],
            exclude: [
                "**/*.d.ts",
                "src/**/__mocks__/**",
                // Barrels y utilidades sin lógica
                "src/**/index.ts",
                "src/middlewares/rateLimit.ts",
                "src/middlewares/validate.ts",
            ],
            thresholds: {
                lines: 80,
                statements: 80,
                functions: 75,
                branches: 60,
            },
        },
    },
});
