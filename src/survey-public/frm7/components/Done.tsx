export { FORM_ERROR } from "src/core/components/forms"

import { SurveyLink } from "src/survey-public/components/core/links/SurveyLink"
import { SurveyScreenHeader } from "src/survey-public/components/core/layout/SurveyScreenHeader"

export const Done = () => {
  return (
    <section>
      <SurveyScreenHeader title="Vielen Dank!" description="Ihre E-Mail-Adresse wurde vermerkt." />
      <SurveyLink
        className="mt-32"
        button="white"
        href="https://radschnellweg8-lb-wn.de/beteiligung/"
      >
        Zurück Startseite
      </SurveyLink>
    </section>
  )
}
