/** Renderer entry for a Tauri 2 + Vite application. */
import "@componentui/theme/tokens.css";
import "@componentui/web/components";

document.querySelector("#app")?.replaceChildren(
  Object.assign(document.createElement("cu-card"), {
    innerHTML: '<h2 slot="header">Tauri workspace</h2><cu-button variant="accent">Open</cu-button>'
  })
);
