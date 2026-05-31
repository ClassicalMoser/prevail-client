import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

const repoRoot = path.resolve(import.meta.dirname, "..");
const linkedPrevailRules = path.join(repoRoot, "prevail-rules");

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  // Must match src-tauri/tauri.conf.json build.devUrl (Tauri runs `pnpm dev` before the app loads).
  server: {
    port: 1420,
    strictPort: true,
    // Linked `file:../...` packages live outside this app root; allow serving their sources/build output.
    fs: {
      allow: [path.resolve(import.meta.dirname), linkedPrevailRules],
    },
  },
  resolve: {
    alias: {
      "@assets": path.resolve(import.meta.dirname, "src/assets/"),
      "@application": path.resolve(import.meta.dirname, "src/application/"),
      "@domain": path.resolve(import.meta.dirname, "src/domain/"),
      "@interface": path.resolve(import.meta.dirname, "src/interface/"),
      "@infrastructure": path.resolve(import.meta.dirname, "src/infrastructure/"),
    },
  },
});
