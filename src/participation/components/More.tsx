import { useContext, useEffect, useState } from "react"
import SurveyForm from "./form/SurveyForm"
import { ProgressContext } from "../context/contexts"
import { ParticipationButton } from "./core/ParticipationButton"
import { ScreenHeaderParticipation } from "./core/ScreenHeaderParticipation"
import { ParticipationH2 } from "./core/Text"
import { ParticipationLabeledRadiobuttonGroup } from "./form/ParticipationLabeledRadiobuttonGroup"
import { Response } from "../data/types"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onClickMore: any
  onClickFinish: any
  more: any // TODO
}

export const More: React.FC<Props> = ({ more, onClickMore, onClickFinish }) => {
  // It would be much nicer to useFormContext and formState.isDirty - but then this component has to be wrapped in Form (and FormProvider - tbd)
  const [isDirty, setIsDirty] = useState(false)
  const [isFeedback, setIsFeedback] = useState(false)
  const { progress, setProgress } = useContext(ProgressContext)

  useEffect(() => {
    setProgress({ current: 0, total: more.pages.length - 1 })
  }, [])

  const { title, description, questions, buttons } = more.pages[0]
  const question = questions[0]
  const button = buttons[0]

  const handleChange = (values: Record<string, any>) => {
    setIsFeedback(Number(values.feedback) === question.props.responses[0].id)
    setIsDirty(
      Number(values.feedback) === question.props.responses[0].id ||
        Number(values.feedback) === question.props.responses[1].id
    )
  }

  return (
    <SurveyForm onSubmit={onClickFinish} onChangeValues={handleChange}>
      <ScreenHeaderParticipation title={title.de} description={description.de} />
      <ParticipationH2>{question.label.de}</ParticipationH2>
      <ParticipationLabeledRadiobuttonGroup
        items={question.props.responses.map((item: Response) => ({
          scope: "feedback",
          name: String(item.id),
          label: item.text.de,
          value: item.id,
        }))}
      />

      <ParticipationButton disabled={!isDirty} onClick={isFeedback ? onClickMore : onClickFinish}>
        {button.label.de}
      </ParticipationButton>
    </SurveyForm>
  )
}
