import { useContext } from "react"

import { MultiLineString } from "@turf/helpers"

import {
  ParticipationH2,
  ParticipationH3,
  ParticipationP,
} from "src/participation/components/core/Text"
import { ParticipationButton } from "src/participation/components/core/buttons/ParticipationButton"
import { ParticipationButtonWrapper } from "src/participation/components/core/buttons/ParticipationButtonWrapper"
import { PinContext } from "src/participation/context/contexts"
import { ScreenHeaderParticipation } from "src/participation/components/core/layout/ScreenHeaderParticipation"
import { ParticipationStaticMap } from "src/participation/components/maps/ParticipationStaticMap"
import { Question } from "src/participation/components/core/Question"

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
