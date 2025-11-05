import { clsx } from "clsx"
import { SurveyLinkProps } from "./SurveyLink"

// BUTTON:
const buttonBase =
  "w-full font-medium sm:w-auto shadow-xs text-sm sm:text-base pb-3.5 pt-4 px-6 rounded-lg inline-flex items-center justify-center no-underline"

// LINK
export const partcipationLinkStyles =
  "underline text-(--survey-primary-color) decoreation-[var(--survey-primary-color)] hover:text-(--survey-dark-color) hover:decoration-(--survey-dark-color)"

// HOVER and ACTIVE
// for button elements
const hoverStyleForButtonElement = "enabled:hover:bg-(--survey-dark-color) enabled:hover:text-white"
const activeStyleWhiteButtonElement =
  "enabled:active:ring-2 enabled:active:ring-(--survey-dark-color) enabled:active:bg-white enabled:active:text-black"
const activeStylePrimaryColorButtonElement =
  "enabled:active:ring-2 enabled:active:ring-(--survey-dark-color) enabled:active:bg-(--survey-primary-color) enabled:hover:bg-(--survey-dark-color) enabled:hover:text-white"
// for link elements
const hoverStyleForLinkElement = "hover:bg-(--survey-dark-color) hover:text-white"
const activeStylePrimaryColorLinkElement =
  "active:ring-2 active:ring-(--survey-dark-color) active:bg-(--survey-primary-color) hover:bg-(--survey-dark-color) hover:text-white"
const activeStyleWhiteLinkElement =
  "active:ring-2 active:ring-(--survey-dark-color) active:bg-white active:text-black"

// WHITE BUTTON
// for link elements
const whiteButtonStylesForLinkElement = clsx(
  buttonBase,
  "bg-white ring-1 ring-gray-400",
  hoverStyleForLinkElement,
  activeStyleWhiteLinkElement,
)
// for button elements
export const surveyWhiteButtonStyles = clsx(
  buttonBase,
  "enabled:bg-white enabled:ring-1 enabled:ring-gray-400",
  "disabled:bg-white disabled:text-gray-400 disabled:ring-1 disabled:ring-gray-200",
  hoverStyleForButtonElement,
  activeStyleWhiteButtonElement,
)

// primary color survey BUTTON
// for link elements
export const primaryColorButtonStylesForLinkElement = clsx(
  buttonBase,
  "bg-(--survey-primary-color) text-white",
  activeStylePrimaryColorLinkElement,
)
// for button elements
export const surveyPrimaryColorButtonStyles = clsx(
  buttonBase,
  "bg-(--survey-primary-color) enabled:text-white",
  "disabled:bg-(--survey-light-color) disabled:text-white",
  activeStylePrimaryColorButtonElement,
)

export const selectSurveyLinkStyle = (button: SurveyLinkProps["button"], className?: string) => {
  switch (button) {
    case true:
      return clsx(primaryColorButtonStylesForLinkElement, className)
    case "white":
      return clsx(whiteButtonStylesForLinkElement, className)
    case "primaryColor":
      return clsx(primaryColorButtonStylesForLinkElement, className)
    default:
      return clsx(partcipationLinkStyles, className)
  }
}
