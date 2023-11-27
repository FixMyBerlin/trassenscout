import { ParticipationH2 } from "src/participation/components/core/Text"
import { ParticipationButton } from "src/participation/components/core/buttons/ParticipationButton"
import { ParticipationButtonWrapper } from "src/participation/components/core/buttons/ParticipationButtonWrapper"
import { ScreenHeaderParticipation } from "src/participation/components/core/layout/ScreenHeaderParticipation"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onClickMore: any
  onClickFinish: any
  more: any // TODO
}

export const More: React.FC<Props> = ({ more, onClickMore, onClickFinish }) => {
  const { title, description, questions, buttons } = more.pages[0]
  const question = questions[0]

  return (
    <>
      <ScreenHeaderParticipation title={title.de} description={description.de} />
      <ParticipationH2>{question.label.de}</ParticipationH2>
      <ParticipationButtonWrapper>
        <ParticipationButton color={buttons[0].color} onClick={onClickMore}>
          {buttons[0].label.de}
        </ParticipationButton>
        <ParticipationButton color={buttons[1].color} onClick={onClickFinish}>
          {buttons[1].label.de}
        </ParticipationButton>
      </ParticipationButtonWrapper>
    </>
  )
}
