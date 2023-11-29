import { MapProvider } from "react-map-gl/maplibre"
import { SurveyButton } from "../../../components/core/buttons/SurveyButton"
import { SurveyScreenHeader } from "../../../components/core/layout/SurveyScreenHeader"
import { SurveyMap } from "../../../components/maps/SurveyMap"
import { Question } from "../../../components/Question"
import { SurveyButtonWrapper } from "../../../components/core/buttons/SurveyButtonWrapper"

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
    (question: Record<string, any>) => question.component === "map",
  ).props

  return (
    <>
      <SurveyScreenHeader title={title.de} description={description.de} />

      <Question question={questions[0]} />
      <Question question={questions[1]} />
      {isMap && (
        <MapProvider>
          <SurveyMap
            {...mapIsDirtyProps}
            projectMap={{
              maptilerStyleUrl: mapProps.maptilerStyleUrl,
              layerStyles: mapProps.layerStyles,
              projectGeometry: mapProps.projectGeometry,
              initialMarker: mapProps.marker,
              config: mapProps.config,
            }}
          />
        </MapProvider>
      )}
      {/* TODO Disabled */}
      <SurveyButtonWrapper>
        <SurveyButton disabled={!isCompleted} type="button" onClick={onButtonClick}>
          {buttons[0].label.de}
        </SurveyButton>
      </SurveyButtonWrapper>
    </>
  )
}