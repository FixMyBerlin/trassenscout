import { TMapProps } from "@/src/survey-public/components/types"
import { SurveyMapExternal } from "@/src/survey-responses/components/feedback/SurveyMapExternal"
import { useFormContext } from "react-hook-form"

type Props = {
  mapProps: TMapProps
  userLocationQuestionId: number
  isUserLocationQuestionId: number
  maptilerUrl: string
}

export const ExternalSurveyResponseFormMap: React.FC<Props> = ({
  mapProps,
  isUserLocationQuestionId,
  userLocationQuestionId,
  maptilerUrl,
}) => {
  const { watch } = useFormContext()

  // watch if user choses to set a pin, update component if user choses to set a pin
  // todo helper function getFormfieldName()
  const isMap = watch(`single-${isUserLocationQuestionId}`) === "true"

  return (
    isMap && (
      <div>
        <p className="mb-4 block text-sm font-medium text-gray-700">Position wählen</p>
        <SurveyMapExternal
          pinId={userLocationQuestionId}
          className="!h-64"
          projectMap={{
            maptilerUrl: maptilerUrl,
            initialMarker: {
              lng: mapProps.marker!.lng,
              lat: mapProps.marker!.lat,
            },
            config: {
              bounds: mapProps.config!.bounds,
            },
          }}
        />
      </div>
    )
  )
}
