import { MapProvider } from "react-map-gl"
import { ParticipationButton } from "../core/ParticipationButton"
import { ScreenHeaderParticipation } from "../core/ScreenHeaderParticipation"
import { ParticipationH2 } from "../core/Text"
import { ParticipationLabeledCheckboxGroup } from "../form/ParticipationLabeledCheckboxGroup"
import { ParticipationLabeledRadiobuttonGroup } from "../form/ParticipationLabeledRadiobuttonGroup"
import { ParticipationMap } from "../maps/ParticipationMap"
import { Question } from "../survey/Question"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  page: any // TODO
  isMap: boolean
  onButtonClick: any // TODO
}

export const FeedbackFirstPage: React.FC<Props> = ({ page, isMap, onButtonClick }) => {
  const { title, description, questions, buttons } = page

  const mapProps = questions.find((question) => question.component === "map").props

  return (
    <>
      <Question question={questions[0]} />
      <Question question={questions[1]} />
      {/* <ParticipationH2>{questions[1].label.de}</ParticipationH2>
      <ParticipationLabeledRadiobuttonGroup
        items={questions[1].props.responses.map((item) => ({
          scope: "mapView",
          name: `mapView-${item.id}`,
          label: item.text.de,
          value: item.id,
        }))}
      /> */}
      {isMap && (
        <MapProvider>
          <ParticipationMap
            projectMap={{
              projectGeometry: mapProps.projectGeometry,
              initialMarker: mapProps.marker,
              config: mapProps.config,
            }}
          />
        </MapProvider>
      )}
      {/* TODO Disabled */}
      <ParticipationButton type="button" onClick={onButtonClick}>
        {buttons[0].label.de}
      </ParticipationButton>
    </>
  )
}
