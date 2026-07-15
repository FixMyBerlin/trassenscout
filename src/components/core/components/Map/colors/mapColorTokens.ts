/**
 * Shared map color tokens.
 * These are plain hex values because MapLibre / TerraDraw paint configs need concrete colors,
 * but the token names stay aligned with the Tailwind theme naming used in the UI.
 */
export const mapColorTokens = {
  blue500: "#2c62a9",
  sky400: "#38bdf8",
  yellow400: "#f8c62b",
  pink200: "#fbcfe8",
  gray200: "#e5e7eb",
  gray600: "#4b5563",
  slate900: "#0f172a",
  black: "#000000",
  blue500Alpha20: "#2c62a933",
  subsubsectionStatusGreen: "#4bc556",
  terraDrawSelectionPink: "#ec407a",
  terraDrawMidpointPurple: "#a855f7",
} as const
