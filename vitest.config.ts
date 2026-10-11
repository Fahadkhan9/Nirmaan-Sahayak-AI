import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  // passWithNoTests: keeps `npm test` green until the first test files land.
  test: { environment: "node", passWithNoTests: true },
});
