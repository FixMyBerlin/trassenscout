import { clsx } from "clsx"
import {
  pinkButtonLinkClassName,
  primaryButtonLinkClassName,
  secondaryButtonLinkClassName,
} from "@/src/components/core/components/buttons/buttonStyles"
import { LinkProps } from "./Link"

// LINK
export const linkStyles = "text-blue-500 hover:text-blue-800 cursor-pointer"

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
