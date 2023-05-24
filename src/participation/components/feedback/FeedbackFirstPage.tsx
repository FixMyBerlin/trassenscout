import { MapProvider } from "react-map-gl"
import { ParticipationButton } from "../core/ParticipationButton"
import { ScreenHeaderParticipation } from "../core/ScreenHeaderParticipation"
import { ParticipationMap } from "../maps/ParticipationMap"
import { Question } from "../survey/Question"
import { ParticipationButtonWrapper } from "../core/ParticipationButtonWrapper"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  page: any // TODO
  isMap: boolean
  onButtonClick: any // TODO
  isCompleted: boolean
  mapIsDirtyProps: any
}

export const FeedbackFirstPage: React.FC<Props> = ({
  isCompleted,
  page,
  isMap,
  onButtonClick,
  mapIsDirtyProps,
}) => {
  const { title, description, questions, buttons } = page

  const mapProps = questions.find(
    (question: Record<string, any>) => question.component === "map"
  ).props

  return (
    <>
      <ScreenHeaderParticipation title={title.de} description={description.de} />

      <Question question={questions[0]} />
      <Question question={questions[1]} />
      {isMap && (
        <MapProvider>
          <ParticipationMap
            {...mapIsDirtyProps}
            projectMap={{
              layerStyles: mapProps.layerStyles,
              projectGeometry: mapProps.projectGeometry,
              initialMarker: mapProps.marker,
              config: mapProps.config,
            }}
          />
        </MapProvider>
      )}
      {/* TODO Disabled */}
      <ParticipationButtonWrapper>
        <ParticipationButton disabled={!isCompleted} type="button" onClick={onButtonClick}>
          {buttons[0].label.de}
        </ParticipationButton>
      </ParticipationButtonWrapper>
    </>
  )
}
