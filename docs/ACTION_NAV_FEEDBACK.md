# Actions, navigation and feedback (preview)

Fifteen modules are registered with standalone exports and React wrappers.
These components reuse the shared native interaction implementations where
appropriate instead of duplicating overlay or keyboard logic.

| Component | Contract |
| --- | --- |
| ToggleButton | Native button with pressed, disabled and loading properties; cu-change and cu-press |
| Hyperlink | Safe URL navigation, disabled state, target and noopener for new tabs |
| MenuButton | Menu with a default labeled trigger, cu-menu-item children, open and disabled |
| FloatingActionButton | Accent Button variant; application positions it, not forced fixed positioning |
| Sidebar | Opt-in NavigationView surface with native anchor/button children |
| TopNav | Horizontal wrapping NavigationView |
| BottomNavigation | Compact horizontal navigation; application owns placement |
| VerticalTabs | Tabs with vertical orientation by default |
| TabView | Tabs with optional pill variant |
| Snackbar | Toast queue with one visible notification by default |
| ConfirmDialog | Native modal, cancel/confirm buttons, cu-close returnValue |
| Flyout | Wider anchored Popover |
| TeachingTip | Anchored Popover with heading and dismissal button |
| Callout | Alert with accent edge |
| Banner | Full-width InfoBar variant with action slot |

MenuButton uses cu-menu-item children. The navigation components accept
native anchors and buttons with data-value and emit cu-change. Tabs variants
accept cu-tab children. Sidebar is an optional component and is not a
required region of the application shell.

```html
<cu-confirm-dialog id="confirm" title="Continue?" confirm-label="Continue">
  Confirm this operation.
</cu-confirm-dialog>
```

```js
const dialog = document.querySelector("#confirm");
dialog.addEventListener("cu-close", e => {
  if(e.detail.returnValue === "confirm") console.log("Confirmed");
});
dialog.showModal();
```

ConfirmDialog does not perform the operation itself. The host must validate
authorization and handle errors. Use danger-confirm for destructive actions.
The confirm dialog initially focuses Cancel. Flyout and TeachingTip use
trigger/content slots and shared overlay focus and placement. Snackbar
retains the Toast show/dismiss/clear API and action/dismiss events. None
of the feedback patterns requires a third-party dependency.

Local acceptance: check keyboard focus, nested overlays, outside click,
Escape, disabled states, safe navigation, responsive layouts, theme
contrast and actual runtime behavior. All entries remain preview.
