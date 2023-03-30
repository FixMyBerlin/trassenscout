import clsx from "clsx"
import { ReactNode } from "react"
import { pinkButtonStyles, whiteButtonStyles } from "src/core/components/links"
import { TSurveyButton } from "../survey/Page"
export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  color?: string
  disabled?: boolean
  children: string | ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const ParticipationButton: React.FC<Props> = ({
  disabled,
  color = "pink",
  children,
  ...props
}) => {
  const buttonStyles = clsx(
    "px-12",
    color === "white" ? whiteButtonStyles : pinkButtonStyles,
    disabled && "opacity-20"
  )

  return (
    <button disabled={disabled} {...props} className={buttonStyles}>
      {children}
    </button>
  )
}
