import { Survey } from "./survey/Survey"

export { FORM_ERROR } from "src/core/components/forms"
import { useContext, useEffect, useState } from "react"
import SurveyForm from "./form/SurveyForm"
import { Link, whiteButtonStyles } from "src/core/components/links"
import { ProgressContext } from "../context/contexts"
import { ParticipationButton } from "./core/ParticipationButton"
import { ParticipationButtonWrapper } from "./core/ParticipationButtonWrapper"
import { ScreenHeaderParticipation } from "./core/ScreenHeaderParticipation"
import { ParticipationH2, ParticipationP } from "./core/Text"
import { ParticipationLabeledCheckbox } from "./form/ParticipationLabeledCheckbox"
import { ParticipationLabeledTextField } from "./form/ParticipationLabeledTextField"

type Props = {
  onSubmit: any
  email: any // TODO
}

export const Email: React.FC<Props> = ({ onSubmit, email }) => {
  const [consent, setConsent] = useState(false)
  const { progress, setProgress } = useContext(ProgressContext)

  useEffect(() => {
    setProgress({ current: 0, total: email.pages.length - 1 })
  }, [])

  const handleSubmit = (values) => {
    onSubmit(values.email)
  }

  // TODO: Event type
  const handleChange = (values) => {
    console.log(values)
    setConsent(values.consent && values.email)
  }

  const page = email.pages[0]

  return (
    <section>
      <SurveyForm onSubmit={handleSubmit} onChangeValues={handleChange}>
        <ScreenHeaderParticipation title={page.title.de} />
        <ParticipationH2>{page.questions[0].label.de}</ParticipationH2>
        <ParticipationP>{page.questions[0].props.text.de}</ParticipationP>
        <ParticipationH2>{page.questions[1].label.de}</ParticipationH2>
        <ParticipationP>{page.questions[1].props.text.de}</ParticipationP>
        <ParticipationLabeledTextField
          name="email"
          label=""
          placeholder={page.questions[1].props.emailPlaceholder.de}
          outerProps={{ className: "mb-6" }}
        />
        <ParticipationLabeledCheckbox
          name="consent"
          label={page.questions[1].props.agreementText.de}
        />

        <ParticipationButtonWrapper>
          <ParticipationButton disabled={!consent} type="submit">
            {page.buttons[0].label.de}
          </ParticipationButton>
          {/* TODO replace link in production: https://radschnellweg8-lb-wn.de/beteiligung */}
          <Link
            className={whiteButtonStyles}
            href="https://develop--rsv8-lb-wn.netlify.app/beteiligung/"
          >
            Nein, zurück zur Startseite
          </Link>
        </ParticipationButtonWrapper>
      </SurveyForm>
    </section>
  )
}
