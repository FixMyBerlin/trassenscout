import { SurveyButton } from "../core/buttons/SurveyButton"
import { SurveyButtonWrapper } from "../core/buttons/SurveyButtonWrapper"

import { MapProvider } from "react-map-gl"
import { SurveyScreenHeader } from "src/survey-public/components/core/layout/SurveyScreenHeader"
import { TMapProps, TPage, TQuestion } from "src/survey-public/components/types"
import { Question } from "../Question"
import { SurveyMap } from "../maps/SurveyMap"
import { SurveyMapLegend } from "../maps/SurveyMapLegend"
import { useFormContext } from "react-hook-form"

export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  mapProps: TMapProps
  maptilerUrl: string
  page: TPage
  onButtonClick: any
  isCompleted: boolean
  userTextIndices: (number | undefined)[]
  mapIsDirtyProps: any
  pinId: number
  isUserLocationQuestionId: number
  lineGeometryId: number
}

export const FeedbackSecondPage: React.FC<Props> = ({
  mapProps,
  maptilerUrl,
  page,
  isCompleted,
  onButtonClick,
  userTextIndices,
  mapIsDirtyProps,
  pinId,
  isUserLocationQuestionId,
  lineGeometryId,
}) => {
  const { title, description, questions, buttons } = page

  // watch if user choses to set a pin, update component if user choses to set a pin
  const isMap = useFormContext().watch(`single-${isUserLocationQuestionId}`) === "1"

  return (
    <>
      <SurveyScreenHeader title={title.de} description={description.de} />
      {/* @ts-expect-error */}
      {!!questions?.length && <Question question={questions[0]} />}
      {/* <SurveyP>{feedbackCategory}</SurveyP> */}
      {isMap && (
        <MapProvider>
          <SurveyMap
            {...mapIsDirtyProps}
            projectMap={{
              maptilerUrl: maptilerUrl,
              initialMarker: mapProps.marker,
              config: mapProps.config,
            }}
            pinId={pinId}
            // clean up after BB line selection is removed
            lineGeometryId={lineGeometryId}
          />

          {mapProps.legend && <SurveyMapLegend legend={mapProps.legend} />}
        </MapProvider>
      )}
      <div className="pt-8">
        {userTextIndices.map((questionId) => {
          const q = questions!.find((q: TQuestion) => q.id === questionId)
          if (q) return <Question key={questionId} question={q} />
        })}
      </div>
      <SurveyButtonWrapper>
        <SurveyButton
          color={buttons[0]?.color}
          disabled={!isCompleted}
          id="submit-finish"
          type="submit"
        >
          {buttons![0]?.label.de}
        </SurveyButton>
        <SurveyButton
          color={buttons[1]?.color}
          disabled={!isCompleted}
          id="submit-more"
          type="submit"
        >
          {buttons![1]?.label.de}
        </SurveyButton>
      </SurveyButtonWrapper>
      <SurveyButton color="white" type="button" onClick={onButtonClick}>
        Zurück
      </SurveyButton>
    </>
  )
}
