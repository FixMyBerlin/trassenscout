import { useState } from "react"
import { Form } from "src/core/components/forms"
import { FeedbackFirstPage } from "./FeedbackFirstPage"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onSubmit: any
  feedback: any // TODO
}

export const Feedback: React.FC<Props> = ({ onSubmit, feedback }) => {
  const [isMap, setIsMap] = useState(false)
  const { pages } = feedback

  const handleSubmit = (values) => {
    onSubmit({ feedback: values })
  }

  // when Form changes, check if Radio "Ja" is selected - set state to true
  const handleChange = (values) => {
    // console.log(pages[0].questions[1].props.responses[0].id === Number(values.mapView))
    // console.log(values.mapView)
    setIsMap(pages[0].questions[1].props.responses[0].id === Number(values.mapView))
  }

  return (
    <Form onSubmit={handleSubmit} onChangeValues={handleChange}>
      <FeedbackFirstPage page={pages[0]} isMap={isMap} />
    </Form>
  )
}
