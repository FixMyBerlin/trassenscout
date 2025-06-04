import { clsx } from "clsx"
import { ReactNode } from "react"
import { surveyPrimaryColorButtonStyles, surveyWhiteButtonStyles } from "../links/styles"

type Props = {
  color?: string
  children: string | ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const SurveyButton = ({ color, children, ...props }: Props) => {
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
    <button {...props} className={clsx("px-12", colorClass)}>
      {children}
    </button>
  )
}
