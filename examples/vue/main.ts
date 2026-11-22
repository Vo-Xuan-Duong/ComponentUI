import { createApp } from "vue";
import App from "./App.vue";
import { ComponentUIVuePlugin } from "../../packages/vue/src/index.js";

createApp(App).use(ComponentUIVuePlugin).mount("#app");
