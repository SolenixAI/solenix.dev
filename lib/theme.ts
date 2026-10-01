// The portal's theme choice: follow the device, or light or dark. Stored in a
// cookie so the server renders the right theme on first paint.
export const THEME_COOKIE = "solenix-theme"
export type ThemeChoice = "system" | "light" | "dark"
