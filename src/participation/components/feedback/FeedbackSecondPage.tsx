import { useContext } from "react"
import { PinContext } from "src/participation/context/contexts"
import { ParticipationButton } from "../core/ParticipationButton"
import { ParticipationButtonWrapper } from "../core/ParticipationButtonWrapper"
import { ScreenHeaderParticipation } from "../core/ScreenHeaderParticipation"
import { ParticipationH2, ParticipationH3, ParticipationP } from "../core/Text"
import { ParticipationStaticMap } from "../maps/ParticipationStaticMap"
import { Question } from "../survey/Question"
import { MultiLineString } from "@turf/helpers"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  page: any // TODO
  onButtonClick: any // TODO
  staticMapProps: {
    projectGeometry: MultiLineString
    layerStyles: Record<string, any>
  }
  feedbackCategory: string
  isCompleted: boolean
}

export const FeedbackSecondPage: React.FC<Props> = ({
  page,
  isCompleted,
  onButtonClick,
  staticMapProps,
  feedbackCategory,
}) => {
  const { pinPosition } = useContext(PinContext)
  const { title, description, questions, buttons } = page

  const textAreaQuestions = questions.filter((q: Record<string, any>) => q.component === "text")

  return (
    <>
      <ScreenHeaderParticipation title={title.de} description={description.de} />
      <ParticipationH2>{questions[0].label.de}</ParticipationH2>
      <ParticipationP>{feedbackCategory}</ParticipationP>

      {pinPosition && (
        <>
          <ParticipationH3>{questions[1].label.de}</ParticipationH3>
          <ParticipationStaticMap marker={pinPosition} {...staticMapProps} />
        </>
      )}
      <div className="pt-8">
        <Question question={textAreaQuestions[0]} />
        <Question question={textAreaQuestions[1]} />
      </div>

      <ParticipationButtonWrapper>
        <ParticipationButton disabled={!isCompleted} id="submit-finish" type="submit">
          {buttons[0].label.de}
        </ParticipationButton>
        <ParticipationButton color="white" disabled={!isCompleted} id="submit-more" type="submit">
          {buttons[1].label.de}
        </ParticipationButton>
      </ParticipationButtonWrapper>
      <ParticipationButton color="white" type="button" onClick={onButtonClick}>
        Zurück
      </ParticipationButton>
    </>
  )
}
