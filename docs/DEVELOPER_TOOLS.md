# Developer and productivity components (preview)

- **JsonViewer**: set `value` to a JSON string and `query` to filter the tree; selecting an entry emits `cu-select` with its escaped path. Tree rendering is limited to 500 nodes and 20 levels; original JSON remains viewable and copyable when the tree is truncated. Invalid JSON is reported without interpreting markup.
- **DiffViewer**: set `before` and `after` to strings. A bounded line-based longest common subsequence algorithm compares up to 400 lines per side; larger inputs are shown without diff. Added/removed lines are marked by prefixes. No inline word diff or synchronized scrolling yet.
- **MarkdownEditor**: set `value`; emits `cu-input` and `cu-change`. Supports headings, paragraphs, simple lists, blockquotes and fenced code. Raw HTML and inline formatting are treated as text; links/images, tables, nested lists and full CommonMark are not implemented. Supports readonly and disabled editing. Not form-associated.

All three are framework-neutral custom elements with standalone imports and React adapters. Vue/Svelte can bind properties directly to the same registered elements. All reuse existing components, shared tokens and text-safe rendering. Browser acceptance remains required.
