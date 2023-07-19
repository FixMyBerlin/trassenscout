import { useCallback, useContext, useState } from "react"
import { stageProgressDefinition } from "src/pages/beteiligung/rs8"
import { PinContext, ProgressContext } from "src/participation/context/contexts"
import SurveyForm from "../form/SurveyForm"
import { FeedbackFirstPage } from "./FeedbackFirstPage"
import { FeedbackSecondPage } from "./FeedbackSecondPage"
import { scrollToTopWithDelay } from "src/participation/utils/scrollToTopWithDelay"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onSubmit: any
  feedback: any // TODO
}

export const Feedback: React.FC<Props> = ({ onSubmit, feedback }) => {
  const { setProgress } = useContext(ProgressContext)
  const [pinPosition, setPinPosition] = useState(null)
  const [values, setValues] = useState({})
  const [isPageOneCompleted, setIsPageOneCompleted] = useState(false)
  const [isPageTwoCompleted, setIsPageTwoCompleted] = useState(false)
  const [isMapDirty, setIsMapDirty] = useState(false)
  const [feedbackPageProgress, setFeedbackPageProgress] = useState(0)
  const [feedbackCategory, setFeedbackCategory] = useState(6) // default: 6 / "Sonstiges"

  const [isMap, setIsMap] = useState(false)

  const { pages } = feedback

  const projectGeometry = feedback.pages[0].questions[2].props.projectGeometry
  const layerStyles = feedback.pages[0].questions[2].props.layerStyles

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

  const handleSubmit = (values: Record<string, any>, submitterId?: string) => {
    values = transformValues(values)
    delete values["22"] // delete map ja/nein response
    onSubmit({ ...values, [pinId]: isMap ? pinPosition : null }, submitterId)
  }

  // when Form changes, check if Radio "Ja" is selected - set state to true
  const handleChange = useCallback(
    (values: Record<string, any>) => {
      setValues(values)
      values = transformValues(values)
      const isMapOption = values["22"] === 1 // "1" -> yes, "2" -> no - see feedback.json
      setIsMap(isMapOption)
      const isQuestionsCompletedPageOne = values["21"] && values["22"]
      setIsPageOneCompleted(
        !isMapOption // if user did not choose map
          ? isQuestionsCompletedPageOne // page is completed in case both questions are answered
          : isQuestionsCompletedPageOne && isMapDirty, // page is completed in case both questions are answered and user has touched the map marker
      )
      const isMinimumOneQuestionPageTwo = values["34"] || values["35"]
      setIsPageTwoCompleted(isMinimumOneQuestionPageTwo)
      if (!isMapOption) setPinPosition(null) // set pinPosition to null if not yes
      setFeedbackCategory(values["21"] || categories.length) // sets state to response id of chosen category (question 21) // fallback: '"Sonstiges"
    },
    [categories.length, isMapDirty],
  )

  return (
    // @ts-ignore
    <PinContext.Provider value={{ pinPosition, setPinPosition }}>
      <SurveyForm onSubmit={handleSubmit} onChangeValues={handleChange}>
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
            staticMapProps={{ projectGeometry, layerStyles }}
            page={pages[1]}
            onButtonClick={handleBackPage}
            feedbackCategory={categories[feedbackCategory - 1].text.de}
          />
        )}
      </SurveyForm>
    </PinContext.Provider>
  )
}
