import { useContext, useEffect, useState } from "react"
import SurveyForm from "../form/SurveyForm"
import { PinContext, ProgressContext } from "src/participation/context/contexts"
import { FeedbackFirstPage } from "./FeedbackFirstPage"
import { FeedbackSecondPage } from "./FeedbackSecondPage"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onSubmit: any
  feedback: any // TODO
}

export const Feedback: React.FC<Props> = ({ onSubmit, feedback }) => {
  const { progress, setProgress } = useContext(ProgressContext)
  const [pinPosition, setPinPosition] = useState(null)
  const [values, setValues] = useState({})
  const [isPageOneCompleted, setIsPageOneCompleted] = useState(false)
  const [isPageTwoCompleted, setIsPageTwoCompleted] = useState(false)
  const [feedbackCategory, setFeedbackCategory] = useState(1)

  useEffect(() => {
    setProgress({ current: 0, total: pages.length - 1 })
    setFeedbackCategory(categories.length) // default: '"Sonstiges"
  }, []) // eslint-disable-line

  const [isMap, setIsMap] = useState(false)

  const { pages } = feedback

  const projectGeometry = feedback.pages[0].questions[2].props.projectGeometry

  const pinId = pages[0].questions.find(
    (question: Record<string, any>) => question.component === "map"
  ).id

  const categories = pages[0].questions[0].props.responses

  const handleNextPage = () => {
    const newProgress = Math.min(pages.length - 1, progress.current + 1)
    setProgress({ ...progress, current: newProgress })
    window && window.scrollTo(0, 0)
  }
  const handleBackPage = () => {
    const newProgress = Math.max(0, progress.current - 1)
    setProgress({ ...progress, current: newProgress })
    window && window.scrollTo(0, 0)
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
  const handleChange = (values: Record<string, any>) => {
    setValues(values)
    values = transformValues(values)
    setIsPageOneCompleted(values["21"] && values["22"])
    setIsPageTwoCompleted(values["34"] || values["35"])
    setIsMap(values["22"] === 1) // "1" -> yes, "2" -> no - see feedback.json
    if (!(values["22"] === 1)) setPinPosition(null) // set pinPosition to null if not yes
    setFeedbackCategory(values["21"] || categories.length) // sets state to response id of chosen category (question 21) // fallback: '"Sonstiges"
  }

  return (
    // @ts-ignore
    <PinContext.Provider value={{ pinPosition, setPinPosition }}>
      <SurveyForm onSubmit={handleSubmit} onChangeValues={handleChange}>
        {progress.current === 0 && (
          <FeedbackFirstPage
            isCompleted={isPageOneCompleted}
            page={pages[0]}
            isMap={isMap}
            onButtonClick={handleNextPage}
          />
        )}
        {progress.current === 1 && (
          <FeedbackSecondPage
            isCompleted={isPageTwoCompleted}
            projectGeometry={projectGeometry}
            page={pages[1]}
            onButtonClick={handleBackPage}
            feedbackCategory={categories[feedbackCategory - 1].text.de}
          />
        )}
      </SurveyForm>
    </PinContext.Provider>
  )
}
