import type { TagColorEnum } from "@/src/prisma/generated/browser"

// Swatch colours from the tag design; pink is the design's label, the others derive border and text from it.
export const tagColors = {
  LIGHT_BLUE: {
    label: "Hellblau",
    swatch: "bg-[#DFE8F7]",
    pill: "border-[#BFCEE6] bg-[#DFE8F7] text-[#384B6A]",
  },
  BLUE: {
    label: "Blau",
    swatch: "bg-[#B7DBFF]",
    pill: "border-[#97C2EE] bg-[#B7DBFF] text-[#28517A]",
  },
  VIOLET: {
    label: "Violett",
    swatch: "bg-[#C3C4FF]",
    pill: "border-[#A2A3EF] bg-[#C3C4FF] text-[#28297A]",
  },
  PINK: {
    label: "Rosa",
    swatch: "bg-[#FFB9DD]",
    pill: "border-[#EE99C7] bg-[#FFB9DD] text-[#7A2851]",
  },
  RED: {
    label: "Rot",
    swatch: "bg-[#FFA8A8]",
    pill: "border-[#EC8A8A] bg-[#FFA8A8] text-[#7A2828]",
  },
  ORANGE: {
    label: "Orange",
    swatch: "bg-[#FBC39C]",
    pill: "border-[#E5AA81] bg-[#FBC39C] text-[#774A2B]",
  },
  YELLOW: {
    label: "Gelb",
    swatch: "bg-[#FFEDA3]",
    pill: "border-[#EBD786] bg-[#FFEDA3] text-[#7A6A28]",
  },
  LIME: {
    label: "Hellgrün",
    swatch: "bg-[#D7FBA0]",
    pill: "border-[#BFE684] bg-[#D7FBA0] text-[#59772B]",
  },
  MINT: {
    label: "Mint",
    swatch: "bg-[#C0FFDD]",
    pill: "border-[#9FEFC4] bg-[#C0FFDD] text-[#287A4E]",
  },
  CYAN: {
    label: "Türkis",
    swatch: "bg-[#B2F9FF]",
    pill: "border-[#93E6ED] bg-[#B2F9FF] text-[#28747A]",
  },
} as const satisfies Record<TagColorEnum, { label: string; swatch: string; pill: string }>

export type TagColor = keyof typeof tagColors

export const TAG_COLORS = Object.keys(tagColors) as TagColor[]

/** Same as the database default (prisma/schema.prisma, Tag.color). */
export const DEFAULT_TAG_COLOR: TagColor = "LIGHT_BLUE"

/** Tags without a colour (e.g. Beteiligung tags) keep the neutral pill. */
export function tagPillColorClassName(color: TagColor | null | undefined) {
  return color ? tagColors[color].pill : "border-transparent bg-gray-100"
}
