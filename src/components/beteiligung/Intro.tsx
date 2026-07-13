import { SurveyButton } from "@/src/components/beteiligung/buttons/SurveyButton"
import { SurveyButtonGrid } from "@/src/components/beteiligung/buttons/SurveyButtonGrid"
import { customIntroRegistry } from "@/src/components/beteiligung/customIntroRegistry"
import { SurveyScreenHeader } from "@/src/components/beteiligung/layout/SurveyScreenHeader"
import { IntroButton, Stage, TIntro } from "@/src/components/beteiligung/shared/types"
import { Start } from "@/src/components/beteiligung/Start"

type Props = {
  handleIntroClick: () => void
  intro: TIntro
  setStage: (stage: Stage) => void
}

function IntroButtonWithAction({
  button,
  handleIntroClick,
  setStage,
}: {
  button?: IntroButton
  handleIntroClick: () => void
  setStage: (stage: Stage) => void
}) {
  if (!button) return null
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

export const Intro = ({ handleIntroClick, intro, setStage }: Props) => {
  const buttonsLeft = intro.buttons?.filter((button) => button.position === "left")
  const buttonsRight = intro.buttons?.filter((button) => button.position === "right")

  return (
    <div>
      {intro.type === "custom" ? (
        <Start
          startContent={(() => {
            const CustomIntro = customIntroRegistry[intro.customComponentKey]
            return <CustomIntro />
          })()}
        />
      ) : (
        <SurveyScreenHeader title={intro.title} description={intro.description} />
      )}
      <SurveyButtonGrid
        buttonLeft1={
          <IntroButtonWithAction
            button={buttonsLeft?.[0]}
            handleIntroClick={handleIntroClick}
            setStage={setStage}
          />
        }
        buttonLeft2={
          <IntroButtonWithAction
            button={buttonsLeft?.[1]}
            handleIntroClick={handleIntroClick}
            setStage={setStage}
          />
        }
        buttonRight1={
          <IntroButtonWithAction
            button={buttonsRight?.[0]}
            handleIntroClick={handleIntroClick}
            setStage={setStage}
          />
        }
        buttonRight2={
          <IntroButtonWithAction
            button={buttonsRight?.[1]}
            handleIntroClick={handleIntroClick}
            setStage={setStage}
          />
        }
      />
    </div>
  )
}
