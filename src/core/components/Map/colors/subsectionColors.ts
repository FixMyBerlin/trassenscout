const highlight = "#F8C62B" // yellow-400/ocker - hover and selected/current

export const subsectionColors = {
  line: {
    current: "#2c62a9", // blue-500 - current subsection (isCurrent=true)
    unselected: "#4B5563", // gray-600 - unselected (isCurrent=false)
    hovered: highlight,
    selected: highlight,
    default: "#2c62a9", // not used as literal; layer builds expression from current/unselected
    dashedSecondary: "#fbcfe8", // pink-200 - dashed subsection secondary
    borderColor: "#0F172A",
    width: 7,
    outlineWidth: 9,
    cap: "butt" as const,
  },
  lineEndPoints: {
    current: "#0F172A", // slate-900 - selected line end point
    unselected: "#4b5563", // gray-700
    hovered: highlight,
    selected: highlight,
    default: "#4b5563",
    ring: "#0F172A",
    strokeWidth: 1,
    radius: 4,
  },
  polygon: {
    current: "#2c62a9",
    unselected: "#4B5563",
    hovered: highlight,
    selected: highlight,
    default: "#2c62a9",
    dashedSecondary: "#fbcfe8",
  },
  hull: {
    current: "#2c62a9",
    unselected: "#4B5563",
  },
  /** Stub for type safety when UnifiedFeaturesLayer uses colorSchema subsection (points only rendered for subsubsection). */
  point: {
    current: "#000",
    unselected: "#000",
    hovered: "#000",
    selected: "#000",
    default: "#000",
    dashedSecondary: "#000",
    currentBorderClass: "#000",
    currentTextClass: "#000",
    innerFill: "#000",
  },
} as const
