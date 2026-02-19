import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { TerraDrawHint } from "@/src/core/components/Map/TerraDraw/TerraDrawHint"
import { TerraDrawProvider } from "@/src/core/components/Map/TerraDraw/TerraDrawProvider"
import { TerraDrawToolbar } from "@/src/core/components/Map/TerraDraw/TerraDrawToolbar"
import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { mapGeoTypeToEnum } from "@/src/server/shared/utils/mapGeoTypeToEnum"
import { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import { bbox } from "@turf/turf"
import { useMemo, useRef } from "react"
import { useFormContext } from "react-hook-form"
import type { LngLatBoundsLike } from "react-map-gl/maplibre"

type AllowedType = "point" | "line" | "polygon"

type Props = {
  allowedTypes: AllowedType[]
  subsection?: TGetSubsection
  children?: React.ReactNode
}

export const GeometryDrawingMap = ({ allowedTypes, subsection, children }: Props) => {
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
        fitBoundsOptions: { padding: 100, maxZoom: 16 },
      }
    }

    return undefined
  }, [geometry, subsection])

  const defaultViewState = {
    longitude: 13.404954,
    latitude: 52.520008,
    zoom: 11,
  }

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
    <div className="relative h-[500px] w-full overflow-clip rounded-md border border-gray-200">
      <BaseMap
        id="terra-draw-map"
        // Critical to avoid a bug where the Terra Draw Geometries where hidden during navigation between pages (Subsubsection => Subsubsection/Edit)
        reuseMaps={false}
        initialViewState={initialViewState || defaultViewState}
        backgroundSwitcherPosition="bottom-left"
        colorSchema="subsection"
      >
        {children}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2.5">
          <TerraDrawProvider initialGeometry={geometry} onChange={handleChange}>
            {({
              mode,
              setMode,
              clear,
              updateFeatures,
              deleteSelected,
              selectedIds,
              hasGeometries,
              enabledButtons,
            }) => {
              // Store updateFeatures in ref so SnappingControls can use it
              updateTerraDrawRef.current = updateFeatures
              return (
                <TerraDrawToolbar
                  mode={mode}
                  setMode={setMode}
                  onClear={clear}
                  deleteSelected={deleteSelected}
                  selectedIds={selectedIds}
                  hasGeometries={hasGeometries}
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
          </TerraDrawProvider>
          <TerraDrawHint />
        </div>
      </BaseMap>
    </div>
  )
}
