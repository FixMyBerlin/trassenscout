import { useContext } from "react"
import { PinContext } from "src/participation/context/contexts"
import { ParticipationButton } from "../core/ParticipationButton"
import { ParticipationButtonWrapper } from "../core/ParticipationButtonWrapper"
import { ScreenHeaderParticipation } from "../core/ScreenHeaderParticipation"
import { ParticipationH3, ParticipationP } from "../core/Text"
import { ParticipationLabeledTextareaField } from "../form/ParticipationLabeledTextareaField"
import { ParticipationStaticMap } from "../maps/ParticipationStaticMap"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  page: any // TODO
  onButtonClick: any // TODO
  projectGeometry: any // TODO
  feedbackCategory: string
}

export const FeedbackSecondPage: React.FC<Props> = ({
  page,
  onButtonClick,
  projectGeometry,
  feedbackCategory,
}) => {
  const { pinPosition } = useContext(PinContext)
  const { title, description, questions, buttons } = page

  const textAreaQuestions = questions.filter((q) => q.component === "text")

  return (
    <>
      <ScreenHeaderParticipation title={title.de} description={description.de} />
      <ParticipationH3>{questions[0].label.de}</ParticipationH3>
      <ParticipationP>{feedbackCategory}</ParticipationP>

      {pinPosition && (
        <>
          <ParticipationH3>{questions[1].label.de}</ParticipationH3>
          <ParticipationStaticMap
            marker={pinPosition}
            staticMap={{
              projectGeometry: projectGeometry,
            }}
          />
        </>
      )}
      <div className="pt-8">
        <ParticipationLabeledTextareaField
          name={String(textAreaQuestions[0].id)}
          label={textAreaQuestions[0].label.de}
        />
        <ParticipationLabeledTextareaField
          name={String(textAreaQuestions[1].id)}
          label={textAreaQuestions[1].label.de}
        />
      </div>

      {/* TODO Disabled */}
      <ParticipationButtonWrapper>
        <ParticipationButton id="submit-finish" type="submit">
          {buttons[0].label.de}
        </ParticipationButton>
        <ParticipationButton id="submit-more" type="submit">
          {buttons[1].label.de}
        </ParticipationButton>
      </ParticipationButtonWrapper>
      <ParticipationButton color="white" type="button" onClick={onButtonClick}>
        Zurück
      </ParticipationButton>
    </>
  )
}
