import { DrawingToolbar } from "@/src/core/components/Map/TerraDraw/DrawingToolbar"
import { TerraDrawMap } from "@/src/core/components/Map/TerraDraw/TerraDrawMap"
import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { mapGeoTypeToEnum } from "@/src/server/shared/utils/mapGeoTypeToEnum"
import { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { bbox } from "@turf/turf"
import { useMemo, useRef } from "react"
import { useFormContext } from "react-hook-form"
import type { LngLatBoundsLike } from "react-map-gl/maplibre"

type AllowedType = "point" | "line" | "polygon"

type Props = {
  allowedTypes: AllowedType[]
  subsection?: TGetSubsection
  subsections?: TSubsections
  selectedSubsectionSlug?: string
  subsubsections?: SubsubsectionWithPosition[]
  selectedSubsubsectionSlug?: string
}

export const GeometryInputMap = ({
  allowedTypes,
  subsection,
  subsections,
  selectedSubsectionSlug,
  subsubsections,
  selectedSubsubsectionSlug,
}: Props) => {
  const { watch, setValue } = useFormContext()
  const geometry = watch("geometry") as SupportedGeometry | undefined
  const updateTerraDrawRef = useRef<
    ((geometry: SupportedGeometry | null, ignoreChangeEvents?: boolean) => void) | null
  >(null)

  const showPoint = allowedTypes.includes("point")
  const showLine = allowedTypes.includes("line")
  const showPolygon = allowedTypes.includes("polygon")

  // Calculate initial view bounds (priority order):
  // 1. If geometry exists (editing mode): use geometry bounds
  // 2. Else if subsection provided: use subsection bounds
  // 3. Otherwise: undefined (will use default view)
  const initialViewState = useMemo(() => {
    let targetGeometry: SupportedGeometry | undefined

    if (geometry) {
      targetGeometry = geometry
    } else if (subsection) {
      targetGeometry = subsection.geometry
    }

    if (targetGeometry) {
      const [minX, minY, maxX, maxY] = bbox(targetGeometry)
      const bounds: LngLatBoundsLike = [minX, minY, maxX, maxY]
      return {
        bounds,
        fitBoundsOptions: { padding: 100 },
      }
    }

    return undefined
  }, [geometry, subsection])

  const handleChange = (geo: SupportedGeometry | null, geoType: string | null) => {
    if (geo && geoType) {
      setValue("geometry", geo, { shouldValidate: true })
      setValue("type", mapGeoTypeToEnum(geoType), { shouldValidate: true })
    } else {
      setValue("geometry", undefined, { shouldValidate: true })
      setValue("type", undefined, { shouldValidate: true })
    }
  }

  return (
    <div className="space-y-2">
      <TerraDrawMap
        initialGeometry={geometry}
        onChange={handleChange}
        initialViewState={initialViewState}
        subsections={subsections}
        selectedSubsectionSlug={selectedSubsectionSlug}
        subsubsections={subsubsections}
        selectedSubsubsectionSlug={selectedSubsubsectionSlug}
      >
        {({
          mode,
          setMode,
          clear,
          updateFeatures,
          getSelectedIds,
          deleteSelected,
          selectedIds,
          enabledButtons,
        }) => {
          // Store updateFeatures in ref so SnappingControls can use it
          updateTerraDrawRef.current = updateFeatures
          return (
            <DrawingToolbar
              mode={mode}
              setMode={setMode}
              onClear={clear}
              getSelectedIds={getSelectedIds}
              deleteSelected={deleteSelected}
              selectedIds={selectedIds}
              showPoint={showPoint}
              showLine={showLine}
              showPolygon={showPolygon}
              enabledButtons={enabledButtons}
              trailingButtons={
                null
                // TODO: Disabled for now, does currently not work.
                // subsection ? (
                //   <SnappingControls
                //     subsection={subsection}
                //     geometry={geometry}
                //     handleChange={handleChange}
                //     updateTerraDraw={(geo, ignoreChangeEvents) =>
                //       updateTerraDrawRef.current?.(geo, ignoreChangeEvents)
                //     }
                //   />
                // ) : null
              }
            />
          )
        }}
      </TerraDrawMap>
    </div>
  )
}
