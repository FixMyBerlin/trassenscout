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

        <div
          dangerouslySetInnerHTML={{
            __html: `
              <iframe data-w-type="embedded" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://7p8q.mjt.lu/wgt/7p8q/t5g/form?c=f8dcc5f9" width="100%" style="height: 0;"></iframe>
              <script type="text/javascript" src="https://app.mailjet.com/pas-nc-embedded-v1.js"></script>
          `,
          }}
        />

        <div className="pt-10 text-center">
          {/* TODO replace link in production: https://radschnellweg8-lb-wn.de/beteiligung */}
          <ParticipationLink
            button="white"
            href="https://develop--rsv8-lb-wn.netlify.app/beteiligung/"
          >
            Zurück zur Startseite
          </ParticipationLink>
        </div>
      </SurveyForm>
    </section>
  )
}
