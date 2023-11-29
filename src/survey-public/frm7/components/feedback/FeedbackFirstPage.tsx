import { MapProvider } from "react-map-gl/maplibre"

import { SurveyButton } from "src/survey-public/components/core/buttons/SurveyButton"
import { SurveyButtonWrapper } from "src/survey-public/components/core/buttons/SurveyButtonWrapper"
import { SurveyScreenHeader } from "src/survey-public/components/core/layout/SurveyScreenHeader"
import { SurveyMap } from "src/survey-public/components/maps/SurveyMap"
import { Question } from "src/survey-public/components/Question"

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
