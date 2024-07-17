import { useContext, useEffect, useState } from "react"

import { useFormContext, useFormState } from "react-hook-form"
import { ProgressContext } from "src/survey-public/context/contexts"
import { scrollToTopWithDelay } from "src/survey-public/utils/scrollToTopWithDelay"
import { Debug } from "../core/Debug"
import {
  TFeedback,
  TInstitutionsBboxes,
  TMapProps,
  TPage,
  TProgress,
  TResponseConfig,
} from "../types"
import { FeedbackFirstPage } from "./FeedbackFirstPage"
import { FeedbackSecondPage } from "./FeedbackSecondPage"
import { useAlertBeforeUnload } from "src/survey-public/utils/useAlertBeforeUnload"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onBackClick: any
  feedback: TFeedback
  stageProgressDefinition: TProgress
  responseConfig: TResponseConfig
  maptilerUrl: string
  institutionsBboxes?: TInstitutionsBboxes
  setIsMapDirty: (value: boolean) => void
  isFirstPageCompletedProps: {
    isFirstPageCompleted: boolean
    setIsFirstPageCompleted: (value: boolean) => void
  }
  isSecondPageCompletedProps: {
    isSecondPageCompleted: boolean
    setIsSecondPageCompleted: (value: boolean) => void
  }
}

export const Feedback: React.FC<Props> = ({
  institutionsBboxes,
  onBackClick,
  feedback,
  stageProgressDefinition,
  responseConfig,
  maptilerUrl,
  setIsMapDirty,
  isFirstPageCompletedProps: { isFirstPageCompleted, setIsFirstPageCompleted },
  isSecondPageCompletedProps: { isSecondPageCompleted, setIsSecondPageCompleted },
}) => {
  const { setProgress } = useContext(ProgressContext)

  useAlertBeforeUnload()

  const [feedbackPageProgress, setFeedbackPageProgress] = useState(0)

  const { getValues, setValue } = useFormContext()
  const responsesForDebugging = getValues()
  const { evaluationRefs } = responseConfig
  const isUserLocationQuestionId = evaluationRefs["is-feedback-location"]

  useEffect(() => {
    // inital value of is location is set to true
    setValue(`single-${isUserLocationQuestionId}`, "1")
  }, [isUserLocationQuestionId, setValue])

  const { pages } = feedback

  const lineGeometryId = evaluationRefs["line-geometry"] as number
  const pinId = evaluationRefs["feedback-location"] as number
  const userLocationQuestionId = evaluationRefs["feedback-location"]
  const feedbackCategoryId = evaluationRefs["feedback-category"]
  const userText1Id = evaluationRefs["feedback-usertext-1"]
  const userText2Id = evaluationRefs["feedback-usertext-2"]

  const mapProps = pages[1]?.questions.find((q) => q.id === pinId)?.props as TMapProps

  const handleNextPage = () => {
    const newFeedbackPageProgress = Math.min(pages.length, feedbackPageProgress + 1)
    setFeedbackPageProgress(newFeedbackPageProgress)
    setProgress(stageProgressDefinition["FEEDBACK"] + newFeedbackPageProgress)
    scrollToTopWithDelay()
  }

  const handleBackPage = () => {
    const newFeedbackPageProgress = Math.max(0, feedbackPageProgress - 1)
    setFeedbackPageProgress(newFeedbackPageProgress)
    setProgress(stageProgressDefinition["FEEDBACK"] + newFeedbackPageProgress)
    scrollToTopWithDelay()
  }

  return (
    <>
      <Debug className="border-red-500">
        <code>
          <pre>{JSON.stringify(responsesForDebugging, null, 2)}</pre>
        </code>
      </Debug>
      {/* clean up BB remove setIsCompleted from FeedbackFirstPage props */}
      {feedbackPageProgress === 0 && (
        <FeedbackFirstPage
          institutionsBboxes={institutionsBboxes}
          maptilerUrl={maptilerUrl}
          isCompletedProps={{
            isCompleted: isFirstPageCompleted,
            setIsCompleted: setIsFirstPageCompleted,
          }}
          page={pages[0]}
          onButtonClick={handleNextPage}
          feedbackCategoryId={feedbackCategoryId!}
          legend={mapProps.legend}
          onBackClick={onBackClick}
        />
      )}
      {feedbackPageProgress === 1 && (
        <FeedbackSecondPage
          isCompletedProps={{
            isCompleted: isSecondPageCompleted,
            setIsCompleted: setIsSecondPageCompleted,
          }}
          setIsMapDirty={setIsMapDirty}
          maptilerUrl={maptilerUrl}
          mapProps={mapProps}
          page={pages[1] as TPage}
          onButtonClick={handleBackPage}
          userTextIndices={[userText1Id, userText2Id]}
          pinId={pinId}
          isUserLocationQuestionId={isUserLocationQuestionId!}
          userLocationQuestionId={userLocationQuestionId!}
          lineGeometryId={lineGeometryId}
        />
      )}
    </>
  )
}
