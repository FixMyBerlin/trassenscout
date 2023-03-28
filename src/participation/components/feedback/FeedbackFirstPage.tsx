import { ParticipationButton } from "../core/ParticipationButton"
import { ScreenHeaderParticipation } from "../core/ScreenHeaderParticipation"
import { ParticipationH2 } from "../core/Text"
import { ParticipationLabeledCheckboxGroup } from "../form/ParticipationLabeledCheckboxGroup"
import { ParticipationLabeledRadiobuttonGroup } from "../form/ParticipationLabeledRadiobuttonGroup"
import { ParticipationMap } from "../maps/ParticipationMap"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  page: any // TODO
  isMap: boolean
  onButtonClick: any // TODO
}

export const FeedbackFirstPage: React.FC<Props> = ({ page, isMap, onButtonClick }) => {
  const { title, description, questions, buttons } = page

  const mapProps = questions.find((question) => question.component === "custom").props

  return (
    <>
      <ScreenHeaderParticipation title={title.de} description={description.de} />
      <ParticipationLabeledRadiobuttonGroup
        items={questions[0].props.responses.map((item) => ({
          scope: String(questions[1].id),
          name: String(item.id),
          label: item.text.de,
          value: item.id,
        }))}
      />
      <ParticipationH2>{questions[1].label.de}</ParticipationH2>
      <ParticipationLabeledRadiobuttonGroup
        items={questions[1].props.responses.map((item) => ({
          scope: "mapView",
          name: String(item.id),
          label: item.text.de,
          value: item.id,
        }))}
      />
      {isMap && (
        <ParticipationMap
          projectMap={{
            projectGeometry: mapProps.projectGeometry,
            initialMarker: mapProps.marker,
            config: mapProps.config,
          }}
        />
      )}
      {/* TODO Disabled */}
      <ParticipationButton type="button" onClick={onButtonClick}>
        {buttons[0].label.de}
      </ParticipationButton>
    </>
  )
}
