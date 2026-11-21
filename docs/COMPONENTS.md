# Component inventory

All 128 entries in [catalog.json](../design-system/components/catalog.json) are **planned**. The [Fluent Calm gallery](../apps/playground-web/) demonstrates reference visual styles only, using native HTML and CSS. It is **not** a gallery of published components.

- **P0 — 40:** core primitives required by most personal projects
- **P1 — 81:** expanded workflows and productivity controls
- **P2 — 7:** advanced or high-maintenance patterns

A component can move from `planned` to `ready` only after its contract, behavior, light/dark variants, accessibility, tests, framework smoke tests and documentation are complete.

For the complete inventory, browse the Playground catalog locally or [inspect catalog.json](../design-system/components/catalog.json).

## Release criteria

1. API, events and state/slot specifications are finalized.
2. Light/Dark, Compact/Comfortable/Touch and high contrast are documented and reviewed.
3. Keyboard, focus order, accessible name, roles and feedback are verified.
4. Unit and browser tests cover interaction; visual regression screenshots verified locally.
5. Integration in native HTML and at least one framework is tested.
6. Versioning and migration guidance are prepared.

Do not use the presence of CSS demos as evidence that these release criteria have been met.
