import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: (_, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: Object.keys(pkg.dependencies || {}),
    },
    outDir: "dist/es",
  },
});
