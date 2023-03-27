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
  const [pinPostion, setPinPosition] = useState(null)
  const [feedbackCategory, setFeedbackCategory] = useState([])

  useEffect(() => {
    setProgress({ current: 0, total: pages.length - 1 })
  }, [])

  const [isMap, setIsMap] = useState(false)

  const { pages } = feedback

  const projectGeometry = feedback.pages[0].questions[2].props.projectGeometry
  console.log(projectGeometry)

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

  const handleSubmit = (values) => {
    onSubmit({ feedback: values, pin: pinPostion })
  }

  // when Form changes, check if Radio "Ja" is selected - set state to true
  const handleChange = (values) => {
    setIsMap(pages[0].questions[1].props.responses[0].id === Number(values.mapView))

    const newCategories = Object.entries(values)
      .filter(([k, v]) => v === true)
      .map(([k, v]) => k)
    console.log(newCategories)
    setFeedbackCategory(newCategories)
  }

  return (
    <PinContext.Provider value={{ pinPostion, setPinPosition }}>
      <Form onSubmit={handleSubmit} onChangeValues={handleChange}>
        {progress.current === 0 && (
          <FeedbackFirstPage page={pages[0]} isMap={isMap} onButtonClick={handleNextPage} />
        )}
        {progress.current === 1 && (
          <FeedbackSecondPage
            projectGeometry={projectGeometry}
            page={pages[1]}
            onButtonClick={handleBackPage}
            feedbackCategory={feedbackCategory}
          />
        )}
      </Form>
    </PinContext.Provider>
  )
}
