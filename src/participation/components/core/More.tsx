import { ParticipationH2 } from "./Text"
import { ParticipationButton } from "./buttons/ParticipationButton"
import { ParticipationButtonWrapper } from "./buttons/ParticipationButtonWrapper"
import { ScreenHeaderParticipation } from "./layout/ScreenHeaderParticipation"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  onClickMore: any
  onClickFinish: any
  more: any // TODO
}

export const More: React.FC<Props> = ({ more, onClickMore, onClickFinish }) => {
  const { title, description, questionText, buttons } = more

  return (
    <>
      <ScreenHeaderParticipation title={title.de} description={description.de} />
      <ParticipationH2>{questionText.de}</ParticipationH2>
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
