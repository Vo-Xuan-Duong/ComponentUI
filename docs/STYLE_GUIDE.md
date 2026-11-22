# ComponentUI Style Guide — Fluent Calm v0.1

## Direction

A refined Windows 11–inspired aesthetic: effortless navigation, calm neutral layers, personal accents, familiar control geometry and coherent motion. This is an independent design language, not a pixel-by-pixel reproduction.

### Visual decisions

| Token / behavior | Light | Dark |
| --- | --- | --- |
| App canvas | #F3F3F3 | #202020 |
| Surface | #FFFFFF | #2B2B2B |
| Elevated surface | #FFFFFF | #333333 |
| Foreground | #242424 | #FFFFFF |
| Secondary text | #616161 | #ADADAD |
| Border | #E5E5E5 | #454545 |
| Accent | #0067C0 | #60CDFF |
| Accent hover | #005A9E | #0F86D8 |
| Accent content | #FFFFFF | #202020 |
| Success | #107C41 | #6CCB86 |
| Warning | #9A6700 | #FCE100 |
| Danger | #C42B1C | #FF9999 |

Fonts: Segoe UI Variable, Segoe UI, Inter, system-ui (fallback). For code: Cascadia Code / JetBrains Mono / monospace. Do not bundle Microsoft font binaries.

Spacing follows a 4 px rhythm; small deviations must be documented. Control sizes: 28 / 32 / 40 / 48 px. Radius: 2 / 4 / 6 / 8 / 12 px and pill. Use 1 px boundaries and extremely restrained shadows.

## Fluent-inspired materials

- **Mica-like canvas**: softly tinted, generally opaque background. On web this is an approximation using semantic canvas colors, not native Windows Mica.
- **Acrylic-like overlay**: translucent and blurred only for flyouts and temporary surfaces; provide opaque fallbacks and support `prefers-reduced-transparency` where available.
- **Solid surfaces**: primary form/data regions. Never put dense body copy on strongly blurred backgrounds.

## Component rules

- Primary actions should be prominent but scarce. Secondary/subtle/outline/danger/loading/disabled variants must be considered in contracts.
- Inputs have persistent visible labels, descriptions, and text errors linked to controls.
- All interactive UI supports `:focus-visible` with a high-contrast ring; keyboard behavior must be specified.
- Layout must work from 320 px up to wide screens; sidebar becomes compact on narrow screens.
- Navigation, menu and option selected/hover states use **full-row background contrast** and text weight, not a decorative left-edge accent strip. Selected values may add a checkmark. Color is not the only state indicator.
- Support left-to-right initially; add explicit RTL tests before claiming RTL support.
- Use SVG/stroke iconography via a separate appropriately licensed icon package rather than embedded platform icons.
- Motion: 100 ms for small feedback, 160 ms normal, 240 ms complex transitions; honor reduced motion.
- Aim for WCAG 2.2 AA, verify contrast and focus paths on implemented components rather than treating tokens as certification.

## Design tokens

Edit `design-system/tokens/fluent-calm.tokens.json` and run `npm run tokens:build`. Avoid raw hex values within production component styles.

## Theme variants (future)

1. Fluent Calm — default.
2. Fluent Compact — high-density tables and desktop tooling.
3. Fluent Touch — enlarged touch targets for mobile/tablet.
4. High Contrast — accessibility-focused.
5. Custom Accent — user-defined accent palette with validated foreground contrast.

## References

- https://fluent2.microsoft.design/design-tokens/
- https://fluent2.microsoft.design/shapes/
- https://fluent2.microsoft.design/typography/
- https://learn.microsoft.com/en-us/windows/apps/develop/ui/materials
- https://learn.microsoft.com/windows/apps/design/signature-experiences/geometry
