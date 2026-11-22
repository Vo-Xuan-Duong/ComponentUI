# Consumer examples

These are focused **integration recipes**, not complete independent starter applications.
They assume a React, Vue 3, Svelte 5, Electron or Tauri frontend project with
its normal tooling installed and the ComponentUI package tarballs installed.

- `react/App.tsx` — React factory-free named wrappers from `@componentui/react/components`
- `react-example.tsx` — the original factory-based React API
- `vue/App.vue`, `vue/main.ts`, `vue/vite.config.ts` — Vue 3 with
  `isCustomElement` compiler setting and `v-cu-model`
- `svelte/App.svelte` — Svelte 5 + `use:cuModel`
- `electron/renderer.js` — Electron renderer entry (bundle via Vite)
- `tauri/renderer.js` + example Vite/Tauri configuration — frontend integration

Electron and Tauri are **webview runtimes** for the Web Components package,
not separate renderers. Do not import ComponentUI into the Electron main
process or the Tauri Rust backend.

For local tarball installation and exact commands, use
[docs/PACKAGING.md](../docs/PACKAGING.md). Configure secure Electron
context isolation and Tauri permissions independently of the UI library.
