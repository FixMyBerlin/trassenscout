import clsx from "clsx"
import { ParticipationLinkProps } from "./ParticipationLink"

// BUTTON:
const buttonBase =
  "w-full font-medium sm:w-auto shadow-sm text-sm pb-3.5 pt-4 px-6 rounded-lg inline-flex items-center justify-center no-underline"

// LINK
export const partcipationLinkStyles =
  "underline text-pink-500 decoreation-pink-500 hover:text-blue-800 hover:decoration-blue-800 active:ring-1 ring-pink-500 rounded"

// HOVER and ACTIVE
// for button elements
const hoverStyleForButtonElement = "enabled:hover:bg-blue-800 enabled:hover:text-white"
const activeStyleWhiteButtonElement =
  "enabled:active:ring-2 enabled:active:ring-blue-800 enabled:active:bg-white enabled:active:text-black"
const activeStylePinkButtonElement =
  "enabled:active:ring-2 enabled:active:ring-blue-800 enabled:active:bg-pink-500 enabled:hover:bg-blue-800 enabled:hover:text-white"
// for link elements
const hoverStyleForLinkElement = "hover:bg-blue-800 hover:text-white"
const activeStylePinkLinkElement =
  "active:ring-2 active:ring-blue-800 active:bg-pink-500 hover:bg-blue-800 hover:text-white"
const activeStyleWhiteLinkElement =
  "active:ring-2 active:ring-blue-800 active:bg-white active:text-black"

// WHITE BUTTON
// for link elements
const whiteButtonStylesForLinkElement = clsx(
  buttonBase,
  "bg-white ring-1 ring-gray-400",
  hoverStyleForLinkElement,
  activeStyleWhiteLinkElement,
)
// for button elements
export const participationWhiteButtonStyles = clsx(
  buttonBase,
  "enabled:bg-white enabled:ring-1 enabled:ring-gray-400",
  "disabled:text-gray-400 disabled:bg-white disabled:ring-1 disabled:ring-gray-200",
  hoverStyleForButtonElement,
  activeStyleWhiteButtonElement,
)

// PINK BUTTON
// for link elements
const pinkButtonStylesForLinkElement = clsx(
  buttonBase,
  "text-white bg-pink-500",
  activeStylePinkLinkElement,
)
// for button elements
export const participationPinkButtonStyles = clsx(
  buttonBase,
  "enabled:text-white enabled:bg-pink-500",
  "disabled:bg-pink-100 disabled:text-white",
  activeStylePinkButtonElement,
)

export const selectParticipationLinkStyle = (
  button: ParticipationLinkProps["button"],
  className?: string,
) => {
  switch (button) {
    case true:
      return clsx(pinkButtonStylesForLinkElement, className)
    case "white":
      return clsx(whiteButtonStylesForLinkElement, className)
    case "pink":
      return clsx(pinkButtonStylesForLinkElement, className)
    default:
      return clsx(partcipationLinkStyles, className)
  }
}
