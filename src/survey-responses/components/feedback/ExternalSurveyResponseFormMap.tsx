import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { SurveyMap } from "src/survey-public/components/maps/SurveyMap"
import { TMapProps } from "src/survey-public/components/types"

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

  // the isMapDirty state is useless atm - we just need it as a prop for surveyMap but we do not use it here (yet)
  const [isMapDirty, setIsMapDirty] = useState(false)

  // watch if user choses to set a pin, update component if user choses to set a pin
  const isMap = watch(`single-${isUserLocationQuestionId}`) === "true"

  return (
    isMap && (
      <div>
        <p className="mb-4 block text-sm font-medium text-gray-700">Position wählen</p>
        <SurveyMap
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
          setIsMapDirty={setIsMapDirty}
        />
      </div>
    )
  )
}
