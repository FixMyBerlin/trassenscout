import { SurveyScreenHeader } from "@/src/survey-public/components/core/layout/SurveyScreenHeader"
import { TMapProps, TPage, TTextareaProps } from "@/src/survey-public/components/types"
import { Fragment, useState } from "react"
import { FieldErrors, FieldValues, useFormContext } from "react-hook-form"
import { MapProvider } from "react-map-gl/maplibre"
import { getQuestionNames } from "../../utils/getQuestionNames"
import { Question } from "../Question"
import { SurveyH2 } from "../core/Text"
import { SurveyButton } from "../core/buttons/SurveyButton"
import { SurveyButtonWrapper } from "../core/buttons/SurveyButtonWrapper"
import { SurveyFormErrorsBox } from "../core/form/SurveyFormErrorsBox"
import { SurveyLabeledTextareaField } from "../core/form/SurveyLabeledTextareaField"
import { SurveyMap } from "../maps/SurveyMap"
import { SurveyMapLegend } from "../maps/SurveyMapLegend"

type Props = {
  formErrors?: FieldErrors<FieldValues>
  mapProps: TMapProps
  maptilerUrl: string
  page: TPage
  onButtonClick: any
  userTextIndices: (number | undefined)[]
  setIsMapDirty: (value: boolean) => void
  pinId: number
  isUserLocationQuestionId: number
  lineGeometryId: number
  userLocationQuestionId: number
}

export const FeedbackSecondPage = ({
  mapProps,
  maptilerUrl,
  page,
  onButtonClick,
  userTextIndices,
  setIsMapDirty,
  pinId,
  isUserLocationQuestionId,
  lineGeometryId,
  userLocationQuestionId,
}: Props) => {
  const { title, description, questions, buttons } = page
  const {
    formState: { errors },
    trigger,
    watch,
  } = useFormContext()
  // watch if user choses to set a pin ("1" -> "Ja"), update component if user choses to set a pin
  const watchIsMap = watch(`single-${isUserLocationQuestionId}`) === "1"
  const watchIsLocationValue = watch(`map-${userLocationQuestionId}`)
  const [isButtonTouched, setIsButtonTouched] = useState(false)

  const relevantQuestions = questions!.filter(
    (q) => ![isUserLocationQuestionId, userLocationQuestionId].includes(q.id),
  )
  const relevantQuestionNames = getQuestionNames(relevantQuestions)

  const handleOnClick = () => {
    setIsButtonTouched(true)
    trigger(...relevantQuestionNames)
  }

  return (
    <>
      <SurveyScreenHeader title={title.de} description={description.de} />
      {/* @ts-expect-error */}
      <Question question={questions.find((q) => q.id === isUserLocationQuestionId)} />

      {watchIsMap && (
        <>
          <SurveyH2>
            {/* @ts-expect-error */}
            {questions.find((q) => q.id === userLocationQuestionId)?.label.de} *
          </SurveyH2>
          <MapProvider>
            <SurveyMap
              setIsMapDirty={setIsMapDirty}
              projectMap={{
                maptilerUrl: maptilerUrl,
                initialMarker: mapProps.marker!,
                config: mapProps.config,
              }}
              pinId={pinId}
              // todo survey clean up or refactor after survey BB line selection
              lineGeometryId={lineGeometryId}
              userLocationQuestionId={userLocationQuestionId}
            />

            {mapProps.legend && <SurveyMapLegend legend={mapProps.legend} />}
          </MapProvider>
        </>
      )}
      <div className="pt-8">
        {userTextIndices.map((questionId) => {
          const q = questions!.find((q) => q.id === questionId)
          if (q) {
            const userTextQuestionProps = q.props as TTextareaProps
            return (
              <Fragment key={q.id}>
                <SurveyH2>{q.label.de} *</SurveyH2>
                {q.help && <div className="-mt-4 mb-6 text-sm text-gray-400">{q.help.de}</div>}
                <SurveyLabeledTextareaField
                  caption={userTextQuestionProps.caption?.de}
                  key={q.id}
                  maxLength={userTextQuestionProps.validation?.maxLength ?? 2000}
                  name={`text-${q.id}`}
                  placeholder={userTextQuestionProps.placeholder?.de}
                  label={""}
                />
              </Fragment>
            )
          }
        })}
      </div>
      {isButtonTouched && (
        <SurveyFormErrorsBox
          customErrors={
            watchIsMap && !watchIsLocationValue
              ? {
                  [`map-${userLocationQuestionId}`]: {
                    message:
                      "Sie haben oben angegeben, dass Sie eine konkrete Stelle auswählen möchten. Das Setzen des Pins ist daher verpflichtend.",
                  },
                }
              : undefined
          }
          formErrors={errors}
          surveyPart="feedback"
        />
      )}
      <SurveyButtonWrapper>
        <div className="flex flex-col gap-6">
          <SurveyButton
            color={buttons[0]?.color}
            id="submit-more"
            onClick={watchIsMap && !watchIsLocationValue ? handleOnClick : undefined}
            type={watchIsMap && !watchIsLocationValue ? "button" : "submit"}
          >
            {buttons![0]?.label.de}
          </SurveyButton>
          <SurveyButton
            color={buttons[1]?.color}
            id="submit-finish"
            onClick={watchIsMap && !watchIsLocationValue ? handleOnClick : undefined}
            type={watchIsMap && !watchIsLocationValue ? "button" : "submit"}
          >
            {buttons![1]?.label.de}
          </SurveyButton>
        </div>
        <SurveyButton color="white" type="button" onClick={onButtonClick}>
          Zurück
        </SurveyButton>
      </SurveyButtonWrapper>
    </>
  )
}
