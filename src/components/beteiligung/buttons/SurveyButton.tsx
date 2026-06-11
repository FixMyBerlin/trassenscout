import { ReactNode } from "react"
import { twJoin } from "tailwind-merge"
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
    case undefined:
    default:
      colorClass = surveyPrimaryColorButtonStyles
  }

  return (
    <button type={props.type ?? "button"} {...props} className={twJoin("px-12", colorClass)}>
      {children}
    </button>
  )
}
