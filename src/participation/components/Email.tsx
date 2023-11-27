import { useCallback, useEffect, useState } from "react"
import { iframeResizer } from "iframe-resizer"

export { FORM_ERROR } from "src/core/components/forms"
import { ParticipationH2, ParticipationP } from "./core/Text"
import { ParticipationLink } from "./core/links/ParticipationLink"
import SurveyForm from "./core/form/SurveyForm"
import { ScreenHeaderParticipation } from "./core/layout/ScreenHeaderParticipation"

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

  useEffect(() => {
    iframeResizer({}, "#mailjet-widget")
  }, [])

  return (
    <section>
      <SurveyForm onSubmit={handleSubmit} onChangeValues={handleChange}>
        <ScreenHeaderParticipation title={page.title.de} />
        <ParticipationH2>{page.questions[0].label.de}</ParticipationH2>
        <ParticipationP>{page.questions[0].props.text.de}</ParticipationP>

        <div
          className="rounded border border-gray-300 pb-2"
          dangerouslySetInnerHTML={{
            __html: `
              <iframe id="mailjet-widget" data-w-type="embedded" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://7p8q.mjt.lu/wgt/7p8q/t5g/form?c=f8dcc5f9" width="100%" style="height: 0px;"></iframe>
          `,
          }}
        />

        <div className="pt-10">
          <ParticipationLink button="white" href="https://radschnellweg8-lb-wn.de/beteiligung/">
            Zurück zur Startseite
          </ParticipationLink>
        </div>
      </SurveyForm>
    </section>
  )
}
