# Local development — no GitHub Actions

The maintainer runs all builds and tests on their own machine. This repository intentionally **does not contain a GitHub Actions workflow**.

## Prerequisites
- Node.js 20 or later
- npm (bundled with Node.js), or pnpm if you prefer the workspace

## Quick start

```bash
git clone https://github.com/Vo-Xuan-Duong/ComponentUI.git
cd ComponentUI
npm run check
npm run preview
```

Open http://127.0.0.1:4173/apps/playground-web/ in your browser.

The first playground has no runtime npm dependencies. No `npm install` is required just to run the static preview; workspace packages are declared for future integration.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run preview` | Start local preview server (default port 4173, `PORT` is supported) |
| `npm run tokens:build` | Rebuild generated CSS from design-system JSON |
| `npm run tokens:check` | Fail if generated CSS doesn't match JSON source |
| `npm run syntax:check` | Parse-check locally maintained JavaScript files |
| `npm test` | Run Foundation + Playground unit/contract tests |
| `npm run check` | Run the token, syntax and unit checks |

## What is and is not tested

The local checks validate source consistency and app structure. They **do not yet verify** browser screenshots, layout regressions, keyboard accessibility, screen reader experience, SSR hydration or compatibility in real React/Vue applications. Those are milestones for later releases.

Five experimental native Web Components are now available in the source tree (Button, TextField, Checkbox, Switch, Dialog). They are **not** published or production-certified. Try them in the Real Web Components section of the gallery. See `docs/WEB_COMPONENTS.md`.
