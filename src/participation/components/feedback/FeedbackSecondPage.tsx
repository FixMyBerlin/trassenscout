import { ParticipationButton } from "../core/ParticipationButton"
import { ParticipationButtonWrapper } from "../core/ParticipationButtonWrapper"
import { ScreenHeaderParticipation } from "../core/ScreenHeaderParticipation"
import { ParticipationH2, ParticipationH3 } from "../core/Text"
import { ParticipationLabeledCheckboxGroup } from "../form/ParticipationLabeledCheckboxGroup"
import { ParticipationLabeledRadiobuttonGroup } from "../form/ParticipationLabeledRadiobuttonGroup"
import { ParticipationMap } from "../maps/ParticipationMap"
import { ParticipationStaticMap } from "../maps/ParticipationStaticMap"
import { Question } from "../survey/Question"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  page: any // TODO
  onButtonClick: { next: any; back: any } // TODO
}

export const FeedbackSecondPage: React.FC<Props> = ({ page, onButtonClick }) => {
  const { title, description, questions, buttons } = page
  const textAreaQuestions = questions.filter((q) => q.component === "text")

  return (
    <>
      <ScreenHeaderParticipation title={title.de} description={description.de} />
      <ParticipationH3>{questions[0].label.de}</ParticipationH3>
      <p>TODO</p>
      <ParticipationH3>{questions[1].label.de}</ParticipationH3>
      <ParticipationStaticMap
        marker={{
          lng: 13.465274,
          lat: 52.507573,
        }}
        staticMap={{
          projectGeometry: {
            type: "MultiLineString",
            coordinates: [
              [
                [13.467931, 52.504393],
                [13.467309, 52.504917],
                [13.466715, 52.505385],
                [13.466632, 52.50544],
                [13.466545, 52.505499],
                [13.465651, 52.506256],
                [13.465277, 52.50656],
                [13.465014, 52.506773],
                [13.464841, 52.506901],
                [13.464793, 52.506936],
                [13.464716, 52.507013],
                [13.46479, 52.507086],
                [13.464836, 52.507133],
                [13.465274, 52.507573],
              ],
              [
                [13.465274, 52.507573],
                [13.465279, 52.507578],
              ],
            ],
          },
        }}
      />
      {textAreaQuestions &&
        textAreaQuestions.length &&
        textAreaQuestions.map((question, index) => (
          <Question className="mb-2" key={index} question={question} />
        ))}

      {/* TODO Disabled */}
      <ParticipationButtonWrapper>
        <ParticipationButton type="button" onClick={onButtonClick.next}>
          {buttons[0].label.de}
        </ParticipationButton>
        <ParticipationButton color="white" type="button" onClick={onButtonClick.back}>
          {buttons[1].label.de}
        </ParticipationButton>
      </ParticipationButtonWrapper>
    </>
  )
}
