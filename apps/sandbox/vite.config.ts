import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteWesl from "wesl-plugin/vite";

export default defineConfig({
  plugins: [
    react(),
    viteWesl({
      weslToml: "../../libs/renderer/wesl.toml",
    }),
  ],
});
