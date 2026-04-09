"use client"

import { useDealAreaSelection } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/_components/useDealAreaSelection.nuqs"
import { dealAreaStatusStyles } from "@/src/app/(loggedInProjects)/[projectSlug]/deal-area-status/_utils/dealAreaStatusStyles"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { MapFooter } from "@/src/core/components/Map/MapFooter"
import { getStaticOverlayForProject } from "@/src/core/components/Map/staticOverlay/getStaticOverlayForProject"
import { subsectionLegendConfig } from "@/src/core/components/Map/SubsectionSubsubsectionMap.legendConfig"
import { geometriesBbox } from "@/src/core/components/Map/utils/bboxHelpers"
import { getSubsubsectionFeatures } from "@/src/core/components/Map/utils/getSubsubsectionFeatures"
import { polygonToGeoJSON } from "@/src/core/components/Map/utils/polygonToGeoJSON"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getDealAreasBySubsubsection, {
  type DealAreaWithTypedGeometry,
} from "@/src/server/dealAreas/queries/getDealAreasBySubsubsection"
import type { TDealAreaGeometrySchema } from "@/src/server/dealAreas/schema"
import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import type {
  SubsubsectionWithPosition,
  TGetSubsubsection,
} from "@/src/server/subsubsections/queries/getSubsubsection"
import { useQuery } from "@blitzjs/rpc"
import { feature, featureCollection } from "@turf/helpers"
import type { ExpressionSpecification, MapLayerMouseEvent } from "maplibre-gl"
import { useMemo } from "react"
import { Layer, Source } from "react-map-gl/maplibre"
import type { SubsubsectionTabKey } from "./SubsubsectionDashboardClient"

const dealAreaColorExpression: ExpressionSpecification = [
  "match",
  ["coalesce", ["get", "statusStyle"], 1],
  2,
  dealAreaStatusStyles[2].color,
  3,
  dealAreaStatusStyles[3].color,
  dealAreaStatusStyles[1].color,
]

type Props = {
  subsubsection: TGetSubsubsection
  activeTab: SubsubsectionTabKey
}

const defaultQueryOptions = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
}

export const SubsubsectionPageMap = ({ subsubsection, activeTab }: Props) => {
  const projectSlug = useProjectSlug()
  const { dealAreaId, setDealAreaId } = useDealAreaSelection()
  const isLandAcquisition = activeTab === "land-acquisition"

  const [dealAreas = []] = useQuery(
    getDealAreasBySubsubsection,
    {
      projectSlug,
      subsubsectionId: subsubsection.id,
    },
    {
      enabled: isLandAcquisition,
      ...defaultQueryOptions,
    },
  )

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

  const selectedDealAreas = useMemo(
    () => dealAreas.filter((dealArea) => dealArea.id === dealAreaId),
    [dealAreaId, dealAreas],
  )

  const unselectedDealAreas = useMemo(
    () => dealAreas.filter((dealArea) => dealArea.id !== dealAreaId),
    [dealAreaId, dealAreas],
  )

  const toDealAreaFeatureCollection = (areas: DealAreaWithTypedGeometry[]) =>
    featureCollection(
      areas.flatMap((dealArea) =>
        polygonToGeoJSON(dealArea.geometry as TDealAreaGeometrySchema, {
          dealAreaId: dealArea.id,
          statusStyle: dealArea.dealAreaStatus?.style ?? 1,
        }).map((item, index) =>
          feature(item.geometry, {
            ...item.properties,
            featureId: `deal-area-${dealArea.id}-${index}`,
          }),
        ),
      ),
    )

  const selectedDealAreasFc = useMemo(
    () => toDealAreaFeatureCollection(selectedDealAreas),
    [selectedDealAreas],
  )

  const unselectedDealAreasFc = useMemo(
    () => toDealAreaFeatureCollection(unselectedDealAreas),
    [unselectedDealAreas],
  )

  const mapBbox = useMemo(() => {
    const geometries: SupportedGeometry[] = [subsubsection.geometry as SupportedGeometry]
    if (isLandAcquisition) {
      dealAreas.forEach((dealArea) => {
        geometries.push(dealArea.geometry as SupportedGeometry)
      })
    }
    return geometriesBbox(geometries)
  }, [dealAreas, isLandAcquisition, subsubsection.geometry])

  const handleClickMap = (event: MapLayerMouseEvent) => {
    if (!isLandAcquisition) return

    const clickedDealAreaId = Number(event.features?.at(0)?.properties?.dealAreaId)
    if (!Number.isFinite(clickedDealAreaId)) return

    void setDealAreaId(clickedDealAreaId)
  }

  return (
    <>
      <BaseMap
        id="subsubsection-page-map"
        initialViewState={{
          bounds: mapBbox,
          fitBoundsOptions: { padding: 60, maxZoom: 16 },
        }}
        onClick={handleClickMap}
        interactiveLayerIds={
          isLandAcquisition
            ? ["deal-area-click-target-unselected", "deal-area-click-target-selected"]
            : undefined
        }
        lines={subsubsectionLines?.features.length ? subsubsectionLines : undefined}
        polygons={subsubsectionPolygons?.features.length ? subsubsectionPolygons : undefined}
        points={subsubsectionPoints?.features.length ? subsubsectionPoints : undefined}
        lineEndPoints={
          subsubsectionLineEndPoints?.features.length ? subsubsectionLineEndPoints : undefined
        }
        selectableLayerIdSuffix="_subsubsection_detail"
        colorSchema="subsubsection"
        staticOverlay={getStaticOverlayForProject(projectSlug)}
      >
        {isLandAcquisition && (
          <>
            <Source id="deal-area-unselected" type="geojson" data={unselectedDealAreasFc}>
              <Layer
                id="deal-area-fill-unselected"
                type="fill"
                paint={{
                  "fill-color": dealAreaColorExpression,
                  "fill-opacity": 0.32,
                }}
              />
              <Layer
                id="deal-area-line-unselected"
                type="line"
                paint={{
                  "line-color": dealAreaColorExpression,
                  "line-width": 2,
                  "line-opacity": 0.9,
                }}
              />
              <Layer
                id="deal-area-click-target-unselected"
                type="fill"
                paint={{ "fill-opacity": 0 }}
              />
            </Source>

            <Source id="deal-area-selected" type="geojson" data={selectedDealAreasFc}>
              <Layer
                id="deal-area-fill-selected"
                type="fill"
                paint={{
                  "fill-color": "#dc2626",
                  "fill-opacity": 0.38,
                }}
              />
              <Layer
                id="deal-area-line-selected"
                type="line"
                paint={{
                  "line-color": "#dc2626",
                  "line-width": 3,
                  "line-opacity": 1,
                }}
              />
              <Layer
                id="deal-area-click-target-selected"
                type="fill"
                paint={{ "fill-opacity": 0 }}
              />
            </Source>
          </>
        )}
      </BaseMap>
      <MapFooter legendItemsConfig={subsectionLegendConfig} />
    </>
  )
}
