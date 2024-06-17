import { SurveyButton } from "../core/buttons/SurveyButton"
import { SurveyButtonWrapper } from "../core/buttons/SurveyButtonWrapper"

import { useFormContext } from "react-hook-form"
import { MapProvider } from "react-map-gl"
import { SurveyScreenHeader } from "src/survey-public/components/core/layout/SurveyScreenHeader"
import { TFeedbackQuestion, TMapProps, TPage, TTextProps } from "src/survey-public/components/types"
import { Question } from "../Question"
import { SurveyLabeledTextareaField } from "../core/form/SurveyLabeledTextareaField"
import { SurveyMap } from "../maps/SurveyMap"
import { SurveyMapLegend } from "../maps/SurveyMapLegend"
import { SurveyH2 } from "../core/Text"

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
            // todo survey clean up or refactor after survey BB line selection
            lineGeometryId={lineGeometryId}
          />

          {mapProps.legend && <SurveyMapLegend legend={mapProps.legend} />}
        </MapProvider>
      )}
      <div className="pt-8">
        {userTextIndices.map((questionId) => {
          const q = questions!.find((q) => q.id === questionId)
          if (q) {
            const userTextQuestionProps = q.props as TTextProps
            return (
              <>
                <SurveyH2>{q.label.de} *</SurveyH2>
                {q.help && <div className="-mt-4 mb-6 text-gray-400 text-sm">{q.help.de}</div>}
                <SurveyLabeledTextareaField
                  key={q.id}
                  maxLength={200}
                  name={`text-${q.id}`}
                  placeholder={userTextQuestionProps.placeholder?.de}
                  label={""}
                />
              </>
            )
          }
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
