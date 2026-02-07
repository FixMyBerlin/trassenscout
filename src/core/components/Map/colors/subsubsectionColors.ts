export const subsubsectionColors = {
  current: "#38BDF8", // light-blue-400 - current/selected entry (isCurrent=true or selected=true)
  currentBorderClass: "border-sky-400", // Tailwind class for current border color
  currentTextClass: "text-sky-400", // Tailwind class for current text color
  unselected: "#2c62a9", // blue-500 - unselected entry (dark blue, same as subsection current)
  dashedSecondary: "#e5e7eb", // gray-200 - dashed entry secondary
  lineDotSelected: "#38BDF8", // light-blue-400 - dot inner fill color (matches line color)
  lineDotUnselected: "#2c62a9", // blue-500 - unselected line dots (matches unselected)
  lineDotInner: "#38BDF8", // light-blue-400 - alias for lineDotSelected (backward compatibility)
  lineDotRing: "#075985", // light-blue-800 - dot ring/border color
  lineDotStrokeWidth: 2, // 2px border width for subsubsection line dots (creates ring effect)
  linesBorderColor: "#0F172A", // slate-900 - blackish border color for line outlines
  pointInnerFill: "#2C62A933", // dark blue with opacity
  lineDotRadius: 4, // 4px radius for subsubsection line dots
  lineWidth: 8, // 8px line width for subsubsections
  lineOutlineWidth: 9, // 9px outline width for subsubsections
  lineCap: "butt" as const, // Sharp line endings for subsubsections
}
