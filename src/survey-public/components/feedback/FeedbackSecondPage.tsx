import { useContext } from "react"
import { PinContext } from "src/survey-public/context/contexts"
import { SurveyButton } from "../core/buttons/SurveyButton"
import { SurveyButtonWrapper } from "../core/buttons/SurveyButtonWrapper"

import { SurveyScreenHeader } from "src/survey-public/components/core/layout/SurveyScreenHeader"
import { TPage, TQuestion } from "src/survey-public/components/types"
import { Question } from "../Question"
import { SurveyH2, SurveyH3, SurveyP } from "../core/Text"
import { SurveyStaticMap } from "../maps/SurveyStaticMap"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  page: TPage
  onButtonClick: any
  staticMapProps: {
    maptilerStyleUrl: string
  }
  feedbackCategory: string | undefined
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
      <SurveyH2>{questions![0]!.label.de}</SurveyH2>
      <SurveyP>{feedbackCategory}</SurveyP>

      {pinPosition && (
        <>
          <SurveyH3>{questions![1]!.label.de}</SurveyH3>
          <SurveyStaticMap marker={pinPosition} {...staticMapProps} />
        </>
      )}
      <div className="pt-8">
        {userTextIndices.map((questionId) => {
          const q = questions!.find((q: TQuestion) => q.id === questionId)
          if (q) return <Question key={questionId} question={q} />
        })}
      </div>

      <SurveyButtonWrapper>
        <SurveyButton
          color={buttons[0]?.color}
          disabled={!isCompleted}
          id="submit-finish"
          type="submit"
        >
          {buttons![0]?.label.de}
        </SurveyButton>
        <SurveyButton
          color={buttons[1]?.color}
          disabled={!isCompleted}
          id="submit-more"
          type="submit"
        >
          {buttons![1]?.label.de}
        </SurveyButton>
      </SurveyButtonWrapper>
      <SurveyButton color="white" type="button" onClick={onButtonClick}>
        Zurück
      </SurveyButton>
    </>
  )
}
