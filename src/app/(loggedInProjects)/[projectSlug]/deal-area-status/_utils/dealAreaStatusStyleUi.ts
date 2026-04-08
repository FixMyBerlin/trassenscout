export const dealAreaStatusStyleOptions = [
  { value: "1", label: "Lila" },
  { value: "2", label: "Orange" },
  { value: "3", label: "Grün" },
] as const

export const dealAreaStatusStyleTranslations: Record<1 | 2 | 3, string> = {
  1: "Lila",
  2: "Orange",
  3: "Grün",
}

export const dealAreaStatusStyleBadgeClasses: Record<1 | 2 | 3, string> = {
  1: "bg-[#A39BFC]/20 text-[#6F63F2]",
  2: "bg-[#FF9A5C]/20 text-[#D46D2F]",
  3: "bg-[#369648]/20 text-[#2F7F3D]",
}
