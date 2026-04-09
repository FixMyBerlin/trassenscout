import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { getStaticOverlayForProject } from "@/src/core/components/Map/staticOverlay/getStaticOverlayForProject"
import { TerraDrawHint } from "@/src/core/components/Map/TerraDraw/TerraDrawHint"
import { TerraDrawProvider } from "@/src/core/components/Map/TerraDraw/TerraDrawProvider"
import { TerraDrawToolbar } from "@/src/core/components/Map/TerraDraw/TerraDrawToolbar"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
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
  displayedGeometry?: SupportedGeometry
  showHint?: boolean
  syncTransformedGeometryToMap?: boolean
  hideUnselectedPolygonOutline?: boolean
  transformGeometry?: (
    geometry: SupportedGeometry | null,
    geometryType: string | null,
  ) => {
    geometry: SupportedGeometry | null
    geometryType: string | null
  }
}

export const GeometryDrawingMap = ({
  allowedTypes,
  subsection,
  children,
  displayedGeometry,
  showHint = true,
  syncTransformedGeometryToMap = true,
  hideUnselectedPolygonOutline = false,
  transformGeometry,
}: Props) => {
  const { watch, setValue } = useFormContext()
  const geometry = watch("geometry") as SupportedGeometry | undefined
  const geometryForMap = displayedGeometry ?? geometry
  const updateTerraDrawRef = useRef<
    ((geometry: SupportedGeometry | null, ignoreChangeEvents?: boolean) => void) | null
  >(null)
  const projectSlug = useProjectSlug()
  const showPoint = allowedTypes.includes("point")
  const showLine = allowedTypes.includes("line")
  const showPolygon = allowedTypes.includes("polygon")

  // Calculate initial view bounds (priority order):
  // 1. If geometry exists (editing mode): use geometry bounds
  // 2. Else if subsection provided: use subsection bounds
  // 3. Otherwise: undefined (will use default view)
  const initialViewState = useMemo(() => {
    let targetGeometry: SupportedGeometry | undefined

    if (geometryForMap) {
      targetGeometry = geometryForMap
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
  }, [geometryForMap, subsection])

  const defaultViewState = {
    longitude: 13.404954,
    latitude: 52.520008,
    zoom: 11,
  }

  const handleChange = (geo: SupportedGeometry | null, geoType: string | null) => {
    const resetToCurrentPolygonShell =
      allowedTypes.length === 1 &&
      allowedTypes[0] === "polygon" &&
      geo &&
      geoType !== "Polygon" &&
      geoType !== "MultiPolygon"

    if (resetToCurrentPolygonShell) {
      updateTerraDrawRef.current?.(geometryForMap ?? null, true)
      return
    }

    const nextState = transformGeometry
      ? transformGeometry(geo, geoType)
      : { geometry: geo, geometryType: geoType }

    if (
      syncTransformedGeometryToMap &&
      nextState.geometry !== geo &&
      JSON.stringify(nextState.geometry) !== JSON.stringify(geo)
    ) {
      updateTerraDrawRef.current?.(nextState.geometry, true)
    }

    if (nextState.geometry && nextState.geometryType) {
      setValue("geometry", nextState.geometry, { shouldValidate: true })
      setValue("type", mapGeoTypeToEnum(nextState.geometryType), { shouldValidate: true })
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
        staticOverlay={getStaticOverlayForProject(projectSlug)}
      >
        {children}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2.5">
          <TerraDrawProvider
            initialGeometry={geometryForMap}
            onChange={handleChange}
            modeConfig={{ hideUnselectedPolygonOutline }}
          >
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
          {showHint ? <TerraDrawHint /> : null}
        </div>
      </BaseMap>
    </div>
  )
}
