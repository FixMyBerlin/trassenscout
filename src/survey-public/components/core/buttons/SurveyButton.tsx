import clsx from "clsx"
import { ReactNode } from "react"
import { surveyPrimaryColorButtonStyles, surveyWhiteButtonStyles } from "../links/styles"
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
    case "primaryColor":
      colorClass = surveyPrimaryColorButtonStyles
      break
    default:
      colorClass = surveyPrimaryColorButtonStyles
  }

  return (
    <button disabled={disabled} {...props} className={clsx("px-12", colorClass)}>
      {children}
    </button>
  )
}
