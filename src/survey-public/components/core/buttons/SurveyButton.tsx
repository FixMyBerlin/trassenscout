import clsx from "clsx"
import { ReactNode } from "react"
import { surveyPinkButtonStyles, surveyWhiteButtonStyles } from "../links/styles"
export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  color?: string
  disabled?: boolean
  children: string | ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const SurveyButton: React.FC<Props> = ({ disabled, color = "pink", children, ...props }) => {
  const buttonStyles = clsx(
    "px-12",
    color === "white" ? surveyWhiteButtonStyles : surveyPinkButtonStyles,
  )

  return (
    <button disabled={disabled} {...props} className={buttonStyles}>
      {children}
    </button>
  )
}
