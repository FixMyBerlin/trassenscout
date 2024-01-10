import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { SurveyMap } from "src/survey-public/components/maps/SurveyMap"
import { TMapProps } from "src/survey-public/components/types"

type Props = { mapProps: TMapProps; isLocation: boolean; setIsLocation: any }

export const ExternalSurveyResponseFormMap: React.FC<Props> = ({
  mapProps,
  isLocation,
  setIsLocation,
}) => {
  const { watch } = useFormContext()
  // the isMapDirty state is useless atm - we just need it as a prop for surveyMap but we do not use it here (yet)
  const [isMapDirty, setIsMapDirty] = useState(false)

  setIsLocation(watch("isLocation") === "true")
  console.log("isMap", isLocation)

  if (!isLocation) return

  return (
    <div>
      <p className="mb-4 block text-sm font-medium text-gray-700">Position wählen</p>
      <SurveyMap
        className="!h-64"
        projectMap={{
          maptilerStyleUrl: mapProps.maptilerStyleUrl,
          initialMarker: {
            lng: mapProps.marker!.lng,
            lat: mapProps.marker!.lat,
          },
          config: {
            bounds: mapProps.config!.bounds,
            pinColor: mapProps.config!.pinColor,
          },
        }}
        setIsMapDirty={setIsMapDirty}
      />
    </div>
  )
}
