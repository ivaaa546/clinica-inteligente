import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Las pruebas de backend se ejecutan en Node y preparan su entorno antes de cada suite.
    environment: "node",
    testTimeout: 30000,
    setupFiles: ["./test/setup.ts"],
    // Solo se incluyen pruebas TypeScript del directorio de pruebas.
    include: ["test/**/*.test.ts"],
  },
});
