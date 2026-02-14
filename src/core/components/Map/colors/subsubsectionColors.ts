const highlight = "#F8C62B" // yellow-400/ocker - hover and selected/current
const defaultColor = "#38BDF8" // light-blue-400 - default fill/line for entries

export const subsubsectionColors = {
  line: {
    current: defaultColor,
    unselected: "#2c62a9", // blue-500
    hovered: highlight,
    selected: highlight,
    default: defaultColor,
    dashedSecondary: "#e5e7eb", // gray-200 - dashed entry secondary
    borderColor: "#0F172A",
    width: 8,
    outlineWidth: 9,
    cap: "butt" as const,
  },
  lineEndPoints: {
    current: "#38BDF8",
    unselected: "#2c62a9",
    hovered: highlight,
    selected: highlight,
    default: defaultColor,
    ring: "#075985", // light-blue-800
    strokeWidth: 2,
    radius: 4,
  },
  polygon: {
    current: defaultColor,
    unselected: "#2c62a9",
    hovered: highlight,
    selected: highlight,
    default: defaultColor,
    dashedSecondary: "#e5e7eb",
  },
  /** Not used; subsubsection map does not show hulls. Stub for consistent config shape. */
  hull: {
    current: defaultColor,
    unselected: "#2c62a9",
  },
  point: {
    current: defaultColor,
    unselected: "#2c62a9",
    hovered: highlight,
    selected: highlight,
    default: defaultColor,
    dashedSecondary: "#e5e7eb",
    currentBorderClass: "border-sky-400",
    currentTextClass: "text-sky-400",
    innerFill: "#2C62A933", // dark blue with opacity
  },
} as const
