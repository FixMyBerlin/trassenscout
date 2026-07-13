import { twJoin } from "tailwind-merge"
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
      return twJoin(primaryButtonLinkClassName, className)
    case "white":
      return twJoin(secondaryButtonLinkClassName, className)
    case "pink":
      return twJoin(pinkButtonLinkClassName, className)
    case undefined:
      return twJoin(linkStyles, className)
  }
}
