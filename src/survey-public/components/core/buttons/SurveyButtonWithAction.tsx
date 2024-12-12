import { TButtonWithAction } from "@/src/survey-public/components/types"
import { useFormContext } from "react-hook-form"
import { SurveyButton } from "./SurveyButton"

type Props = {
  button: TButtonWithAction
  buttonActions: { next: () => void; back: () => void }
  relevantQuestionNames: string[]
}

export const SurveyButtonWithAction: React.FC<Props> = ({
  button,
  relevantQuestionNames,
  buttonActions,
}) => {
  const { trigger, clearErrors } = useFormContext()
  const { label, color, onClick } = button

  const handleNextClick = async () => {
    const isValid = await trigger(relevantQuestionNames)
    if (isValid) {
      buttonActions.next()
    }
  }
  const handleBackClick = async () => {
    clearErrors()
    buttonActions.back()
  }

  if (onClick.action === "previousPage") {
    return (
      <SurveyButton type="button" color={color} onClick={handleBackClick}>
        {label.de}
      </SurveyButton>
    )
  }

  if (onClick.action === "nextPage") {
    return (
      <SurveyButton color={color} type="button" onClick={handleNextClick}>
        {label.de}
      </SurveyButton>
    )
  }

  if (onClick.action === "submit")
    return (
      <SurveyButton color={color} type="submit">
        {label.de}
      </SurveyButton>
    )
}
