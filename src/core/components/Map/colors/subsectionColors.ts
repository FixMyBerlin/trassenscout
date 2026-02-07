export const subsectionColors = {
  current: "#2c62a9", // blue-500 - current subsection (isCurrent=true)
  selected: "#2c62a9", // blue-500 - alias for current (backward compatibility)
  unselected: "#4B5563", // gray-600 - unselected subsection (isCurrent=false)
  dashedSecondary: "#fbcfe8", // pink-200 - dashed subsection secondary
  lineDotSelected: "#0F172A", // slate-900 - selected subsection dots (solid, no border)
  lineDotUnselected: "#4b5563", // gray-700 - unselected subsection dots (solid, no border)
  lineDotRing: "#0F172A", // Ring color for subsection dots
  linesBorderColor: "#0F172A", // slate-900 - blackish border color for line outlines
  lineDotStrokeWidth: 1, // Border width for subsection dots
  lineDotRadius: 4, // 4+1+1px radius for subsection line dots
  lineWidth: 7, // 7px line width for subsections
  lineOutlineWidth: 9, // 9px outline width for subsections
  lineCap: "butt" as const, // Sharp line endings for subsections
}
