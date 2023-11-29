export { FORM_ERROR } from "src/core/components/forms"
import { SurveyLink } from "./core/links/SurveyLink"
import { SurveyScreenHeader } from "./core/layout/SurveyScreenHeader"
type Props = {
  homeUrl: string
}
export const Done: React.FC<Props> = ({ homeUrl }) => {
  return (
    <section>
      <SurveyScreenHeader title="Vielen Dank!" description="Ihre E-Mail-Adresse wurde vermerkt." />
      <SurveyLink className="mt-32" button="white" href={homeUrl}>
        Zurück Startseite
      </SurveyLink>
    </section>
  )
}
