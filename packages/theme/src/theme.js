export const THEME_OPTIONS = ["system", "light", "dark"];
export const DENSITY_OPTIONS = ["compact", "comfortable", "touch"];
export const ACCENT_OPTIONS = ["blue", "purple", "green"];

function assertOption(value, options, label) {
  if (!options.includes(value)) throw new RangeError(`Unsupported ${label}: ${value}`);
}

export function applyPreferences(root, { theme = "system", density = "comfortable", accent = "blue" } = {}) {
  assertOption(theme, THEME_OPTIONS, "theme");
  assertOption(density, DENSITY_OPTIONS, "density");
  assertOption(accent, ACCENT_OPTIONS, "accent");
  if (theme === "system") root.removeAttribute("data-cu-theme");
  else root.setAttribute("data-cu-theme", theme);
  root.setAttribute("data-cu-density", density);
  root.setAttribute("data-cu-accent", accent);
  return { theme, density, accent };
}

export function readPreferences(root) {
  const theme = root.getAttribute("data-cu-theme") || "system";
  const density = root.getAttribute("data-cu-density") || "comfortable";
  const accent = root.getAttribute("data-cu-accent") || "blue";
  return { theme, density, accent };
}
