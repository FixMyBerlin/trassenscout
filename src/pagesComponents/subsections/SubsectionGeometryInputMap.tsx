import { DrawingToolbar } from "@/src/core/components/Map/TerraDraw/DrawingToolbar"
import { TerraDrawMap } from "@/src/core/components/Map/TerraDraw/TerraDrawMap"
import { mapGeoTypeToEnum } from "@/src/server/shared/utils/mapGeoTypeToEnum"
import type { Geometry } from "geojson"
import { useFormContext } from "react-hook-form"

export const SubsectionGeometryInputMap = () => {
  const { watch, setValue } = useFormContext()
  const geometry = watch("geometry") as Geometry

  const handleChange = (geo: Geometry | null, geoType: string | null) => {
    if (geo && geoType) {
      setValue("geometry", geo, { shouldValidate: true })
      setValue("type", mapGeoTypeToEnum(geoType), { shouldValidate: true })
    } else {
      setValue("geometry", undefined, { shouldValidate: true })
      setValue("type", undefined, { shouldValidate: true })
    }
  }

  return (
    <TerraDrawMap initialGeometry={geometry} onChange={handleChange}>
      {({ mode, setMode, clear, enabledButtons }) => (
        <DrawingToolbar
          mode={mode}
          setMode={setMode}
          onClear={clear}
          showPoint={true}
          showLine={true}
          showPolygon={true}
          enabledButtons={enabledButtons}
        />
      )}
    </TerraDrawMap>
  )
}
