import { ProgressContext } from "@/src/survey-public/context/contexts"
import { scrollToTopWithDelay } from "@/src/survey-public/utils/scrollToTopWithDelay"
import { useAlertBeforeUnload } from "@/src/survey-public/utils/useAlertBeforeUnload"
import { useContext, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { getFormfieldName, getFormfieldNamesByQuestions } from "../../utils/getFormfieldNames"
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

type Props = {
  onBackClick: any
  feedback: TFeedback
  stageProgressDefinition: TProgress
  responseConfig: TResponseConfig
  maptilerUrl: string
  institutionsBboxes?: TInstitutionsBboxes
  setIsMapDirty: (value: boolean) => void
}

export const Feedback = ({
  institutionsBboxes,
  onBackClick,
  feedback,
  stageProgressDefinition,
  responseConfig,
  maptilerUrl,
  setIsMapDirty,
}: Props) => {
  const {
    formState: { errors },
  } = useFormContext()
  console.log(errors)
  const { setProgress } = useContext(ProgressContext)

  useAlertBeforeUnload()

  const { getValues, setValue, trigger, clearErrors } = useFormContext()
  const [feedbackPageProgress, setFeedbackPageProgress] = useState(0)
  const responsesForDebugging = getValues()
  const { evaluationRefs } = responseConfig
  const isUserLocationQuestionId = evaluationRefs["is-feedback-location"]

  useEffect(() => {
    // inital value of is location is set to true ("1")
    setValue(getFormfieldName("singleResponse", isUserLocationQuestionId), "1")
  }, [isUserLocationQuestionId, setValue])

  const { pages } = feedback

  const lineGeometryId = evaluationRefs["line-geometry"] as number
  const pinId = evaluationRefs["feedback-location"] as number
  const userLocationQuestionId = evaluationRefs["feedback-location"]
  const feedbackCategoryId = evaluationRefs["feedback-category"]
  const userText1Id = evaluationRefs["feedback-usertext-1"]
  const userText2Id = evaluationRefs["feedback-usertext-2"]

  const mapProps = pages[1]?.questions.find((q) => q.id === pinId)?.props as TMapProps

  const relevantQuestionsSecondPage = [
    pages[0]!.questions.find((q) => q.id === feedbackCategoryId)!,
    // todo clean up or refactor after survey BB
    // for BB we have a the map for line selection on the first page - so we manually add it here for validation
    pages[0]!.questions.find((q) => q.id === 21)!,
  ]

  const relevantQuestionNamesFirstPage = getFormfieldNamesByQuestions(relevantQuestionsSecondPage)

  const handleFirstToSecondPage = async () => {
    const isValid = await trigger(relevantQuestionNamesFirstPage)
    if (isValid) {
      const newFeedbackPageProgress = 1
      setFeedbackPageProgress(newFeedbackPageProgress)
      setProgress(stageProgressDefinition["FEEDBACK"] + newFeedbackPageProgress)
      scrollToTopWithDelay()
    }
  }

  const handleSecondToFirstPage = () => {
    clearErrors()
    const newFeedbackPageProgress = 0
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
          page={pages[0]}
          onButtonClick={handleFirstToSecondPage}
          feedbackCategoryId={feedbackCategoryId!}
          legend={mapProps.legend}
          onBackClick={onBackClick}
        />
      )}
      {feedbackPageProgress === 1 && (
        <FeedbackSecondPage
          setIsMapDirty={setIsMapDirty}
          maptilerUrl={maptilerUrl}
          mapProps={mapProps}
          page={pages[1] as TPage}
          onButtonClick={handleSecondToFirstPage}
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
