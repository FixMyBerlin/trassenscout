import { ParticipationButton } from "src/participation/components/core/buttons/ParticipationButton"
import { Button } from "src/participation/data/types"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  button: Button
  buttonActions: { next: () => void; back: () => void }
  disabled?: boolean
}

export const SurveyButton: React.FC<Props> = ({ disabled, button, buttonActions }) => {
  const { label, color, onClick } = button

  if (onClick.action === "submit")
    return (
      <ParticipationButton disabled={disabled} color={color} type="submit">
        {label.de}
      </ParticipationButton>
    )

  let buttonActionSelect: any
  switch (onClick.action) {
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
