import clsx from "clsx"
import { ReactNode } from "react"
import {
  surveyPinkButtonStyles,
  surveyRedButtonStyles,
  surveyWhiteButtonStyles,
} from "../links/styles"
import { pinkButtonStyles } from "src/core/components/links"
export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  color?: string
  disabled?: boolean
  children: string | ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const SurveyButton: React.FC<Props> = ({ disabled, color, children, ...props }) => {
  let colorClass: string
  switch (color) {
    case "white":
      colorClass = surveyWhiteButtonStyles
      break
    case "pink":
      colorClass = surveyPinkButtonStyles
      break
    case "red":
      colorClass = surveyRedButtonStyles
      break
    default:
      colorClass = pinkButtonStyles
  }
  const buttonStyles = clsx("px-12", colorClass)

  return (
    <button disabled={disabled} {...props} className={buttonStyles}>
      {children}
    </button>
  )
}
