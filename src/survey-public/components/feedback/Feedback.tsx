import { use, useCallback, useContext, useState } from "react"

import { ProgressContext } from "src/survey-public/context/contexts"
import { scrollToTopWithDelay } from "src/survey-public/utils/scrollToTopWithDelay"
import PublicSurveyForm from "../core/form/PublicSurveyForm"
import {
  TFeedback,
  TInstitutionsBboxes,
  TMapProps,
  TPage,
  TProgress,
  TResponseConfig,
  TSingleOrMultiResponseProps,
} from "../types"
import { FeedbackFirstPage } from "./FeedbackFirstPage"
import { FeedbackSecondPage } from "./FeedbackSecondPage"
import { is } from "date-fns/locale"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onSubmit: any
  feedback: TFeedback
  stageProgressDefinition: TProgress
  responseConfig: TResponseConfig
  maptilerUrl: string
  institutionsBboxes?: TInstitutionsBboxes
}

export const Feedback: React.FC<Props> = ({
  institutionsBboxes,
  onSubmit,
  feedback,
  stageProgressDefinition,
  responseConfig,
  maptilerUrl,
}) => {
  const { setProgress } = useContext(ProgressContext)
  const [isPageOneCompleted, setIsPageOneCompleted] = useState(false)
  const [isPageTwoCompleted, setIsPageTwoCompleted] = useState(false)
  const [isMapDirty, setIsMapDirty] = useState(false)
  const [feedbackPageProgress, setFeedbackPageProgress] = useState(0)

  const { pages } = feedback

  const { evaluationRefs } = responseConfig

  const lineGeometryId = evaluationRefs["line-geometry"] as number
  const pinId = evaluationRefs["feedback-location"] as number
  const isUserLocationQuestionId = evaluationRefs["is-feedback-location"]
  const userLocationQuestionId = evaluationRefs["feedback-location"]
  const feedbackCategoryId = evaluationRefs["feedback-category"]
  const userText1Id = evaluationRefs["feedback-usertext-1"]
  const userText2Id = evaluationRefs["feedback-usertext-2"]
  const categoryId = evaluationRefs["feedback-category"]

  // list of all question ids of page 1 and 2
  const pageOneQuestionIds = pages[0]?.questions.map((q) => q.id)
  const pageTwoQuestionIds = pages[1]?.questions.map((q) => q.id)

  const categoryProps = pages[0]?.questions.find((q) => q.id === categoryId)
    ?.props as TSingleOrMultiResponseProps

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

  const transformValues = (values: Record<string, null | string | boolean>) => {
    const responses: Record<string, null | string | number | number[]> = {}
    Object.entries(values).forEach(([k, v]) => {
      const [questionType, questionId, responseId] = k.split("-")
      switch (questionType) {
        case "single":
          responses[questionId!] = v === null ? null : Number(v)
          break
        case "multi":
          if (!(questionId! in responses)) responses[questionId!] = []
          // @ts-ignore
          if (v) responses[questionId!].push(Number(responseId))
          break
        case "text":
          responses[questionId!] = v === "" ? null : String(v)
          break
        case "map":
          // @ts-expect-error
          responses[questionId!] = v === "" ? null : { lng: v?.lng, lat: v?.lat }
          break
        case "custom":
          responses[questionId!] = v === "" ? null : String(v)
          break
      }
    })
    return responses
  }

  const handleSubmit = (values: Record<string, any>, submitterId?: string) => {
    if (values[isUserLocationQuestionId!] === "2") values[userLocationQuestionId!] = "" // if "no location" is chosen, set location value to empty string
    delete values[isUserLocationQuestionId!] // delete map ja/nein response
    values = transformValues(values)
    onSubmit({ ...values }, submitterId)
  }

  const handleChange = useCallback(
    (values: Record<string, any>) => {
      // array of all ids of questions that have been answered already (from form context)
      const completedQuestionIds = Object.entries(values)
        .map(([k, v]) => (v ? Number(k.split("-")[1]) : null))
        .filter(Boolean)

      // check if all questions from page 1 and 2 have been answered; compare arrays
      setIsPageOneCompleted(pageOneQuestionIds!.every((val) => completedQuestionIds.includes(val)))
      setIsPageTwoCompleted(
        values[`single-${isUserLocationQuestionId}`] === "1"
          ? pageTwoQuestionIds!.every((val) => completedQuestionIds.includes(val)) && isMapDirty
          : pageTwoQuestionIds!
              .filter((id) => id !== userLocationQuestionId)
              .every((val) => completedQuestionIds.includes(val)),
      )
    },
    [
      isMapDirty,
      isUserLocationQuestionId,
      pageOneQuestionIds,
      pageTwoQuestionIds,
      userLocationQuestionId,
    ],
  )

  // show map: inital value of is location is set to true
  const initialValuesKey = `single-${isUserLocationQuestionId}`

  return (
    <PublicSurveyForm
      onSubmit={handleSubmit}
      // inital value of is location is set to true
      initialValues={{ [initialValuesKey]: "1" }}
      onChangeValues={handleChange}
    >
      {/* clean up BB remove setIsCompleted from FeedbackFirstPage props */}
      {feedbackPageProgress === 0 && (
        <FeedbackFirstPage
          institutionsBboxes={institutionsBboxes}
          maptilerUrl={maptilerUrl}
          isCompleted={isPageOneCompleted}
          setIsCompleted={setIsPageOneCompleted}
          page={pages[0]}
          onButtonClick={handleNextPage}
          feedbackCategoryId={feedbackCategoryId!}
          legend={mapProps.legend}
        />
      )}
      {feedbackPageProgress === 1 && (
        <FeedbackSecondPage
          isCompleted={isPageTwoCompleted}
          mapIsDirtyProps={{ isMapDirty, setIsMapDirty }}
          maptilerUrl={maptilerUrl}
          mapProps={mapProps}
          page={pages[1] as TPage}
          onButtonClick={handleBackPage}
          userTextIndices={[userText1Id, userText2Id]}
          pinId={pinId}
          isUserLocationQuestionId={isUserLocationQuestionId!}
          lineGeometryId={lineGeometryId}
        />
      )}
    </PublicSurveyForm>
  )
}
