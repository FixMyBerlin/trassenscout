import { useFormShellState } from "@/src/core/components/forms/hooks/useFormShellState"
import { useFormValue } from "@/src/core/components/forms/hooks/useFormValue"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { GERMANY_VIEW_BOUNDS } from "@/src/core/components/Map/germanyViewBounds"
import { MapFooter } from "@/src/core/components/Map/MapFooter"
import { type LegendItemConfig } from "@/src/core/components/Map/MapLegend"
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
import type { LngLatBoundsLike } from "react-map-gl/maplibre"
import { clearImperativeFieldSubmitErrors } from "./utils/clearImperativeFieldSubmitErrors"

type AllowedType = "point" | "line" | "polygon"

type Props = {
  allowedTypes: AllowedType[]
  subsection?: TGetSubsection
  children?: React.ReactNode
  displayedGeometry?: SupportedGeometry
  showHint?: boolean
  syncTransformedGeometryToMap?: boolean
  hideUnselectedPolygonOutline?: boolean
  legendItemsConfig?: LegendItemConfig[]
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
  legendItemsConfig,
  transformGeometry,
}: Props) => {
  const { form } = useFormShellState()
  const geometry = useFormValue<SupportedGeometry | undefined>("geometry")
  const geometryForMap = displayedGeometry ?? geometry
  const updateTerraDrawRef = useRef<
    ((geometry: SupportedGeometry | null, ignoreChangeEvents?: boolean) => void) | null
  >(null)
  const projectSlug = useProjectSlug()
  const showPoint = allowedTypes.includes("point")
  const showLine = allowedTypes.includes("line")
  const showPolygon = allowedTypes.includes("polygon")

  // Priority: form/display geometry, subsection context, then Germany
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

    return {
      bounds: GERMANY_VIEW_BOUNDS,
      fitBoundsOptions: { padding: 60 },
    }
  }, [geometryForMap, subsection])

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
      form.setFieldValue("geometry", nextState.geometry)
      form.setFieldValue("type", mapGeoTypeToEnum(nextState.geometryType))
      clearImperativeFieldSubmitErrors(form, "geometry")
      clearImperativeFieldSubmitErrors(form, "type")
    } else {
      form.setFieldValue("geometry", undefined)
      form.setFieldValue("type", undefined)
    }
  }

  return (
    <div>
      <div className="relative h-[500px] w-full overflow-clip rounded-md border border-gray-200">
        <BaseMap
          id="terra-draw-map"
          // Critical to avoid a bug where the Terra Draw Geometries where hidden during navigation between pages (Subsubsection => Subsubsection/Edit)
          reuseMaps={false}
          initialViewState={initialViewState}
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
      {legendItemsConfig && <MapFooter legendItemsConfig={legendItemsConfig} />}
    </div>
  )
}
