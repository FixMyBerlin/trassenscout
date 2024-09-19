import { clsx } from "clsx"
import { LinkProps } from "./Link"

// BUTTON:
const buttonBase =
  "w-full font-medium sm:w-auto shadow-sm text-sm py-3.5 px-6 rounded-lg inline-flex items-center justify-center no-underline disabled:text-gray-400 disabled:bg-white disabled:ring-1 disabled:ring-gray-400"

// LINK
export const linkStyles = "text-blue-500 hover:text-blue-800"

// HOVER and ACTIVE
// for button elements
const hoverStyleForButtonElement = "enabled:hover:bg-blue-800 enabled:hover:text-white"
const activeStyleBlueButtonElement =
  "enabled:active:ring-2 enabled:active:ring-blue-800 enabled:active:bg-blue-500"
const activeStyleWhiteButtonElement =
  "enabled:active:ring-2 enabled:active:ring-blue-800 enabled:active:bg-white enabled:active:text-black"
const activeStylePinkButtonElement =
  "enabled:active:ring-2 enabled:active:ring-blue-800 enabled:active:bg-pink-500 enabled:hover:bg-blue-800 enabled:hover:text-white"
// for link elements
const hoverStyleForLinkElement = "hover:bg-blue-800 hover:text-white"
const activeStyleBlueLinkElement = "active:ring-2 active:ring-blue-800 active:bg-blue-500"
const activeStylePinkLinkElement =
  "active:ring-2 active:ring-blue-800 active:bg-pink-500 hover:bg-blue-800 hover:text-white"
const activeStyleWhiteLinkElement =
  "active:ring-2 active:ring-blue-800 active:bg-white active:text-black"

// BLUE BUTTON
// for link elements
const blueButtonStylesForLinkElement = clsx(
  buttonBase,
  "bg-blue-500 text-white",
  hoverStyleForLinkElement,
  activeStyleBlueLinkElement,
)
// for button elements
export const blueButtonStyles = clsx(
  buttonBase,
  "enabled:bg-blue-500 enabled:text-white",
  hoverStyleForButtonElement,
  activeStyleBlueButtonElement,
)

// WHITE BUTTON
// for link elements
const whiteButtonStylesForLinkElement = clsx(
  buttonBase,
  "bg-white ring-1 ring-gray-400",
  hoverStyleForLinkElement,
  activeStyleWhiteLinkElement,
)
// for button elements
export const whiteButtonStyles = clsx(
  buttonBase,
  "enabled:bg-white enabled:ring-1 enabled:ring-gray-400",
  hoverStyleForButtonElement,
  activeStyleWhiteButtonElement,
)

// PINK BUTTON
// for link elements
const pinkButtonStylesForLinkElement = clsx(
  buttonBase,
  "bg-pink-500 text-white",
  activeStylePinkLinkElement,
)
// for button elements
export const pinkButtonStyles = clsx(
  buttonBase,
  "enabled:bg-pink-500 enabled:text-white",
  activeStylePinkButtonElement,
)

export const selectLinkStyle = (button: LinkProps["button"], className?: string) => {
  switch (button) {
    case true:
      return clsx(blueButtonStylesForLinkElement, className)
    case "blue":
      return clsx(blueButtonStylesForLinkElement, className)
    case "white":
      return clsx(whiteButtonStylesForLinkElement, className)
    case "pink":
      return clsx(pinkButtonStylesForLinkElement, className)
    default:
      return clsx(linkStyles, className)
  }
}

// TODO Farben (blue --> petrol) nach Farbskala wenn fertig
// TODO Link styles
