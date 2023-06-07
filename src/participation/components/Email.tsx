export { FORM_ERROR } from "src/core/components/forms"
import { useCallback, useState } from "react"
import { ParticipationH2, ParticipationP } from "./core/Text"
import { ParticipationButton } from "./core/buttons/ParticipationButton"
import { ParticipationButtonWrapper } from "./core/buttons/ParticipationButtonWrapper"
import { ParticipationLink } from "./core/links/ParticipationLink"
import { ParticipationLabeledCheckbox } from "./form/ParticipationLabeledCheckbox"
import { ParticipationLabeledTextField } from "./form/ParticipationLabeledTextField"
import SurveyForm from "./form/SurveyForm"
import { ScreenHeaderParticipation } from "./layout/ScreenHeaderParticipation"
import clsx from "clsx"

type Props = {
  onSubmit: any
  email: any // TODO
}

export const Email: React.FC<Props> = ({ onSubmit, email }) => {
  const [consent, setConsent] = useState(false)

  const handleSubmit = (values: Record<string, any>) => {
    onSubmit(values.email)
  }

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
              className: clsx(
                "text-base sm:text-lg text-gray-700 hover:text-gray-800 prose",
                "prose-a:underline prose-a:text-pink-500 prose-a:decoreation-pink-500 prose-a:hover:text-blue-800 prose-a:hover:decoration-blue-800 prose-a:active:ring-1 prose-a:ring-pink-500 prose-a:rounded"
              ),
            }}
            name="consent"
            label={
              <p>
                Ich stimme den <a href="/datenschutz">Datenschutzbedingungen</a> zu.
              </p>
            }
          />
        </div>

        <ParticipationButtonWrapper>
          <ParticipationButton disabled={!consent} type="submit">
            {page.buttons[0].label.de}
          </ParticipationButton>
          {/* TODO replace link in production: https://radschnellweg8-lb-wn.de/beteiligung */}
          <ParticipationLink
            button="white"
            href="https://develop--rsv8-lb-wn.netlify.app/beteiligung/"
          >
            Nein, zurück zur Startseite
          </ParticipationLink>
        </ParticipationButtonWrapper>
      </SurveyForm>
    </section>
  )
}
