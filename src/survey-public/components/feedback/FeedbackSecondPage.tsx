import { SurveyScreenHeader } from "@/src/survey-public/components/core/layout/SurveyScreenHeader"
import { TMapProps, TPage, TTextProps } from "@/src/survey-public/components/types"
import { Fragment } from "react"
import { useFormContext } from "react-hook-form"
import { MapProvider } from "react-map-gl/maplibre"
import { Question } from "../Question"
import { SurveyH2, SurveyP } from "../core/Text"
import { SurveyButton } from "../core/buttons/SurveyButton"
import { SurveyButtonWrapper } from "../core/buttons/SurveyButtonWrapper"
import { SurveyLabeledTextareaField } from "../core/form/SurveyLabeledTextareaField"
import { SurveyMap } from "../maps/SurveyMap"
import { SurveyMapLegend } from "../maps/SurveyMapLegend"

export { FORM_ERROR } from "@/src/core/components/forms"

type Props = {
  mapProps: TMapProps
  maptilerUrl: string
  page: TPage
  onButtonClick: any
  isCompletedProps: { isCompleted: boolean; setIsCompleted: (value: boolean) => void }
  userTextIndices: (number | undefined)[]
  setIsMapDirty: (value: boolean) => void
  pinId: number
  isUserLocationQuestionId: number
  lineGeometryId: number
  userLocationQuestionId: number
}

export const FeedbackSecondPage: React.FC<Props> = ({
  mapProps,
  maptilerUrl,
  page,
  isCompletedProps: { isCompleted, setIsCompleted },
  onButtonClick,
  userTextIndices,
  setIsMapDirty,
  pinId,
  isUserLocationQuestionId,
  lineGeometryId,
  userLocationQuestionId,
}) => {
  const { title, description, questions, buttons } = page

  // watch if user choses to set a pin, update component if user choses to set a pin
  const isMap = useFormContext().watch(`single-${isUserLocationQuestionId}`) === "1"

  return (
    <>
      <SurveyScreenHeader title={title.de} description={description.de} />
      {/* @ts-expect-error */}
      <Question question={questions.find((q) => q.id === isUserLocationQuestionId)} />
      {/* @ts-expect-error */}
      <SurveyH2>{questions.find((q) => q.id === userLocationQuestionId)?.label.de} *</SurveyH2>
      {isMap && (
        <MapProvider>
          <SurveyMap
            setIsMapDirty={setIsMapDirty}
            projectMap={{
              maptilerUrl: maptilerUrl,
              initialMarker: mapProps.marker!,
              config: mapProps.config,
            }}
            pinId={pinId}
            questionIds={questions?.map((q) => q.id) || []}
            setIsCompleted={setIsCompleted}
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
              <Fragment key={q.id}>
                <SurveyH2>{q.label.de} *</SurveyH2>
                {q.help && <div className="-mt-4 mb-6 text-sm text-gray-400">{q.help.de}</div>}
                <SurveyLabeledTextareaField
                  caption={userTextQuestionProps.caption?.de}
                  key={q.id}
                  maxLength={200}
                  name={`text-${q.id}`}
                  placeholder={userTextQuestionProps.placeholder?.de}
                  label={""}
                />
              </Fragment>
            )
          }
        })}
      </div>
      <SurveyButtonWrapper>
        <div className="flex flex-col gap-6">
          <SurveyButton
            color={buttons[0]?.color}
            disabled={!isCompleted}
            id="submit-more"
            type="submit"
          >
            {buttons![0]?.label.de}
          </SurveyButton>
          <SurveyButton
            color={buttons[1]?.color}
            disabled={!isCompleted}
            id="submit-finish"
            type="submit"
          >
            {buttons![1]?.label.de}
          </SurveyButton>
        </div>
        <SurveyButton color="white" type="button" onClick={onButtonClick}>
          Zurück
        </SurveyButton>
      </SurveyButtonWrapper>

      <SurveyP className="text-sm sm:text-sm">
        * Pflichtfelder <br />
        Um fortzufahren, bitte alle Pflichtfelder ausfüllen.
      </SurveyP>
    </>
  )
}
