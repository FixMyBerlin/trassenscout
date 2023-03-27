import { useContext, useEffect, useState } from "react"
import { useForm, useFormContext } from "react-hook-form"
import { Form } from "src/core/components/forms"
import { pinkButtonStyles, whiteButtonStyles } from "src/core/components/links"
import { ProgressContext } from "src/pages/beteiligung"
import { ParticipationButton } from "./core/ParticipationButton"
import { ScreenHeaderParticipation } from "./core/ScreenHeaderParticipation"
import { ParticipationLabeledRadiobuttonGroup } from "./form/ParticipationLabeledRadiobuttonGroup"
import { Question } from "./survey/Question"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onClickMore: any
  onClickFinish: any

  more: any
}

export const More: React.FC<Props> = ({ more, onClickMore, onClickFinish }) => {
  // It would be much nicer to useFormContext and formState.isDirty - but then this component has to be wrapped in Form (and FormProvider - tbd)
  const [isDirty, setIsDirty] = useState(false)
  const [isFeedback, setIsFeedback] = useState(false)
  const { progress, setProgress } = useContext(ProgressContext)
  useEffect(() => {
    setProgress({ ...progress, total: more.pages.length })
  }, [])
  const { title, description, questions, buttons } = more.pages[0]
  const question = questions[0]
  const button = buttons[0]

  const handleChange = (values) => {
    setIsFeedback(values.feedback === question.props.responses[0].text.de)
    setIsDirty(
      values.feedback === question.props.responses[0].text.de ||
        values.feedback === question.props.responses[1].text.de
    )
  }

  return (
    <Form onSubmit={onClickFinish} onChangeValues={handleChange}>
      <ScreenHeaderParticipation title={title.de} description={description.de} />
      <ParticipationLabeledRadiobuttonGroup
        items={question.props.responses.map((item) => ({
          scope: "feedback",
          name: item.text.de,
          label: item.text.de,
          value: item.text.de,
        }))}
      />

      <ParticipationButton
        disabled={!isDirty}
        className={pinkButtonStyles}
        onClick={isFeedback ? onClickMore : onClickFinish}
      >
        {button.label.de}
      </ParticipationButton>
    </Form>
  )
}
