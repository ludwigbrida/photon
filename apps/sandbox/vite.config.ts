import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteWesl from "wesl-plugin/vite";

export default defineConfig({
  plugins: [
    viteWesl({
      weslToml: "../../libs/renderer/wesl.toml",
    }),
    react(),
  ],
});
