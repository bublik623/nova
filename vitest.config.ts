import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
import autoImport from "unplugin-auto-import/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { coverageConfigDefaults } from "vitest/config";

export default defineConfig(() => ({
  plugins: [
    Vue(),
    svgLoader(),
    autoImport({
      imports: ["vue"],
    }),
    tsConfigPaths(),
  ],
  test: {
    setupFiles: ["./features/testing/unit/setup-vitest.ts"],
    globals: true,
    environment: "jsdom",
    coverage: {
      lines: 75,
      functions: 75,
      branches: 75,
      statements: 75,
      // merge the custom exclusion with the default ones
      // https://github.com/vitest-dev/vitest/issues/5101
      exclude: [
        ...coverageConfigDefaults.exclude,
        "**/*.test.ts",
        "**/*.types.ts",
        "**/types/*",
        "**/types.ts",
        "**/*.schema.ts",
        "**/schema/*",
        "**/schema.ts",
        "**/*.config.ts",
        "**/config/*",
        "**/config.ts",
        "test",
        "pages",
        "plugins",
        "app",
        "app.vue",
        "error.vue",
      ],
      reporter: ["text", "json", "html", "cobertura", "lcov"],
    },
    exclude: ["**/node_modules/**", "**/integration/**"],
    reporters: ["default", "junit"],
    outputFile: {
      junit: "unit.xml",
    },
  },
}));
