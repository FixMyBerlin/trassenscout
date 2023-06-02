export { FORM_ERROR } from "src/core/components/forms"
import { useCallback, useState } from "react"
import { Link, whiteButtonStyles } from "src/core/components/links"
import { ParticipationButton } from "./core/ParticipationButton"
import { ParticipationButtonWrapper } from "./core/ParticipationButtonWrapper"
import { ScreenHeaderParticipation } from "./core/ScreenHeaderParticipation"
import { ParticipationH2, ParticipationP } from "./core/Text"
import { ParticipationLabeledCheckbox } from "./form/ParticipationLabeledCheckbox"
import { ParticipationLabeledTextField } from "./form/ParticipationLabeledTextField"
import SurveyForm from "./form/SurveyForm"

type Props = {
  onSubmit: any
  email: any // TODO
}

export const Email: React.FC<Props> = ({ onSubmit, email }) => {
  const [consent, setConsent] = useState(false)

  const handleSubmit = useCallback(
    (values: Record<string, any>) => {
      onSubmit(values.email)
    },
    [onSubmit]
  )

  const handleChange = useCallback((values: Record<string, any>) => {
    setConsent(values.consent && values.email)
  }, [])

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
        <div className="flex items-center">
          <ParticipationLabeledCheckbox
            labelProps={{
              className:
                "ml-3 block cursor-pointer text-normal text-base sm:text-lg text-gray-700 hover:text-gray-800",
            }}
            name="consent"
            label=""
          />
          <p className="pt-1">
            Ich stimme den <Link href="/datenschutz">Datenschutzbedingungen</Link> zu.
          </p>
        </div>
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
