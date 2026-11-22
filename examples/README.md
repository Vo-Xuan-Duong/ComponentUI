# React / Vue consumer examples

These are source-level integration examples, **not** standalone, configured
applications. The example imports resolve relative to the monorepo root,
and the React/Vue toolchains and dependencies are intentionally not installed
or executed by the root's dependency-free preview scripts.

- `react-example.tsx` shows controlled TextField, Checkbox and Select state
  through `onCuInput`/`onCuChange`, an SVG `Icon` and native form submission.
- `vue/App.vue` uses the `v-cu-model` directive for controlled form fields.
- `vue/main.ts` registers the Vue directive.
- `vue/vite.config.ts` shows Vite's required **compile-time**
  `isCustomElement` setting (runtime app config alone is insufficient).

Both examples must run in a browser-enabled React 18/19 or Vue 3 application.
React, Vue, Vite and their types are optional peer development tools, not
dependencies of `npm run preview`.

See [Framework adapters](../docs/FRAMEWORK_ADAPTERS.md) for API,
integration constraints and manual testing.
