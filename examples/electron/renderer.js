/**
 * Renderer entry for a Vite-built Electron application.
 * UI code works in a sandboxed browser context, without Node integration.
 */
import "@componentui/theme/tokens.css";
import "@componentui/web/components";

const app = document.querySelector("#app");
if (app) {
  app.innerHTML = '<cu-card><h2 slot="header">Desktop workspace</h2>' +
    '<cu-select label="View" name="view">' +
    '<option value="all">All projects</option>' +
    '<option value="active">Active</option>' +
    '</cu-select></cu-card>';
}
