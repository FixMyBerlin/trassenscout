import { SurveyButton } from "@/src/components/beteiligung/buttons/SurveyButton"
import { SurveyButtonGrid } from "@/src/components/beteiligung/buttons/SurveyButtonGrid"
import { SurveyScreenHeader } from "@/src/components/beteiligung/layout/SurveyScreenHeader"
import { SurveyLink } from "@/src/components/beteiligung/links/SurveyLink"
import { EndButton, Stage } from "@/src/components/beteiligung/shared/types"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { useAllowedSurveySlug } from "@/src/components/beteiligung/shared/utils/useAllowedSurveySlug"

type Props = {
  setStage: (stage: Stage) => void
}

function EndButtonWithAction({
  button,
  setStage,
}: {
  button?: EndButton
  setStage: (stage: Stage) => void
}) {
  if (!button) return null
  return (
    <SurveyButton color={button.color || "primaryColor"} onClick={() => setStage(button.action)}>
      {button.label}
    </SurveyButton>
  )
}

export const SurveyEnd = ({ setStage }: Props) => {
  const surveySlug = useAllowedSurveySlug()
  const {
    description,
    buttonLink: button,
    title,
    homeUrl,
    buttons,
    mailjetWidgetUrl,
  } = getConfigBySurveySlug(surveySlug, "end")
  const buttonsLeft = buttons?.filter((button) => button.position === "left")
  const buttonsRight = buttons?.filter((button) => button.position === "right")

  return (
    <section>
      <SurveyScreenHeader title={title} description={description} />
      {mailjetWidgetUrl && (
        <iframe
          title="Newsletter-Anmeldung"
          className="my-6 mt-10 h-[500px] w-full rounded border border-gray-300"
          src={mailjetWidgetUrl}
        />
      )}
      <div>
        <SurveyButtonGrid
          buttonLeft1={<EndButtonWithAction button={buttonsLeft?.[0]} setStage={setStage} />}
          buttonLeft2={<EndButtonWithAction button={buttonsLeft?.[1]} setStage={setStage} />}
          buttonRight1={<EndButtonWithAction button={buttonsRight?.[0]} setStage={setStage} />}
          buttonRight2={<EndButtonWithAction button={buttonsRight?.[1]} setStage={setStage} />}
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
