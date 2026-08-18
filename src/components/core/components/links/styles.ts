import { twJoin } from "tailwind-merge"
import {
  buttonLinkClassName,
  type CompactButtonSize,
} from "@/src/components/core/components/buttons/buttonStyles"
import { LinkProps } from "./Link"

// LINK
export const linkStyles = "text-blue-500 hover:text-blue-800 cursor-pointer"

export const selectLinkStyle = (
  button: LinkProps["button"],
  className?: string,
  size: CompactButtonSize = "md",
) => {
  switch (button) {
    case true:
    case "blue":
      return twJoin(buttonLinkClassName("blue", size), className)
    case "white":
      return twJoin(buttonLinkClassName("white", size), className)
    case "pink":
      return twJoin(buttonLinkClassName("pink", size), className)
    case undefined:
      return twJoin(linkStyles, className)
  }
}
