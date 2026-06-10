import { clsx } from "clsx"
import {
  pinkButtonLinkClassName,
  primaryButtonClassName,
  primaryButtonLinkClassName,
  secondaryButtonClassName,
  secondaryButtonLinkClassName,
} from "@/src/components/core/components/buttons/buttonStyles"
import { LinkProps } from "./Link"

// LINK
export const linkStyles = "text-blue-500 hover:text-blue-800 cursor-pointer"

/** @deprecated Use `primaryButtonClassName` from `buttonStyles`. */
export const blueButtonStyles = primaryButtonClassName

/** @deprecated Use `primaryButtonLinkClassName` from `buttonStyles`. */
export const blueButtonStylesForLinkElement = primaryButtonLinkClassName

/** @deprecated Use `secondaryButtonClassName` from `buttonStyles`. */
export const whiteButtonStyles = secondaryButtonClassName

export const selectLinkStyle = (button: LinkProps["button"], className?: string) => {
  switch (button) {
    case true:
    case "blue":
      return clsx(primaryButtonLinkClassName, className)
    case "white":
      return clsx(secondaryButtonLinkClassName, className)
    case "pink":
      return clsx(pinkButtonLinkClassName, className)
    case undefined:
      return clsx(linkStyles, className)
  }
}
