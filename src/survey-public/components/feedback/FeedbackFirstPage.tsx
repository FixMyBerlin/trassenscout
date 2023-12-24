import { MapProvider } from "react-map-gl/maplibre"
import { SurveyButton } from "../core/buttons/SurveyButton"
import { SurveyScreenHeader } from "../core/layout/SurveyScreenHeader"
import { SurveyMap } from "../maps/SurveyMap"
import { Question } from "../Question"
import { SurveyButtonWrapper } from "../core/buttons/SurveyButtonWrapper"
import { SurveyMapLegend } from "../maps/SurveyMapLegend"
import { TMapProps, TPage } from "../types"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  page: any
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

  const mapProps = questions.find((question: Record<string, any>) => question.component === "map")!
    .props as TMapProps

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
              initialMarker: mapProps.marker,
              config: mapProps.config,
            }}
          />
          {mapProps.legend && <SurveyMapLegend legend={mapProps.legend} />}
        </MapProvider>
      )}
      {/* TODO Disabled */}
      <SurveyButtonWrapper>
        <SurveyButton
          color={buttons[0].color}
          disabled={!isCompleted}
          type="button"
          onClick={onButtonClick}
        >
          {buttons[0].label.de}
        </SurveyButton>
      </SurveyButtonWrapper>
    </>
  )
}
