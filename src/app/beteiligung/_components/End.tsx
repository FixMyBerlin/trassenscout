import { SurveyButton } from "@/src/app/beteiligung/_components/buttons/SurveyButton"
import { SurveyButtonGrid } from "@/src/app/beteiligung/_components/buttons/SurveyButtonGrid"
import { SurveyScreenHeader } from "@/src/app/beteiligung/_components/layout/SurveyScreenHeader"
import { SurveyLink } from "@/src/app/beteiligung/_components/links/SurveyLink"
import { EndButton, Stage } from "@/src/app/beteiligung/_shared/types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"

import { useParams } from "next/navigation"

type Props = {
  setStage: (stage: Stage) => void
}

export const SurveyEnd = ({ setStage }: Props) => {
  const surveySlug = useParams()?.surveySlug as AllowedSurveySlugs
  const {
    description,
    buttonLink: button,
    title,
    homeUrl,
    buttons,
  } = getConfigBySurveySlug(surveySlug, "end")
  const buttonsLeft = buttons?.filter((button) => button.position === "left")
  const buttonsRight = buttons?.filter((button) => button.position === "right")

  const EndButtonWithAction = ({ button }: { button?: EndButton }) => {
    if (!button) return
    return (
      <SurveyButton color={button.color || "primaryColor"} onClick={() => setStage(button.action)}>
        {button.label}
      </SurveyButton>
    )
  }

  return (
    <section>
      <SurveyScreenHeader title={title} description={description} />
      <div>
        <SurveyButtonGrid
          buttonLeft1={<EndButtonWithAction button={buttonsLeft?.[0]} />}
          buttonLeft2={<EndButtonWithAction button={buttonsLeft?.[1]} />}
          buttonRight1={<EndButtonWithAction button={buttonsRight?.[0]} />}
          buttonRight2={<EndButtonWithAction button={buttonsRight?.[1]} />}
        />
      </div>
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
