import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { isComponentUIElement } from "../../packages/vue/src/index.js";

export default defineConfig({
  plugins: [
    vue({template: {compilerOptions: {isCustomElement: isComponentUIElement}}})
  ]
});
