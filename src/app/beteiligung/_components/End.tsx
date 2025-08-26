import { SurveyScreenHeader } from "@/src/app/beteiligung/_components/layout/SurveyScreenHeader"
import { SurveyLink } from "@/src/app/beteiligung/_components/links/SurveyLink"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"

import { useParams } from "next/navigation"

export const SurveyEnd = () => {
  const surveySlug = useParams()?.surveySlug as AllowedSurveySlugs
  const {
    description,
    buttonLink: button,
    title,
    homeUrl,
  } = getConfigBySurveySlug(surveySlug, "end")
  return (
    <section>
      <SurveyScreenHeader title={title} description={description} />
      <div className="pt-10">
        <SurveyLink button={button.color} href={homeUrl}>
          {button.label}
        </SurveyLink>
      </div>
      {/* <div>
        <SurveyP>
          Ist Ihnen noch ein Hinweis eingefallen, den Sie mit uns teilen wollen? Unter dem Button
          &quot;Zurück zur Beteiligung&quot; können Sie diesen nachreichen.
        </SurveyP>
        <SurveyButton onClick={onClickMore}>Zurück zur Beteiligung</SurveyButton>
      </div> */}
    </section>
  )
}
