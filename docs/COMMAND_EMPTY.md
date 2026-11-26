# CommandPalette and EmptyState (preview)

The existing catalog previews now have reusable browser custom elements.
The legacy enhanceCommandPalette HTML helper remains available for existing consumers.

## CommandPalette

```html
<cu-command-palette id="commands" title="Quick actions"
  shortcut="mod+k" placeholder="Search commands…"></cu-command-palette>
```

```js
import "@componentui/web/components/command-palette";
const palette = document.querySelector("#commands");
palette.commands = [
  {value:"new",label:"New project",group:"Projects",icon:"plus",shortcut:"Ctrl N"},
  {value:"settings",label:"Settings",keywords:["preferences"],icon:"settings"}
];
palette.addEventListener("cu-select", event => console.log(event.detail.value));
palette.show();
```

Commands are normalized by unique nonempty string value. Search matches all
query terms across value, label, description, group and keywords, ignores
case and diacritics (including Vietnamese đ), and prioritizes label prefixes.
Group headings follow result order; disabled commands cannot be selected.
Arrow keys, PageUp/PageDown, Enter and Escape are supported; native modal dialog
manages focus containment, and close restores the previous focus when possible.
The optional shortcut="mod+k" listens for Ctrl/Meta+K while connected. Enable it
on only one palette per document. Command-level shortcut text is informational:
the component does not install shortcuts or execute commands automatically.
The open property and show()/close() methods control the modal. cu-open,
cu-close and cu-select report lifecycle and selected command identity.

## EmptyState

```html
<cu-empty-state title="No projects" description="Create your first project."
  icon="folder-open" variant="outlined">
  <cu-button slot="actions" variant="accent">Create project</cu-button>
</cu-empty-state>
```

Supports title and description attributes, shared icon names, custom
illustration and title slots, default content slot, actions slot, no-icon,
compact size and start/center alignment. Actions remain app-owned; empty
state itself does not execute them. Uses theme tokens and responsive layout.

## Adapters and validation

React: CommandPalette and EmptyState from @componentui/react/components.
Commands are property-bound and selection events use onCuSelect. Vue/Svelte
can bind commands as a DOM property and listen for cu-select.
Run npm run check, npm run check:packages and npm run preview locally.
Verify focus containment and restoration, keyboard shortcut conflicts,
disabled commands, search ranking, IME, reduced motion, narrow dialogs,
slotted actions, dark mode and screen readers. Browser acceptance is pending.
