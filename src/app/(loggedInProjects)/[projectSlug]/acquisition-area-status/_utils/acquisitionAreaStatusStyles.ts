export const acquisitionAreaStatusStyles = {
  1: {
    label: "Lila",
    color: "#A39BFC",
    badgeClass: "bg-[#A39BFC]/20 text-[#6F63F2]",
  },
  2: {
    label: "Orange",
    color: "#FF9A5C",
    badgeClass: "bg-[#FF9A5C]/20 text-[#D46D2F]",
  },
  3: {
    label: "Grün",
    color: "#369648",
    badgeClass: "bg-[#369648]/20 text-[#2F7F3D]",
  },
} as const

export const acquisitionAreaStatusStyleOrder = [1, 2, 3] as const

export type AcquisitionAreaStatusStyle = keyof typeof acquisitionAreaStatusStyles

export const acquisitionAreaStatusStyleOptions = acquisitionAreaStatusStyleOrder.map((style) => ({
  value: String(style) as `${AcquisitionAreaStatusStyle}`,
  label: acquisitionAreaStatusStyles[style].label,
}))

export const acquisitionAreaStatusStyleTranslations = Object.fromEntries(
  acquisitionAreaStatusStyleOrder.map((style) => [style, acquisitionAreaStatusStyles[style].label]),
) as Record<AcquisitionAreaStatusStyle, string>

export const acquisitionAreaStatusStyleBadgeClasses = Object.fromEntries(
  acquisitionAreaStatusStyleOrder.map((style) => [
    style,
    acquisitionAreaStatusStyles[style].badgeClass,
  ]),
) as Record<AcquisitionAreaStatusStyle, string>
