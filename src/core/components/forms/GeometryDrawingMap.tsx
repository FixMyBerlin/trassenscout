import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { getStaticOverlayForProject } from "@/src/core/components/Map/staticOverlay/getStaticOverlayForProject"
import { TerraDrawHint } from "@/src/core/components/Map/TerraDraw/TerraDrawHint"
import { TerraDrawProvider } from "@/src/core/components/Map/TerraDraw/TerraDrawProvider"
import { TerraDrawToolbar } from "@/src/core/components/Map/TerraDraw/TerraDrawToolbar"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import type { FormApi } from "@/src/core/components/forms/types"
import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { mapGeoTypeToEnum } from "@/src/server/shared/utils/mapGeoTypeToEnum"
import { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import { bbox } from "@turf/turf"
import { useMemo, useRef } from "react"
import type { LngLatBoundsLike } from "react-map-gl/maplibre"

type AllowedType = "point" | "line" | "polygon"

type Props = {
  form: FormApi<Record<string, unknown>>
  allowedTypes: AllowedType[]
  subsection?: TGetSubsection
  children?: React.ReactNode
}

function GeometryDrawingMapBody({
  form,
  allowedTypes,
  subsection,
  children,
  geometry,
}: Props & { geometry: SupportedGeometry | undefined }) {
  const updateTerraDrawRef = useRef<
    ((geometry: SupportedGeometry | null, ignoreChangeEvents?: boolean) => void) | null
  >(null)
  const projectSlug = useProjectSlug()
  const showPoint = allowedTypes.includes("point")
  const showLine = allowedTypes.includes("line")
  const showPolygon = allowedTypes.includes("polygon")

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
      form.setFieldValue("geometry" as never, geo as never)
      form.setFieldValue("type" as never, mapGeoTypeToEnum(geoType) as never)
    } else {
      form.setFieldValue("geometry" as never, undefined as never)
      form.setFieldValue("type" as never, undefined as never)
    }
  }

  return (
    <div className="relative h-[500px] w-full overflow-clip rounded-md border border-gray-200">
      <BaseMap
        id="terra-draw-map"
        reuseMaps={false}
        initialViewState={initialViewState || defaultViewState}
        backgroundSwitcherPosition="bottom-left"
        colorSchema="subsection"
        staticOverlay={getStaticOverlayForProject(projectSlug)}
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
                  trailingButtons={null}
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

export const GeometryDrawingMap = ({ form, allowedTypes, subsection, children }: Props) => {
  return (
    <form.Subscribe selector={(s) => s.values.geometry as SupportedGeometry | undefined}>
      {(geometry) => (
        <GeometryDrawingMapBody
          form={form}
          allowedTypes={allowedTypes}
          subsection={subsection}
          geometry={geometry}
        >
          {children}
        </GeometryDrawingMapBody>
      )}
    </form.Subscribe>
  )
}
