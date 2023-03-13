import clsx from "clsx"
import { LinkProps } from "./Link"

// LINK
export const linkStyles =
  "text-sm text-blue-500 hover:text-blue-800 active:ring-1 active:ring-blue-500 rounded-sm"

// HOVER and ACTIVE
const hoverStyleForButtonElement = "enabled:hover:bg-blue-800 enabled:hover:text-white"
const activeStyleBlueButtonElement =
  "enabled:active:ring-2 enabled:active:ring-blue-800 enabled:active:bg-blue-500"
const activeStyleWhiteButtonElement =
  "enabled:active:ring-2 enabled:active:ring-blue-500 enabled:active:bg-white enabled:active:text-black"

const hoverStyleForLinkElement = "hover:bg-blue-800 hover:text-white"
const activeStyleBlueLinkElement = "active:ring-2 active:ring-blue-800 active:bg-blue-500"
const activeStyleWhiteLinkElement =
  "active:ring-2 active:ring-blue-500 active:bg-white active:text-black"

const buttonBase =
  "w-full sm:w-auto shadow-sm text-sm py-3 px-6 text-sm font-normal rounded-lg inline-flex items-center justify-center no-underline"

// BLUE BUTTON
const blueButtonBase = clsx(buttonBase, "text-white bg-blue-500")
const blueButtonStylesForLinkElement = clsx(
  blueButtonBase,
  hoverStyleForLinkElement,
  activeStyleBlueLinkElement
)
export const blueButtonStyles = clsx(
  blueButtonBase,
  hoverStyleForButtonElement,
  activeStyleBlueButtonElement
)

// WHITE BUTTON
const whiteButtonBase = clsx(buttonBase, "bg-white ring-2 ring-gray-500")
const whiteButtonStylesForLinkElement = clsx(
  whiteButtonBase,
  hoverStyleForLinkElement,
  activeStyleWhiteLinkElement
)
export const whiteButtonStyles = clsx(
  whiteButtonBase,
  hoverStyleForButtonElement,
  activeStyleWhiteButtonElement
)

export const selectLinkStyle = (button: LinkProps["button"], className?: string) => {
  switch (button) {
    case true:
      return clsx(blueButtonStylesForLinkElement, className)
    case "blue":
      return clsx(blueButtonStylesForLinkElement, className)
    case "white":
      return clsx(whiteButtonStylesForLinkElement, className)
    default:
      return clsx(linkStyles, className)
  }
}

// TODO Farben (blue --> petrol) nach Farbskala wenn fertig
// TODO Link styles
