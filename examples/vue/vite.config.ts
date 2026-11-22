import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { isComponentUIElement } from "@componentui/vue";

export default defineConfig({
  plugins: [
    vue({template: {compilerOptions: {isCustomElement: isComponentUIElement}}})
  ]
});
