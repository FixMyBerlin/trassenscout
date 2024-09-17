import { TButtonWithAction } from "@/src/survey-public/components/types"
import { SurveyButton } from "./SurveyButton"
export { FORM_ERROR } from "@/src/core/components/forms"

type Props = {
  button: TButtonWithAction
  buttonActions: { next: () => void; back: () => void }
  disabled?: boolean
}

export const SurveyButtonWithAction: React.FC<Props> = ({ disabled, button, buttonActions }) => {
  const { label, color, onClick } = button

  if (onClick.action === "submit")
    return (
      <SurveyButton disabled={disabled} color={color} type="submit">
        {label.de}
      </SurveyButton>
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
    <SurveyButton disabled={disabled} type="button" color={color} onClick={buttonActionSelect}>
      {label.de}
    </SurveyButton>
  )
}
