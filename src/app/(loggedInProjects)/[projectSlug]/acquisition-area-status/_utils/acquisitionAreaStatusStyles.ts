import { acquisitionAreaColors } from "@/src/core/components/Map/colors/acquisitionAreaColors"

export const acquisitionAreaStatusStyles = {
  1: {
    label: "Lila",
    color: acquisitionAreaColors.statusByStyle[1],
    badgeClass: "bg-[#A39BFC]/20 text-[#6F63F2]",
  },
  2: {
    label: "Orange",
    color: acquisitionAreaColors.statusByStyle[2],
    badgeClass: "bg-[#FF9A5C]/20 text-[#D46D2F]",
  },
  3: {
    label: "Grün",
    color: acquisitionAreaColors.statusByStyle[3],
    badgeClass: "bg-[#369648]/20 text-[#2F7F3D]",
  },
  4: {
    label: "Hellgrün",
    color: acquisitionAreaColors.statusByStyle[4],
    badgeClass: "bg-[#A1EE6B]/20 text-[#5F8C2E]",
  },
} as const

export const acquisitionAreaStatusStyleOrder = [1, 2, 3, 4] as const

export type AcquisitionAreaStatusStyle = keyof typeof acquisitionAreaStatusStyles
export type AcquisitionAreaStatusStyleValue = `${AcquisitionAreaStatusStyle}`

export const acquisitionAreaStatusStyleOptions = acquisitionAreaStatusStyleOrder.map((style) => ({
  value: String(style) as AcquisitionAreaStatusStyleValue,
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
