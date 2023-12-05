import { useCallback, useContext, useState } from "react"

import { PinContext, ProgressContext } from "src/survey-public/components/context/contexts"
import PublicSurveyForm from "../core/form/PublicSurveyForm"
import { FeedbackFirstPage } from "./FeedbackFirstPage"
import { FeedbackSecondPage } from "./FeedbackSecondPage"
import { scrollToTopWithDelay } from "src/survey-public/components/utils/scrollToTopWithDelay"
import { TFeedbackQuestion, TProgress, TQuestion } from "../types"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onSubmit: any
  feedback: any // TODO
  stageProgressDefinition: TProgress
}

export const Feedback: React.FC<Props> = ({ onSubmit, feedback, stageProgressDefinition }) => {
  const { setProgress } = useContext(ProgressContext)
  const [pinPosition, setPinPosition] = useState(null)
  const [values, setValues] = useState({})
  const [isPageOneCompleted, setIsPageOneCompleted] = useState(false)
  const [isPageTwoCompleted, setIsPageTwoCompleted] = useState(false)
  const [isMapDirty, setIsMapDirty] = useState(false)
  const [feedbackPageProgress, setFeedbackPageProgress] = useState(0)
  const [feedbackCategory, setFeedbackCategory] = useState(0)

  const [isMap, setIsMap] = useState(false)

  const { pages } = feedback

  const { projectGeometry, layerStyles, maptilerStyleUrl } = feedback.pages[0].questions[2].props

  const pinId = pages[0].questions.find(
    (question: Record<string, any>) => question.component === "map",
  ).id

  const categories = pages[0].questions[0].props.responses

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

  const feedbackQuestions: TFeedbackQuestion[] = []

  for (let page of feedback.pages) {
    page.questions && feedbackQuestions.push(...page.questions)
  }

  const isUserLocationQuestionId = feedbackQuestions.find(
    (question) => question.evaluationRef === "is-feedback-location",
  )?.id
  const feedbackCategoryId = feedbackQuestions.find(
    (question) => question.evaluationRef === "feedback-category",
  )?.id
  const userText1Id = feedbackQuestions.find(
    (question) => question.evaluationRef === "feedback-usertext-1",
  )?.id
  const userText2Id = feedbackQuestions.find(
    (question) => question.evaluationRef === "feedback-usertext-2",
  )?.id

  const handleSubmit = (values: Record<string, any>, submitterId?: string) => {
    values = transformValues(values)
    delete values[isUserLocationQuestionId!] // delete map ja/nein response
    onSubmit({ ...values, [pinId]: isMap ? pinPosition : null }, submitterId)
  }

  console

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
      // = values["34"] || values["35"]
      let isMinimumOneQuestionPageTwo: boolean
      if (!userText2Id) {
        isMinimumOneQuestionPageTwo = Boolean(values[userText1Id!])
      } else {
        isMinimumOneQuestionPageTwo = Boolean(values[userText1Id!] || values[userText2Id])
      }
      setIsPageTwoCompleted(isMinimumOneQuestionPageTwo)
      if (!isMapOption) setPinPosition(null) // set pinPosition to null if not yes
      setFeedbackCategory(values[feedbackCategoryId!] || categories.length) // sets state to response id of chosen category (question 21) // fallback: '"Sonstiges"
    },
    [
      categories.length,
      feedbackCategoryId,
      isMapDirty,
      isUserLocationQuestionId,
      userText1Id,
      userText2Id,
    ],
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
            staticMapProps={{ projectGeometry, layerStyles, maptilerStyleUrl }}
            page={pages[1]}
            onButtonClick={handleBackPage}
            feedbackCategory={categories[feedbackCategory - 1].text.de}
            userTextIndices={[userText1Id, userText2Id]}
          />
        )}
      </PublicSurveyForm>
    </PinContext.Provider>
  )
}
