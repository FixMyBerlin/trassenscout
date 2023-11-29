import { SurveyH2 } from "./core/Text"
import { SurveyButton } from "./core/buttons/SurveyButton"
import { SurveyButtonWrapper } from "./core/buttons/SurveyButtonWrapper"
import { SurveyScreenHeader } from "./core/layout/SurveyScreenHeader"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onClickMore: any
  onClickFinish: any
  more: any // TODO
}

export const More: React.FC<Props> = ({ more, onClickMore, onClickFinish }) => {
  const { title, description, questionText, buttons } = more

  return (
    <>
      <SurveyScreenHeader title={title.de} description={description.de} />
      <SurveyH2>{questionText.de}</SurveyH2>
      <SurveyButtonWrapper>
        <SurveyButton color={buttons[0].color} onClick={onClickMore}>
          {buttons[0].label.de}
        </SurveyButton>
        <SurveyButton color={buttons[1].color} onClick={onClickFinish}>
          {buttons[1].label.de}
        </SurveyButton>
      </SurveyButtonWrapper>
    </>
  )
}
