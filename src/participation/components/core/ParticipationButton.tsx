import clsx from "clsx"
import { pinkButtonStyles, whiteButtonStyles } from "src/core/components/links"
import { TButton } from "../pages/Page"
export { FORM_ERROR } from "src/core/components/forms"

export type TParticipationButton = {
  button: TButton
  buttonActions: { next: any; back: any; reset: any }
  disabled?: boolean
}

export const ParticipationButton: React.FC<TParticipationButton> = ({
  disabled,
  button,
  buttonActions,
}) => {
  const { label, color, onClick } = button
  const buttonStyles = clsx("px-12", color === "white" ? whiteButtonStyles : pinkButtonStyles)

  if (onClick.action === "submit")
    return (
      <button disabled={disabled} type="submit" className={buttonStyles}>
        {label.de}
      </button>
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
    <button disabled={disabled} type="button" className={buttonStyles} onClick={buttonActionSelect}>
      {label.de}
    </button>
  )
}
