import { useAlertBeforeUnload } from "../utils/useAlertBeforeUnload"
import { SurveyButton } from "./core/buttons/SurveyButton"
import { SurveyButtonWrapper } from "./core/buttons/SurveyButtonWrapper"
import { SurveyScreenHeader } from "./core/layout/SurveyScreenHeader"
import { TMore } from "./types"

type Props = {
  onClickMore: any
  onClickFinish: any
  more: TMore
}

export const More = ({ more, onClickMore, onClickFinish }: Props) => {
  useAlertBeforeUnload()

  const { title, description, questionText, buttons } = more

  return (
    <>
      <SurveyScreenHeader title={title.de} description={description.de} />
      <SurveyButtonWrapper>
        {buttons[0] && (
          <SurveyButton color={buttons[0].color} onClick={onClickMore}>
            {buttons[0].label.de}
          </SurveyButton>
        )}
        {buttons[1] && (
          <SurveyButton color={buttons[1].color} onClick={onClickFinish}>
            {buttons[1].label.de}
          </SurveyButton>
        )}
      </SurveyButtonWrapper>
    </>
  )
}
