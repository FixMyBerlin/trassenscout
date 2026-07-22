import { mapColorTokens } from "./mapColorTokens"

/** Shared yellow-400 for map hover + selected states (pins, geometries, hulls). */
const subsectionHighlightColor = mapColorTokens.yellow400

const highlight = subsectionHighlightColor

export const subsectionColors = {
  line: {
    current: mapColorTokens.blue500, // blue-500 - current subsection (isCurrent=true)
    unselected: mapColorTokens.gray600, // gray-600 - unselected (isCurrent=false)
    hovered: highlight,
    selected: highlight,
    default: mapColorTokens.blue500, // not used as literal; layer builds expression from current/unselected
    green: mapColorTokens.blue500, // stub - GREEN style not used for subsections
    dashedSecondary: mapColorTokens.pink200, // pink-200 - dashed subsection secondary
    borderColor: mapColorTokens.slate900,
    width: 7,
    outlineWidth: 9,
    cap: "butt" as const,
  },
  lineEndPoints: {
    current: mapColorTokens.slate900, // slate-900 - selected line end point
    unselected: mapColorTokens.gray600, // gray-600
    hovered: highlight,
    selected: highlight,
    default: mapColorTokens.gray600,
    green: mapColorTokens.gray600, // stub - GREEN style not used for subsections
    ring: mapColorTokens.slate900,
    strokeWidth: 1,
    radius: 4,
  },
  polygon: {
    current: mapColorTokens.blue500,
    unselected: mapColorTokens.gray600,
    hovered: highlight,
    selected: highlight,
    default: mapColorTokens.blue500,
    green: mapColorTokens.blue500, // stub - GREEN style not used for subsections
    dashedSecondary: mapColorTokens.pink200,
  },
  hull: {
    current: mapColorTokens.blue500,
    unselected: mapColorTokens.gray600,
    hovered: highlight,
  },
  /** Point styling for dashboard project preview circles (UnifiedFeaturesLayer). */
  point: {
    current: mapColorTokens.blue500,
    unselected: mapColorTokens.gray600,
    hovered: highlight,
    selected: highlight,
    default: mapColorTokens.blue500,
    green: mapColorTokens.blue500,
    dashedSecondary: mapColorTokens.pink200,
    currentBorderClass: "border-blue-500",
    currentTextClass: "text-blue-500",
    innerFill: mapColorTokens.blue500Alpha20,
  },
} as const
