import { useCallback, useContext, useState } from "react"

import { PinContext, ProgressContext } from "src/survey-public/context/contexts"
import { scrollToTopWithDelay } from "src/survey-public/utils/scrollToTopWithDelay"
import PublicSurveyForm from "../core/form/PublicSurveyForm"
import {
  TFeedback,
  TMapProps,
  TPage,
  TProgress,
  TResponseConfig,
  TSingleOrMultiResponseProps,
} from "../types"
import { FeedbackFirstPage } from "./FeedbackFirstPage"
import { FeedbackSecondPage } from "./FeedbackSecondPage"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onSubmit: any
  feedback: TFeedback
  stageProgressDefinition: TProgress
  responseConfig: TResponseConfig
}

export const Feedback: React.FC<Props> = ({
  onSubmit,
  feedback,
  stageProgressDefinition,
  responseConfig,
}) => {
  const { setProgress } = useContext(ProgressContext)
  const [pinPosition, setPinPosition] = useState(null)
  const [values, setValues] = useState({})
  const [isPageOneCompleted, setIsPageOneCompleted] = useState(false)
  const [isPageTwoCompleted, setIsPageTwoCompleted] = useState(false)
  const [isMapDirty, setIsMapDirty] = useState(false)
  const [feedbackPageProgress, setFeedbackPageProgress] = useState(0)
  const [feedbackCategory, setFeedbackCategory] = useState(1)

  const [isMap, setIsMap] = useState(false)

  const { pages } = feedback

  const { evaluationRefs } = responseConfig

  const pinId = evaluationRefs["feedback-location"] as number
  const isUserLocationQuestionId = evaluationRefs["is-feedback-location"]
  const feedbackCategoryId = evaluationRefs["feedback-category"]
  const userText1Id = evaluationRefs["feedback-usertext-1"]
  const userText2Id = evaluationRefs["feedback-usertext-2"]
  const categoryId = evaluationRefs["feedback-category"]

  const categoryProps = pages[0]?.questions.find((q) => q.id === categoryId)
    ?.props as TSingleOrMultiResponseProps

  const categories = categoryProps.responses

  const { maptilerStyleUrl, config } = pages[0]?.questions.find((q) => q.id === pinId)
    ?.props as TMapProps

  const categoryText = categories.find((q) => q.id === feedbackCategory)?.text.de

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
      }
    })
    return responses
  }

  const handleSubmit = (values: Record<string, any>, submitterId?: string) => {
    values = transformValues(values)
    delete values[isUserLocationQuestionId!] // delete map ja/nein response
    onSubmit({ ...values, [pinId]: isMap ? pinPosition : null }, submitterId)
  }

  // when Form changes, check if Radio "Ja" is selected - set state to true
  const handleChange = useCallback(
    (values: Record<string, any>) => {
      setValues(values)
      values = transformValues(values)
      const isMapOption = values[isUserLocationQuestionId!] === 1 // "1" -> yes, "2" -> no - see feedback.json
      setIsMap(isMapOption)
      const isQuestionsCompletedPageOne =
        values[feedbackCategoryId!] && values[isUserLocationQuestionId!]
      setIsPageOneCompleted(
        !isMapOption // if user did not choose map
          ? isQuestionsCompletedPageOne // page is completed in case both questions are answered
          : isQuestionsCompletedPageOne && isMapDirty, // page is completed in case both questions are answered and user has touched the map marker
      )
      let isMinimumOneQuestionPageTwo: boolean
      if (!userText2Id) {
        isMinimumOneQuestionPageTwo = Boolean(values[userText1Id!])
      } else {
        isMinimumOneQuestionPageTwo = Boolean(values[userText1Id!] || values[userText2Id])
      }
      setIsPageTwoCompleted(isMinimumOneQuestionPageTwo)
      if (!isMapOption) setPinPosition(null) // set pinPosition to null if not yes
      setFeedbackCategory(values[feedbackCategoryId!] || 1) // sets state to response id of chosen category or 1 if no category is chosen
    },
    [feedbackCategoryId, isMapDirty, isUserLocationQuestionId, userText1Id, userText2Id],
  )

  return (
    // @ts-ignore
    <PinContext.Provider value={{ pinPosition, setPinPosition }}>
      <PublicSurveyForm onSubmit={handleSubmit} onChangeValues={handleChange}>
        {feedbackPageProgress === 0 && (
          <FeedbackFirstPage
            isCompleted={isPageOneCompleted}
            page={pages[0]}
            isMap={isMap}
            onButtonClick={handleNextPage}
            mapIsDirtyProps={{ isMapDirty, setIsMapDirty }}
          />
        )}
        {feedbackPageProgress === 1 && (
          <FeedbackSecondPage
            isCompleted={isPageTwoCompleted}
            staticMapProps={{ maptilerStyleUrl }}
            page={pages[1] as TPage}
            onButtonClick={handleBackPage}
            feedbackCategory={categoryText}
            userTextIndices={[userText1Id, userText2Id]}
          />
        )}
      </PublicSurveyForm>
    </PinContext.Provider>
  )
}
