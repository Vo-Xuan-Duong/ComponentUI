export type ThemeMode = "system" | "light" | "dark";
export type Density = "compact" | "comfortable" | "touch";
export type Accent = "blue" | "purple" | "green";
export interface Preferences { theme: ThemeMode; density: Density; accent: Accent; }
export declare const THEME_OPTIONS: ThemeMode[];
export declare const DENSITY_OPTIONS: Density[];
export declare const ACCENT_OPTIONS: Accent[];
export declare function applyPreferences(
  root: Element,
  prefs?: Partial<Preferences>
): Preferences;
export declare function readPreferences(root: Element): Preferences;
