import clsx from "clsx"
import { pinkButtonStyles, whiteButtonStyles } from "src/core/components/links"
import { ParticipationButton } from "../core/ParticipationButton"
import { TButton } from "./Page"
export { FORM_ERROR } from "src/core/components/forms"

export type TSurveyButton = {
  button: TButton
  buttonActions: { next: any; back: any; reset: any }
  disabled?: boolean
}

export const SurveyButton: React.FC<TSurveyButton> = ({ disabled, button, buttonActions }) => {
  const { label, color, onClick } = button

  if (onClick.action === "submit")
    return (
      <ParticipationButton disabled={disabled} color={color} type="submit">
        {label.de}
      </ParticipationButton>
    )

  let buttonActionSelect: any
  switch (onClick.action) {
    case "reset":
      buttonActionSelect = buttonActions.reset
      break
    case "nextPage":
      buttonActionSelect = buttonActions.next
      break
    case "previousPage":
      buttonActionSelect = buttonActions.back
      break
  }

  return (
    <ParticipationButton
      disabled={disabled}
      type="button"
      color={color}
      onClick={buttonActionSelect}
    >
      {label.de}
    </ParticipationButton>
  )
}
