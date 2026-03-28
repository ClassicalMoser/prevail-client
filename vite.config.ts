import path from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

const repoRoot = path.resolve(__dirname, "..");
const linkedPrevailRules = path.join(repoRoot, "prevail-rules");

export default defineConfig({
  plugins: [solid()],
  // Must match src-tauri/tauri.conf.json build.devUrl (Tauri runs `pnpm dev` before the app loads).
  server: {
    port: 1420,
    strictPort: true,
    // Linked `file:../...` packages live outside this app root; allow serving their sources/build output.
    fs: {
      allow: [path.resolve(__dirname), linkedPrevailRules],
    },
  },
  resolve: {
    alias: {
      "@application": path.resolve(__dirname, "src/application/index.ts"),
      "@domain": path.resolve(__dirname, "src/domain/index.ts"),
      "@interface": path.resolve(__dirname, "src/interface/index.ts"),
      "@infrastructure": path.resolve(__dirname, "src/infrastructure/index.ts"),
    },
  },
});
