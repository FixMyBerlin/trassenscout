import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { feature, featureCollection } from "@turf/helpers"
import type { MultiPolygon, Polygon } from "geojson"
import type { ExpressionSpecification, MapLayerMouseEvent } from "maplibre-gl"
import { useMemo } from "react"
import { Layer, Source } from "react-map-gl/maplibre"
import {
  ACQUISITION_AREA_PARCEL_SOURCE_ID,
  ACQUISITION_AREA_SELECTED_SOURCE_ID,
  ACQUISITION_AREA_UNSELECTED_SOURCE_ID,
  useAcquisitionAreaMapHover,
} from "@/src/components/abschnitte/useAcquisitionAreaMapHover"
import { useAcquisitionAreaSelection } from "@/src/components/abschnitte/useAcquisitionAreaSelection"
import {
  ACQUISITION_AREA_FIT_BOUNDS_OPTIONS,
  ACQUISITION_AREA_OVERVIEW_FIT_BOUNDS_OPTIONS,
  fitMapToAcquisitionArea,
  SUBSUBSECTION_LAND_ACQUISITION_MAP_ID,
} from "@/src/components/abschnitte/utils/landAcquisitionMapCamera"
import { lookupTableRows } from "@/src/components/abschnitte/utils/lookupTableRows"
import { acquisitionAreaStatusStyles } from "@/src/components/acquisition-area-status/acquisitionAreaStatusStyles"
import { BaseMap } from "@/src/components/core/components/Map/BaseMap"
import {
  acquisitionAreaParcelFillPaint,
  acquisitionAreaParcelLineDashPaint,
  mapHoverExpression,
} from "@/src/components/core/components/Map/colors/acquisitionAreaParcelLayerStyles"
import { mapColorTokens } from "@/src/components/core/components/Map/colors/mapColorTokens"
import { subsubsectionColors } from "@/src/components/core/components/Map/colors/subsubsectionColors"
import { getLandAcquisitionLegendConfig } from "@/src/components/core/components/Map/LandAcquisitionMap.legendConfig"
import { MapFooter } from "@/src/components/core/components/Map/MapFooter"
import { MapTooltipPopup } from "@/src/components/core/components/Map/MapTooltipPopup"
import { getStaticOverlayForProject } from "@/src/components/core/components/Map/staticOverlay/getStaticOverlayForProject"
import {
  alkisAttributionToHtml,
  useAlkisAttribution,
} from "@/src/components/core/components/Map/useAlkisAttribution"
import {
  geometriesBbox,
  geometryBbox,
} from "@/src/components/core/components/Map/utils/bboxHelpers"
import { getSubsubsectionFeatures } from "@/src/components/core/components/Map/utils/getSubsubsectionFeatures"
import { polygonToGeoJSON } from "@/src/components/core/components/Map/utils/polygonToGeoJSON"
import { acquisitionAreasBySubsubsectionQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasAbschnitteQueryOptions"
import type { AcquisitionAreaWithTypedGeometry } from "@/src/server/acquisitionAreas/types"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/types"
import type { TAcquisitionAreaGeometrySchema } from "@/src/shared/acquisitionAreas/schemas"
import type { SupportedGeometry } from "@/src/shared/geometry/geometrySchemas"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

const acquisitionAreaColorExpression: ExpressionSpecification = [
  "match",
  ["coalesce", ["get", "statusStyle"], 1],
  2,
  acquisitionAreaStatusStyles[2].color,
  3,
  acquisitionAreaStatusStyles[3].color,
  4,
  acquisitionAreaStatusStyles[4].color,
  acquisitionAreaStatusStyles[1].color,
]

/** Ocker-gelb on hover, as on Maßnahmenebene. One definition for every hoverable acquisition layer. */
const hoverColorExpression = (base: ExpressionSpecification | string): ExpressionSpecification => [
  "case",
  mapHoverExpression,
  mapColorTokens.yellow400,
  base,
]

const acquisitionAreaHoverColorExpression = hoverColorExpression(acquisitionAreaColorExpression)
const selectedAcquisitionAreaHoverColorExpression = hoverColorExpression(
  subsubsectionColors.polygon.selected,
)

type Props = {
  subsubsection: SubsubsectionWithPosition
  classHeight?: string
}

const defaultQueryOptions = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const

const toAcquisitionAreaFeatureCollection = (areas: AcquisitionAreaWithTypedGeometry[]) =>
  featureCollection(
    areas.flatMap((acquisitionArea) =>
      polygonToGeoJSON(acquisitionArea.geometry as TAcquisitionAreaGeometrySchema, {
        acquisitionAreaId: acquisitionArea.id,
        parcelId: acquisitionArea.parcel.id,
        statusStyle: acquisitionArea.acquisitionAreaStatus?.style ?? 1,
      }).map((item, index) =>
        feature(item.geometry, {
          ...item.properties,
          featureId: `acquisition-area-${acquisitionArea.id}-${index}`,
        }),
      ),
    ),
  )

export const SubsubsectionLandAcquisitionMap = ({ subsubsection, classHeight }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const alkisAttribution = useAlkisAttribution()

  const { data: acquisitionAreas } = useSuspenseQuery({
    ...acquisitionAreasBySubsubsectionQueryOptions({
      projectSlug,
      subsubsectionId: subsubsection.id,
    }),
    ...defaultQueryOptions,
  })
  const { acquisitionAreaId, setAcquisitionAreaId } = useAcquisitionAreaSelection(acquisitionAreas)
  const { data: acquisitionAreaStatusesResult } = useQuery({
    ...adminLookupRowsWithCountQueryOptions({
      projectSlug,
      table: "acquisitionAreaStatuses",
    }),
    ...defaultQueryOptions,
  })

  const {
    lines: subsubsectionLines,
    points: subsubsectionPoints,
    polygons: subsubsectionPolygons,
    lineEndPoints: subsubsectionLineEndPoints,
  } = useMemo(
    () =>
      getSubsubsectionFeatures({
        subsubsections: [subsubsection as SubsubsectionWithPosition],
        selectedSubsubsectionSlug: subsubsection.slug,
      }),
    [subsubsection],
  )

  const selectedAcquisitionAreas = useMemo(
    () => acquisitionAreas.filter((acquisitionArea) => acquisitionArea.id === acquisitionAreaId),
    [acquisitionAreaId, acquisitionAreas],
  )
  const selectedAcquisitionArea = selectedAcquisitionAreas[0]

  const unselectedAcquisitionAreas = useMemo(
    () => acquisitionAreas.filter((acquisitionArea) => acquisitionArea.id !== acquisitionAreaId),
    [acquisitionAreaId, acquisitionAreas],
  )

  const selectedAcquisitionAreasFc = useMemo(
    () => toAcquisitionAreaFeatureCollection(selectedAcquisitionAreas),
    [selectedAcquisitionAreas],
  )

  const unselectedAcquisitionAreasFc = useMemo(
    () => toAcquisitionAreaFeatureCollection(unselectedAcquisitionAreas),
    [unselectedAcquisitionAreas],
  )

  const parcelFeatureCollection = useMemo(
    () =>
      featureCollection(
        acquisitionAreas.map((acquisitionArea) =>
          feature(acquisitionArea.parcel.geometry as Polygon | MultiPolygon, {
            parcelId: acquisitionArea.parcel.id,
            acquisitionAreaId: acquisitionArea.id,
            featureId: `acquisition-area-parcel-${acquisitionArea.parcel.id}`,
          }),
        ),
      ),
    [acquisitionAreas],
  )

  const { tooltip, acquisitionAreaIdForFeature, handleMouseMove, handleMouseLeave } =
    useAcquisitionAreaMapHover({
      acquisitionAreas,
      parcelFeatures: parcelFeatureCollection,
      selectedFeatures: selectedAcquisitionAreasFc,
      unselectedFeatures: unselectedAcquisitionAreasFc,
    })

  const mapBbox = useMemo(() => {
    if (selectedAcquisitionArea) {
      return geometryBbox(selectedAcquisitionArea.geometry)
    }

    const geometries: SupportedGeometry[] = [subsubsection.geometry as SupportedGeometry]
    acquisitionAreas.forEach((acquisitionArea) => {
      geometries.push(acquisitionArea.geometry as SupportedGeometry)
    })
    return geometriesBbox(geometries)
  }, [acquisitionAreas, selectedAcquisitionArea, subsubsection.geometry])

  const landAcquisitionLegendConfig = useMemo(
    () =>
      getLandAcquisitionLegendConfig(
        lookupTableRows<{ id: number; style: number }>(
          acquisitionAreaStatusesResult as Parameters<typeof lookupTableRows>[0],
          "acquisitionAreaStatuses",
        ).map((status) => status.style),
      ),
    [acquisitionAreaStatusesResult],
  )

  const handleClickMap = (event: MapLayerMouseEvent) => {
    const clickedAcquisitionAreaId = acquisitionAreaIdForFeature(event.features?.at(0))
    if (clickedAcquisitionAreaId === null) return

    const clickedAcquisitionArea = acquisitionAreas.find(
      (acquisitionArea) => acquisitionArea.id === clickedAcquisitionAreaId,
    )
    // `event.target` is the maplibre map itself, so the fly-to needs no readiness check here:
    // the user cannot click a feature on a map that has not rendered it.
    if (clickedAcquisitionArea) {
      fitMapToAcquisitionArea(event.target, clickedAcquisitionArea.geometry as SupportedGeometry)
    }
    void setAcquisitionAreaId(clickedAcquisitionAreaId)
  }

  return (
    <section className={classHeight ? "flex min-h-0 flex-1 flex-col" : undefined}>
      <BaseMap
        id={SUBSUBSECTION_LAND_ACQUISITION_MAP_ID}
        initialViewState={{
          bounds: mapBbox,
          fitBoundsOptions: selectedAcquisitionArea
            ? ACQUISITION_AREA_FIT_BOUNDS_OPTIONS
            : ACQUISITION_AREA_OVERVIEW_FIT_BOUNDS_OPTIONS,
        }}
        onClick={handleClickMap}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        interactiveLayerIds={[
          "acquisition-area-click-target-unselected",
          "acquisition-area-click-target-selected",
          "acquisition-area-parcels-fill",
          "acquisition-area-parcels-outline",
        ]}
        lines={subsubsectionLines?.features.length ? subsubsectionLines : undefined}
        polygons={subsubsectionPolygons?.features.length ? subsubsectionPolygons : undefined}
        points={subsubsectionPoints?.features.length ? subsubsectionPoints : undefined}
        lineEndPoints={
          subsubsectionLineEndPoints?.features.length ? subsubsectionLineEndPoints : undefined
        }
        selectableLayerIdSuffix="_subsubsection_detail"
        interactiveUnifiedFeatures={false}
        colorSchema="subsubsection"
        staticOverlay={getStaticOverlayForProject(projectSlug)}
        classHeight={classHeight}
      >
        <Source
          id={ACQUISITION_AREA_PARCEL_SOURCE_ID}
          type="geojson"
          data={parcelFeatureCollection}
          attribution={alkisAttributionToHtml(alkisAttribution)}
          promoteId="featureId"
        >
          <Layer
            id="acquisition-area-parcels-fill"
            type="fill"
            paint={acquisitionAreaParcelFillPaint}
          />
          <Layer
            id="acquisition-area-parcels-outline"
            type="line"
            paint={acquisitionAreaParcelLineDashPaint}
          />
        </Source>

        <Source
          id={ACQUISITION_AREA_UNSELECTED_SOURCE_ID}
          type="geojson"
          data={unselectedAcquisitionAreasFc}
          promoteId="featureId"
        >
          <Layer
            id="acquisition-area-fill-unselected"
            type="fill"
            paint={{
              "fill-color": acquisitionAreaHoverColorExpression,
              "fill-opacity": 0.32,
            }}
          />
          <Layer
            id="acquisition-area-line-unselected"
            type="line"
            paint={{
              "line-color": acquisitionAreaHoverColorExpression,
              "line-width": ["case", mapHoverExpression, 3, 2],
              "line-opacity": 0.9,
            }}
          />
          <Layer
            id="acquisition-area-click-target-unselected"
            type="fill"
            paint={{ "fill-opacity": 0 }}
          />
        </Source>

        <Source
          id={ACQUISITION_AREA_SELECTED_SOURCE_ID}
          type="geojson"
          data={selectedAcquisitionAreasFc}
          promoteId="featureId"
        >
          <Layer
            id="acquisition-area-fill-selected"
            type="fill"
            paint={{
              "fill-color": selectedAcquisitionAreaHoverColorExpression,
              "fill-opacity": 0.38,
            }}
          />
          <Layer
            id="acquisition-area-line-selected"
            type="line"
            paint={{
              "line-color": selectedAcquisitionAreaHoverColorExpression,
              "line-width": ["case", mapHoverExpression, 4, 3],
              "line-opacity": 1,
            }}
          />
          <Layer
            id="acquisition-area-click-target-selected"
            type="fill"
            paint={{ "fill-opacity": 0 }}
          />
        </Source>

        {tooltip && (
          <MapTooltipPopup longitude={tooltip.longitude} latitude={tooltip.latitude}>
            {tooltip.content}
          </MapTooltipPopup>
        )}
      </BaseMap>
      <MapFooter legendItemsConfig={landAcquisitionLegendConfig} pinned={Boolean(classHeight)} />
    </section>
  )
}
