const highlight = "#F8C62B" // yellow-400/ocker - hover and selected/current
const defaultColor = "#38BDF8" // light-blue-400 - default fill/line for entries
const greenColor = "#4BC556" // green for GREEN style status

export const subsubsectionColors = {
  line: {
    current: defaultColor,
    unselected: defaultColor, // same light blue as circle/poly
    hovered: highlight,
    selected: highlight,
    default: defaultColor,
    green: greenColor,
    dashedSecondary: "#e5e7eb", // gray-200 - kept for structural consistency
    borderColor: "#0F172A",
    width: 8,
    outlineWidth: 9,
    cap: "butt" as const,
  },
  lineEndPoints: {
    current: "#38BDF8",
    unselected: defaultColor,
    hovered: highlight,
    selected: highlight,
    default: defaultColor,
    green: greenColor,
    ring: "#0F172A",
    strokeWidth: 0.5,
    radius: 4,
  },
  polygon: {
    current: defaultColor,
    unselected: defaultColor, // same light blue as line/circle
    hovered: highlight,
    selected: highlight,
    default: defaultColor,
    green: greenColor,
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
    green: greenColor,
    dashedSecondary: "#e5e7eb",
    currentBorderClass: "border-sky-400",
    currentTextClass: "text-sky-400",
    innerFill: "#2C62A933", // dark blue with opacity
  },
} as const
