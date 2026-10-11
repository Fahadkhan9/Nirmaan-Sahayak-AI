import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  // passWithNoTests: keeps `npm test` green until the first test files land.
  test: { environment: "node", passWithNoTests: true },
});
