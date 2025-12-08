import { DrawingToolbar } from "@/src/core/components/Map/TerraDraw/DrawingToolbar"
import { TerraDrawMap } from "@/src/core/components/Map/TerraDraw/TerraDrawMap"
import { isDev } from "@/src/core/utils/isEnv"
import { mapGeoTypeToEnum } from "@/src/server/shared/utils/mapGeoTypeToEnum"
import { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { bbox } from "@turf/turf"
import type { Geometry } from "geojson"
import { useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { LngLatBoundsLike } from "react-map-gl/maplibre"
import { SnappingControls } from "./SubsubsectionGeometryInput/SnappingControls"
import { useSnapping } from "./SubsubsectionGeometryInput/useSnapping"

type Props = {
  subsection: TGetSubsection
}

export const SubsubsectionGeometryInputMap = ({ subsection }: Props) => {
  const { watch, setValue } = useFormContext()
  const geometry = watch("geometry") as Geometry
  const geometryType = watch("type") as SubsubsectionWithPosition["type"]

  const snapping = useSnapping({ targetGeometry: subsection.geometry })

  const [minX, minY, maxX, maxY] = bbox(subsection.geometry)
  const sectionBounds: LngLatBoundsLike = [minX, minY, maxX, maxY]

  useEffect(() => {
    if (isDev) {
      console.log("[SubsubsectionGeometryInputMap] Form geometry changed:", geometry)
    }
  }, [geometry])

  const handleChange = (geo: Geometry | null, geoType: string | null) => {
    if (isDev) {
      console.log("[SubsubsectionGeometryInputMap] handleChange called with:", { geo, geoType })
    }
    if (geo && geoType) {
      setValue("geometry", geo, { shouldValidate: true })
      setValue("type", mapGeoTypeToEnum(geoType), { shouldValidate: true })
    } else {
      setValue("geometry", undefined, { shouldValidate: true })
      setValue("type", undefined, { shouldValidate: true })
    }
    snapping.clearPreSnap()
  }

  return (
    <div className="space-y-2">
      <SnappingControls
        hasGeometry={!!geometry}
        hasPreSnapGeometry={!!snapping.preSnapGeometry}
        onSnap={snapping.handleSnap}
        onUnsnap={snapping.handleUnsnap}
      />

      <TerraDrawMap
        initialGeometry={geometry}
        onChange={handleChange}
        initialViewState={{
          bounds: sectionBounds,
          fitBoundsOptions: { padding: 100 },
        }}
      >
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
    </div>
  )
}
