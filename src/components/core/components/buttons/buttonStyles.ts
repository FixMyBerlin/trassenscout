import { twJoin } from "tailwind-merge"

/** Compact action button base — Tailwind UI sizing, icon-ready via gap-x-1.5. */
export const compactButtonBase =
  "inline-flex w-full cursor-pointer items-center justify-center gap-x-1.5 rounded-md text-sm font-medium shadow-xs no-underline transition-colors sm:w-auto"

const primaryColors =
  "bg-blue-500 text-white hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-500"

const primaryColorsForButton =
  "enabled:bg-blue-500 enabled:text-white enabled:hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 enabled:active:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"

const secondaryColors =
  "bg-white text-gray-900 inset-ring inset-ring-gray-300 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"

const secondaryColorsForButton =
  "enabled:bg-white enabled:text-gray-900 inset-ring inset-ring-gray-300 enabled:hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"

const compactPadding = "px-4 py-2.5"

/** Primary action — link element (`<a>`). */
export const primaryButtonLinkClassName = twJoin(compactButtonBase, compactPadding, primaryColors)

/** Primary action — button element (`<button>`). */
export const primaryButtonClassName = twJoin(
  compactButtonBase,
  compactPadding,
  primaryColorsForButton,
)

/** Secondary action — link element (`<a>`). */
export const secondaryButtonLinkClassName = twJoin(
  compactButtonBase,
  compactPadding,
  secondaryColors,
)

/** Secondary action — button element (`<button>`). */
export const secondaryButtonClassName = twJoin(
  compactButtonBase,
  compactPadding,
  secondaryColorsForButton,
)

const pinkColors =
  "bg-pink-500 text-white hover:bg-pink-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 active:bg-pink-500"

/** Accent action — link element (`<a>`). */
export const pinkButtonLinkClassName = twJoin(compactButtonBase, compactPadding, pinkColors)
