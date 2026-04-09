export const dealAreaStatusStyles = {
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

export const dealAreaStatusStyleOrder = [1, 2, 3] as const

export type DealAreaStatusStyle = keyof typeof dealAreaStatusStyles

export const dealAreaStatusStyleOptions = dealAreaStatusStyleOrder.map((style) => ({
  value: String(style) as `${DealAreaStatusStyle}`,
  label: dealAreaStatusStyles[style].label,
}))

export const dealAreaStatusStyleTranslations = Object.fromEntries(
  dealAreaStatusStyleOrder.map((style) => [style, dealAreaStatusStyles[style].label]),
) as Record<DealAreaStatusStyle, string>

export const dealAreaStatusStyleBadgeClasses = Object.fromEntries(
  dealAreaStatusStyleOrder.map((style) => [style, dealAreaStatusStyles[style].badgeClass]),
) as Record<DealAreaStatusStyle, string>
