/**
 * ComponentUI — framework-neutral progressive enhancements.
 * These controllers are intentionally DOM-first and dependency-free.
 * They augment semantic HTML examples; not yet production-certified widgets.
 */

export function paginate(items, pageSize, page = 1) {
  if (!Array.isArray(items)) throw new TypeError("items must be an array");
  if (!Number.isSafeInteger(pageSize) || pageSize < 1) throw new RangeError("pageSize must be a positive integer");
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const requestedPage = Number.isFinite(page) ? Math.trunc(page) : 1;
  const currentPage = Math.max(1, Math.min(totalPages, requestedPage));
  const start = (currentPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: currentPage,
    pageSize,
    totalItems: items.length,
    totalPages,
    start: items.length ? start + 1 : 0,
    end: Math.min(items.length, start + pageSize)
  };
}

export function filterCommands(commands, query = "") {
  if (!Array.isArray(commands)) throw new TypeError("commands must be an array");
  const terms = String(query).toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [...commands];
  return commands.filter(command => {
    const haystack = [command.label, command.description ?? "", ...(command.keywords ?? [])]
      .join(" ").toLocaleLowerCase();
    return terms.every(term => haystack.includes(term));
  });
}

export function nextRovingIndex(index, length, key) {
  if (!Number.isSafeInteger(length) || length <= 0) return -1;
  switch (key) {
    case "ArrowDown": return (index + 1 + length) % length;
    case "ArrowUp": return (index - 1 + length) % length;
    case "Home": return 0;
    case "End": return length - 1;
    default: return -1;
  }
}

export function enhanceMenu(root, { onSelect = () => {} } = {}) {
  const trigger = root.querySelector("[data-cu-menu-trigger]");
  const popup = root.querySelector('[role="menu"]');
  if (!trigger || !popup) throw new Error("Menu requires a trigger and role=menu popup");
  const items = [...popup.querySelectorAll('[role="menuitem"]')];
  popup.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
  items.forEach(item => { item.tabIndex = -1; });
  let opened = false;
  function open(index = 0) {
    popup.hidden = false;
    opened = true;
    trigger.setAttribute("aria-expanded", "true");
    if (items.length) items[Math.max(0, Math.min(items.length - 1, index))].focus();
  }
  function close({ restoreFocus = false } = {}) {
    if (!opened) return;
    popup.hidden = true;
    opened = false;
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus();
  }
  const onTriggerClick = () => opened ? close() : open();
  const onTriggerKeydown = event => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      open(event.key === "ArrowDown" ? 0 : items.length - 1);
    }
  };
  const onPopupKeydown = event => {
    if (event.key === "Escape") { event.preventDefault(); close({ restoreFocus: true }); return; }
    if (event.key === "Tab") { close(); return; }
    const index = items.indexOf(event.target.closest('[role="menuitem"]'));
    const next = nextRovingIndex(Math.max(index, 0), items.length, event.key);
    if (next !== -1) { event.preventDefault(); items[next].focus(); }
  };
  const onPopupClick = event => {
    const item = event.target.closest('[role="menuitem"]');
    if (!item || !popup.contains(item)) return;
    onSelect(item.dataset.action || item.textContent.trim(), item);
    close({ restoreFocus: true });
  };
  const onOutside = event => { if (opened && !root.contains(event.target)) close(); };
  trigger.addEventListener("click", onTriggerClick);
  trigger.addEventListener("keydown", onTriggerKeydown);
  popup.addEventListener("keydown", onPopupKeydown);
  popup.addEventListener("click", onPopupClick);
  document.addEventListener("pointerdown", onOutside);
  return () => {
    trigger.removeEventListener("click", onTriggerClick);
    trigger.removeEventListener("keydown", onTriggerKeydown);
    popup.removeEventListener("keydown", onPopupKeydown);
    popup.removeEventListener("click", onPopupClick);
    document.removeEventListener("pointerdown", onOutside);
  };
}

export function enhancePopover(root) {
  const trigger = root.querySelector("[data-cu-popover-trigger]");
  const panel = root.querySelector("[data-cu-popover-panel]");
  if (!trigger || !panel) throw new Error("Popover requires a trigger and panel");
  panel.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
  function close({ restoreFocus = false } = {}) {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus();
  }
  const toggle = () => {
    const open = panel.hidden;
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
  };
  const onKeydown = event => { if (event.key === "Escape" && !panel.hidden) { event.preventDefault(); close({restoreFocus:true}); } };
  const onOutside = event => { if (!root.contains(event.target)) close(); };
  trigger.addEventListener("click", toggle);
  root.addEventListener("keydown", onKeydown);
  document.addEventListener("pointerdown", onOutside);
  return () => {
    trigger.removeEventListener("click", toggle);
    root.removeEventListener("keydown", onKeydown);
    document.removeEventListener("pointerdown", onOutside);
  };
}

export function enhanceDialogTrigger(trigger, dialog) {
  if (!trigger || !dialog || typeof dialog.showModal !== "function")
    throw new Error("Dialog trigger needs a button and a native dialog");
  const open = () => { if (!dialog.open) dialog.showModal(); };
  trigger.addEventListener("click", open);
  return () => trigger.removeEventListener("click", open);
}

/**
 * Render a paginated collection into supplied containers using safe DOM nodes.
 * Does not impose product-specific table or card markup.
 */
export function enhancePagination(root, { items, renderItem, pageSize = 4 } = {}) {
  const content = root.querySelector("[data-cu-page-items]");
  const navigation = root.querySelector("[data-cu-pagination-nav]");
  const status = root.querySelector("[data-cu-page-status]");
  if (!content || !navigation || !status) throw new Error("Pagination requires content, navigation and status");
  if (typeof renderItem !== "function") throw new TypeError("renderItem must be a function");
  let page = 1;
  function draw() {
    const result = paginate(items, pageSize, page);
    page = result.page;
    const nodes = result.items.map((item, index) => renderItem(item, (page - 1) * pageSize + index));
    content.replaceChildren(...nodes);
    status.textContent = result.totalItems
      ? `Showing ${result.start}–${result.end} of ${result.totalItems}`
      : "No results";
    navigation.replaceChildren();
    function button(label, target, { disabled = false, current = false } = {}) {
      const element = document.createElement("button");
      element.type = "button";
      element.className = "cu-page-button";
      element.textContent = label;
      element.disabled = disabled;
      if (current) {
        element.setAttribute("aria-current", "page");
        element.setAttribute("aria-label", `Page ${target}, current page`);
      } else if (typeof target === "number" && label !== "Previous" && label !== "Next") {
        element.setAttribute("aria-label", `Go to page ${target}`);
      }
      element.addEventListener("click", () => { page = target; draw(); });
      navigation.append(element);
    }
    button("Previous", page - 1, { disabled: page === 1 });
    for (let p = 1; p <= result.totalPages; p++) button(String(p), p, { current: p === page });
    button("Next", page + 1, { disabled: page === result.totalPages });
    return result;
  }
  draw();
  return { get page() { return page; }, goTo(nextPage) { page = nextPage; return draw(); }, refresh: draw };
}

/**
 * Native dialog + combobox with aria-activedescendant. Keyboard focus stays
 * on the search input while results update. Escape is handled by <dialog>.
 */
export function enhanceCommandPalette(dialog, {
  trigger,
  commands = [],
  onSelect = () => {}
} = {}) {
  const input = dialog.querySelector("[data-cu-command-input]");
  const list = dialog.querySelector('[role="listbox"]');
  const empty = dialog.querySelector("[data-cu-command-empty]");
  if (!input || !list || !empty) throw new Error("Command palette requires input, listbox and empty state");
  if (!list.id) throw new Error("Command listbox must have an id");
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-controls", list.id);
  input.setAttribute("aria-expanded", "false");
  let matches = [];
  let activeIndex = 0;
  let lastFocus = null;
  let optionCounter = 0;
  const close = () => { if (dialog.open) dialog.close(); };
  function render() {
    matches = filterCommands(commands, input.value);
    if (activeIndex >= matches.length) activeIndex = 0;
    list.replaceChildren();
    empty.hidden = matches.length > 0;
    matches.forEach((command, index) => {
      const option = document.createElement("div");
      option.id = `${list.id}-option-${++optionCounter}`;
      option.className = "cu-command-option";
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", String(index === activeIndex));
      const title = document.createElement("strong");
      title.textContent = command.label;
      const description = document.createElement("small");
      description.textContent = command.description || "";
      option.append(title, description);
      option.addEventListener("pointermove", () => { activeIndex = index; syncActive(); });
      option.addEventListener("click", () => choose(index));
      list.append(option);
    });
    syncActive();
  }
  function syncActive() {
    [...list.children].forEach((option, i) => {
      option.setAttribute("aria-selected", String(i === activeIndex));
    });
    const selected = list.children[activeIndex];
    if (selected) {
      input.setAttribute("aria-activedescendant", selected.id);
      selected.scrollIntoView({ block:"nearest" });
    } else input.removeAttribute("aria-activedescendant");
  }
  function choose(index) {
    const command = matches[index];
    if (!command) return;
    close();
    onSelect(command);
  }
  function open() {
    if (dialog.open) return;
    lastFocus = document.activeElement;
    input.value = "";
    activeIndex = 0;
    render();
    dialog.showModal();
    input.setAttribute("aria-expanded", "true");
    input.focus();
  }
  const onKeydown = event => {
    const index = nextRovingIndex(activeIndex, matches.length, event.key);
    if (index !== -1) {
      event.preventDefault();
      activeIndex = index;
      syncActive();
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(activeIndex);
    }
  };
  const onInput = () => { activeIndex = 0; render(); };
  const onShortcut = event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (dialog.open) close(); else open();
    }
  };
  const onClose = () => {
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    if (lastFocus?.isConnected && typeof lastFocus.focus === "function") lastFocus.focus();
  };
  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onKeydown);
  document.addEventListener("keydown", onShortcut);
  dialog.addEventListener("close", onClose);
  trigger?.addEventListener("click", open);
  return {
    open,
    close,
    destroy() {
      input.removeEventListener("input", onInput);
      input.removeEventListener("keydown", onKeydown);
      document.removeEventListener("keydown", onShortcut);
      dialog.removeEventListener("close", onClose);
      trigger?.removeEventListener("click", open);
    }
  };
}
