import { SurveyButton } from "@/src/app/beteiligung-neu/_components/buttons/SurveyButton"
import { SurveyButtonGrid } from "@/src/app/beteiligung-neu/_components/buttons/SurveyButtonGrid"
import { SurveyScreenHeader } from "@/src/app/beteiligung-neu/_components/layout/SurveyScreenHeader"
import { Start } from "@/src/app/beteiligung-neu/_components/Start"
import { IntroButton, Stage, TIntro } from "@/src/app/beteiligung-neu/_shared/types"

type Props = {
  handleIntroClick: () => void
  intro: TIntro
  setStage: (stage: Stage) => void
}

export const Intro = ({ handleIntroClick, intro, setStage }: Props) => {
  const buttonsLeft = intro.buttons?.filter((button) => button.position === "left")
  const buttonsRight = intro.buttons?.filter((button) => button.position === "right")

  const IntroButtonWithAction = ({ button }: { button?: IntroButton }) => {
    if (!button) return
    return (
      <SurveyButton
        color={button.color || "primaryColor"}
        // @ts-expect-error we can be sure it is not "next"
        onClick={button.action === "next" ? handleIntroClick : () => setStage(button.action)}
      >
        {button.label}
      </SurveyButton>
    )
  }

  return (
    <div>
      {intro.type === "custom" ? (
        <Start startContent={intro.customComponent} />
      ) : (
        <SurveyScreenHeader title={intro.title} description={intro.description} />
      )}
      <SurveyButtonGrid
        buttonLeft1={<IntroButtonWithAction button={buttonsLeft?.[0]} />}
        buttonLeft2={<IntroButtonWithAction button={buttonsLeft?.[1]} />}
        buttonRight1={<IntroButtonWithAction button={buttonsRight?.[0]} />}
        buttonRight2={<IntroButtonWithAction button={buttonsRight?.[1]} />}
      />
    </div>
  )
}
