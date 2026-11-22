/**
 * Svelte 5 action for controlled ComponentUI Custom Elements.
 * No Svelte runtime import: the action subscribes directly to DOM events.
 * Use with: <cu-select use:cuModel={{ value, event:'cu-change', onUpdate }} />
 */
const SUPPORTED_PROPERTIES = new Set(["value", "checked", "active"]);
const SUPPORTED_EVENTS = new Set(["cu-input", "cu-change", "cu-select"]);

export function normalizeCuBinding(input) {
  if (!input || typeof input !== "object" || !Object.hasOwn(input, "value"))
    throw new TypeError("cuModel requires {value, onUpdate, property?, event?}");
  const property = input.property ?? "value";
  const event = input.event ?? (property === "checked" ? "cu-change" : "cu-input");
  if (!SUPPORTED_PROPERTIES.has(property)) throw new RangeError("Unsupported property: " + property);
  if (!SUPPORTED_EVENTS.has(event)) throw new RangeError("Unsupported event: " + event);
  if (input.onUpdate !== undefined && typeof input.onUpdate !== "function")
    throw new TypeError("onUpdate must be a function");
  return { value: input.value, property, event, onUpdate: input.onUpdate };
}

export function cuModel(node, initial) {
  if (!node || typeof node.addEventListener !== "function")
    throw new TypeError("cuModel requires a Custom Element");
  let current;
  const listener = event => {
    const value = event.detail && Object.hasOwn(event.detail, current.property)
      ? event.detail[current.property] : node[current.property];
    current.onUpdate?.(value, event);
  };
  function update(next) {
    const normalized = normalizeCuBinding(next);
    if (current?.event !== normalized.event) {
      if (current) node.removeEventListener(current.event, listener);
      node.addEventListener(normalized.event, listener);
    }
    current = normalized;
    if (node[current.property] !== current.value) node[current.property] = current.value;
  }
  update(initial);
  return {
    update,
    destroy() {
      if (current) node.removeEventListener(current.event, listener);
      current = null;
    }
  };
}

export function cuEvents(node, initial = {}) {
  if (!node || typeof node.addEventListener !== "function")
    throw new TypeError("cuEvents requires a DOM element");
  let active = [];
  function update(handlers = {}) {
    for (const [name, callback] of active) node.removeEventListener(name, callback);
    active = [];
    for (const [name, callback] of Object.entries(handlers)) {
      if (!/^cu-[a-z]+(?:-[a-z]+)*$/.test(name) || typeof callback !== "function")
        throw new TypeError("cuEvents expects cu-* event name and function");
      node.addEventListener(name, callback);
      active.push([name, callback]);
    }
  }
  update(initial);
  return {
    update,
    destroy() {
      for (const [name, callback] of active) node.removeEventListener(name, callback);
      active = [];
    }
  };
}
