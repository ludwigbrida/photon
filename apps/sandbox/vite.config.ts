import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import viteWesl from "wesl-plugin/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    viteWesl({
      weslToml: "../../libs/renderer/wesl.toml",
    }),
  ],
});
