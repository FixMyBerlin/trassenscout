import { useContext, useEffect, useState } from "react"
import { Form } from "src/core/components/forms"
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
  const [feedbackCategory, setFeedbackCategory] = useState(0)

  useEffect(() => {
    setProgress({ current: 0, total: pages.length - 1 })
    setFeedbackCategory(categories.length) // default: '"Sonstiges"
  }, [])

  const [isMap, setIsMap] = useState(false)

  const { pages } = feedback

  const projectGeometry = feedback.pages[0].questions[2].props.projectGeometry

  const pinId = pages[0].questions.find((question) => question.component === "map").id

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

  const handleSubmit = (values: Record<string, any>, submitterId: string) => {
    values = { ...values }
    delete values.mapView
    onSubmit({ ...values, [pinId]: isMap ? pinPosition : null }, submitterId)
  }

  // when Form changes, check if Radio "Ja" is selected - set state to true
  const handleChange = (values: Record<string, any>) => {
    setIsMap(values.mapView === "1") // "1" -> yes, "2" -> no - see feedback.json
    setFeedbackCategory(values[21] || categories.length) // sets state to response id of chosen category (question 21) // fallback: '"Sonstiges"
  }

  return (
    <PinContext.Provider value={{ pinPosition, setPinPosition }}>
      <Form onSubmit={handleSubmit} onChangeValues={handleChange}>
        {progress.current === 0 && (
          <FeedbackFirstPage page={pages[0]} isMap={isMap} onButtonClick={handleNextPage} />
        )}
        {progress.current === 1 && (
          <FeedbackSecondPage
            projectGeometry={projectGeometry}
            page={pages[1]}
            onButtonClick={handleBackPage}
            feedbackCategory={categories[feedbackCategory - 1].text.de}
          />
        )}
      </Form>
    </PinContext.Provider>
  )
}
