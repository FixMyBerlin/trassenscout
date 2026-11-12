import { twJoin, twMerge } from "tailwind-merge"

/** Compact action button base — Tailwind UI sizing, icon-ready via gap-x-1.5. */
export const compactButtonBase =
  "inline-flex w-full cursor-pointer items-center justify-center gap-x-1.5 rounded-md text-base font-medium shadow-xs no-underline transition-colors sm:w-auto sm:text-sm"

export type CompactButtonSize = "md" | "sm" | "icon"

const transparentBorder = "border border-transparent"

const compactPadding = twJoin(transparentBorder, "px-4 py-2")

export const compactPaddingSm = "px-3 py-1.5"

/** Icon-only control — PageHeader toolbar icon links. */
export const compactPaddingIcon = "p-2 sm:p-1.5"

const compactPaddingBySize: Record<CompactButtonSize, string> = {
  md: compactPadding,
  sm: twJoin(transparentBorder, compactPaddingSm, "w-auto"),
  icon: twJoin(transparentBorder, compactPaddingIcon),
}

const primaryColors =
  "bg-blue-500 text-white hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-500"

const primaryColorsForButton =
  "enabled:bg-blue-500 enabled:text-white enabled:hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 enabled:active:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"

const secondaryColors =
  "bg-white text-gray-900 inset-ring inset-ring-gray-300 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"

const secondaryColorsForButton =
  "enabled:bg-white enabled:text-gray-900 inset-ring inset-ring-gray-300 enabled:hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"

const pinkColors =
  "bg-pink-500 text-white hover:bg-pink-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 active:bg-pink-500"

function compactClassName(colors: string, size: CompactButtonSize = "md") {
  return twMerge(compactButtonBase, compactPaddingBySize[size], colors)
}

/** Primary action — button element (`<button>`). */
export const primaryButtonClassName = compactClassName(primaryColorsForButton)

export const primaryButtonSmClassName = compactClassName(primaryColorsForButton, "sm")

/** Secondary action — button element (`<button>`). */
export const secondaryButtonClassName = compactClassName(secondaryColorsForButton)

export const secondaryButtonSmClassName = compactClassName(secondaryColorsForButton, "sm")

export const iconButtonClassName = twJoin(
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md shadow-xs transition-colors",
  secondaryColorsForButton,
)

export function buttonLinkClassName(
  variant: "blue" | "white" | "pink",
  size: CompactButtonSize = "md",
) {
  switch (variant) {
    case "white":
      return compactClassName(secondaryColors, size)
    case "pink":
      return compactClassName(pinkColors, size)
    case "blue":
      return compactClassName(primaryColors, size)
  }
}
