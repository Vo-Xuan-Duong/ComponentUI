/**
 * Vue 3 integration for ComponentUI browser Custom Elements.
 * No dependency on Vue at module-import time. Register the directive in
 * app setup and configure isCustomElement in the SFC compiler/Vite plugin.
 */
const VALID_PROPERTIES = new Set(["value","checked","active","open"]);
const VALID_EVENTS = new Set(["cu-input","cu-change","cu-open","cu-close"]);

export function isComponentUIElement(tag) {
  return typeof tag === "string" && /^cu-[a-z][a-z0-9-]*$/.test(tag);
}

export function extractCuValue(event, property = "value") {
  if (!VALID_PROPERTIES.has(property))
    throw new RangeError("Unsupported ComponentUI model property: " + property);
  if (event?.detail && Object.hasOwn(event.detail, property))
    return event.detail[property];
  return event?.target?.[property];
}

export function normalizeCuModel(binding) {
  // Vue supplies a DirectiveBinding with 'instance'/'modifiers'. A direct
  // model specification can itself contain an object-valued 'value'.
  const isDirectiveBinding = binding && typeof binding === "object" &&
    ("instance" in binding || "modifiers" in binding || "dir" in binding);
  const input = isDirectiveBinding ? binding.value : binding;
  if (!input || typeof input !== "object" || !Object.hasOwn(input,"value"))
    throw new TypeError("v-cu-model requires { value, onUpdate, property?, event? }");
  const property = input.property ?? "value";
  if (!VALID_PROPERTIES.has(property)) throw new RangeError("Unsupported property: " + property);
  const event = input.event ?? (property === "checked" ? "cu-change" : "cu-input");
  if (!VALID_EVENTS.has(event)) throw new RangeError("Unsupported event: " + event);
  if (input.onUpdate !== undefined && typeof input.onUpdate !== "function")
    throw new TypeError("onUpdate must be a function");
  return { value:input.value, onUpdate:input.onUpdate, property, event };
}

const activeBindings = new WeakMap();

export function updateCuModel(element, binding) {
  const next = normalizeCuModel(binding);
  let previous = activeBindings.get(element);

  if (!previous || previous.event !== next.event || previous.property !== next.property) {
    if (previous) element.removeEventListener(previous.event, previous.listener);
    const listener = nativeEvent => {
      const current = activeBindings.get(element);
      if (current?.onUpdate)
        current.onUpdate(extractCuValue(nativeEvent, current.property),nativeEvent);
    };
    previous = { ...next, listener };
    activeBindings.set(element, previous);
    element.addEventListener(next.event, listener);
  } else {
    previous.onUpdate = next.onUpdate;
  }
  // Controlled property assignment, not an attribute string. Do not
  // overwrite the user's in-progress input unless the model differs.
  if (element[next.property] !== next.value) element[next.property] = next.value;
}

export function unbindCuModel(element) {
  const current = activeBindings.get(element);
  if (!current) return;
  element.removeEventListener(current.event, current.listener);
  activeBindings.delete(element);
}

export const vCuModel = Object.freeze({
  mounted: updateCuModel,
  updated: updateCuModel,
  beforeUnmount: unbindCuModel,
  getSSRProps: () => ({})
});

export const ComponentUIVuePlugin = Object.freeze({
  install(app) {
    if (!app || typeof app.directive !== "function")
      throw new TypeError("ComponentUIVuePlugin requires a Vue 3 application");
    app.directive("cu-model", vCuModel);
  }
});
