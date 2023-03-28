import { useContext } from "react"
import { H1 } from "src/core/components/text/Headings"
import { PinContext } from "src/participation/context/contexts"
import { ParticipationButton } from "../core/ParticipationButton"
import { ParticipationButtonWrapper } from "../core/ParticipationButtonWrapper"
import { ScreenHeaderParticipation } from "../core/ScreenHeaderParticipation"
import { ParticipationH3, ParticipationP } from "../core/Text"
import { ParticipationStaticMap } from "../maps/ParticipationStaticMap"
import { Question } from "../survey/Question"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  page: any // TODO
  onButtonClick: any // TODO
  projectGeometry: any // TODO
  feedbackCategory: string[]
}

export const FeedbackSecondPage: React.FC<Props> = ({
  page,
  onButtonClick,
  projectGeometry,
  feedbackCategory,
}) => {
  const { pinPostion } = useContext(PinContext)
  const { title, description, questions, buttons } = page

  const textAreaQuestions = questions.filter((q) => q.component === "text")

  return (
    <>
      <ScreenHeaderParticipation title={title.de} description={description.de} />
      <ParticipationH3>{questions[0].label.de}</ParticipationH3>
      {Boolean(feedbackCategory?.length) &&
        feedbackCategory?.map((c) => <ParticipationP key={c}>{c}</ParticipationP>)}

      {pinPostion && (
        <>
          <ParticipationH3>{questions[1].label.de}</ParticipationH3>
          <ParticipationStaticMap
            marker={pinPostion}
            staticMap={{
              projectGeometry: projectGeometry,
            }}
          />
        </>
      )}
      {textAreaQuestions &&
        textAreaQuestions.length &&
        textAreaQuestions.map((question, index) => (
          <Question className="mb-2" key={index} question={question} />
        ))}

      {/* TODO Disabled */}
      <ParticipationButtonWrapper>
        <ParticipationButton type="submit">{buttons[0].label.de}</ParticipationButton>
        <ParticipationButton color="pink" type="button" onClick={onButtonClick}>
          {buttons[1].label.de}
        </ParticipationButton>
      </ParticipationButtonWrapper>
      <ParticipationButton color="white" type="button" onClick={onButtonClick}>
        Zurück
      </ParticipationButton>
    </>
  )
}
