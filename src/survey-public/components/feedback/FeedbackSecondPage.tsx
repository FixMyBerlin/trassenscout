import { useContext } from "react"
import { PinContext } from "src/survey-public/components/context/contexts"
import { SurveyButton } from "../core/buttons/SurveyButton"
import { SurveyButtonWrapper } from "../core/buttons/SurveyButtonWrapper"

import { MultiLineString } from "@turf/helpers"
import { SurveyScreenHeader } from "src/survey-public/components/core/layout/SurveyScreenHeader"
import { SurveyH2, SurveyH3, SurveyP } from "../core/Text"
import { SurveyStaticMap } from "../maps/SurveyStaticMap"
import { Question } from "../Question"
import { TQuestion } from "src/survey-public/components/types"

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
  userTextIndices: (number | undefined)[]
}

export const FeedbackSecondPage: React.FC<Props> = ({
  page,
  isCompleted,
  onButtonClick,
  staticMapProps,
  feedbackCategory,
  userTextIndices,
}) => {
  const { pinPosition } = useContext(PinContext)
  const { title, description, questions, buttons } = page

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
        {userTextIndices.map((questionId) => {
          const q = questions.find((q: TQuestion) => q.id === questionId)
          if (q) return <Question key={questionId} question={q} />
        })}
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
