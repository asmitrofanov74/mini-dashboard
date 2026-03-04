export type AppTheme = typeof lightTheme | typeof darkTheme;

export const lightTheme = {
  bg: "#ffffff",
  text: "#000000",
  cardBg: "#f8f9fa",
  statusActive: "#10b981",
  statusPaused: "#f59e0b",
} as const;

export const darkTheme = {
  bg: "#1a1a1a",
  text: "#ffffff",
  cardBg: "#2a2a2a",
  statusActive: "#34d399",
  statusPaused: "#fbbf24",
} as const;
