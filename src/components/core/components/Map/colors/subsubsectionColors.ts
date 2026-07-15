import { mapColorTokens } from "./mapColorTokens"

const highlight = mapColorTokens.yellow400 // yellow-400 - hover and selected/current
const defaultColor = mapColorTokens.sky400 // sky-400 - default fill/line for entries
const greenColor = mapColorTokens.subsubsectionStatusGreen // custom green for GREEN style status

export const subsubsectionColors = {
  line: {
    current: defaultColor,
    unselected: defaultColor, // same light blue as circle/poly
    hovered: highlight,
    selected: highlight,
    default: defaultColor,
    green: greenColor,
    dashedSecondary: mapColorTokens.gray200, // gray-200 - kept for structural consistency
    borderColor: mapColorTokens.slate900,
    width: 8,
    outlineWidth: 9,
    cap: "butt" as const,
  },
  lineEndPoints: {
    current: mapColorTokens.sky400,
    unselected: defaultColor,
    hovered: highlight,
    selected: highlight,
    default: defaultColor,
    green: greenColor,
    ring: mapColorTokens.slate900,
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
    dashedSecondary: mapColorTokens.gray200,
  },
  /** Not used; subsubsection map does not show hulls. Stub for consistent config shape. */
  hull: {
    current: defaultColor,
    unselected: mapColorTokens.blue500,
  },
  point: {
    current: defaultColor,
    unselected: mapColorTokens.blue500,
    hovered: highlight,
    selected: highlight,
    default: defaultColor,
    green: greenColor,
    dashedSecondary: mapColorTokens.gray200,
    currentBorderClass: "border-sky-400",
    currentTextClass: "text-sky-400",
    innerFill: mapColorTokens.blue500Alpha20, // blue-500 with opacity
  },
} as const
