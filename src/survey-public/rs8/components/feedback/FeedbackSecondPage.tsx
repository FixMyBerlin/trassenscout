import { useContext } from "react"
import { PinContext } from "src/survey-public/components/context/contexts"
import { SurveyButton } from "../../../components/core/buttons/SurveyButton"
import { SurveyButtonWrapper } from "../../../components/core/buttons/SurveyButtonWrapper"

import { MultiLineString } from "@turf/helpers"
import { SurveyScreenHeader } from "src/survey-public/components/core/layout/SurveyScreenHeader"
import { SurveyH2, SurveyH3, SurveyP } from "../../../components/core/Text"
import { SurveyStaticMap } from "../../../components/maps/SurveyStaticMap"
import { Question } from "../../../components/Question"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  page: any // TODO
  onButtonClick: any // TODO
  staticMapProps: {
    projectGeometry: MultiLineString
    layerStyles: Record<string, any>
    maptilerStyleUrl: string
  }
  feedbackCategory: string
  isCompleted: boolean
}

export const FeedbackSecondPage: React.FC<Props> = ({
  page,
  isCompleted,
  onButtonClick,
  staticMapProps,
  feedbackCategory,
}) => {
  const { pinPosition } = useContext(PinContext)
  const { title, description, questions, buttons } = page

  const textAreaQuestions = questions.filter((q: Record<string, any>) => q.component === "text")

  return (
    <>
      <SurveyScreenHeader title={title.de} description={description.de} />
      <SurveyH2>{questions[0].label.de}</SurveyH2>
      <SurveyP>{feedbackCategory}</SurveyP>

      {pinPosition && (
        <>
          <SurveyH3>{questions[1].label.de}</SurveyH3>
          <SurveyStaticMap marker={pinPosition} {...staticMapProps} />
        </>
      )}
      <div className="pt-8">
        <Question question={textAreaQuestions[0]} />
        <Question question={textAreaQuestions[1]} />
      </div>

      <SurveyButtonWrapper>
        <SurveyButton disabled={!isCompleted} id="submit-finish" type="submit">
          {buttons[0].label.de}
        </SurveyButton>
        <SurveyButton color="white" disabled={!isCompleted} id="submit-more" type="submit">
          {buttons[1].label.de}
        </SurveyButton>
      </SurveyButtonWrapper>
      <SurveyButton color="white" type="button" onClick={onButtonClick}>
        Zurück
      </SurveyButton>
    </>
  )
}