"use client"

import { useAcquisitionAreaSelection } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/_components/useAcquisitionAreaSelection.nuqs"

import { acquisitionAreaStatusStyles } from "@/src/app/(loggedInProjects)/[projectSlug]/acquisition-area-status/_utils/acquisitionAreaStatusStyles"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { subsectionColors } from "@/src/core/components/Map/colors/subsectionColors"
import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import { MapFooter } from "@/src/core/components/Map/MapFooter"
import { getStaticOverlayForProject } from "@/src/core/components/Map/staticOverlay/getStaticOverlayForProject"
import { subsectionLegendConfig } from "@/src/core/components/Map/SubsectionSubsubsectionMap.legendConfig"
import { geometriesBbox } from "@/src/core/components/Map/utils/bboxHelpers"
import { getSubsubsectionFeatures } from "@/src/core/components/Map/utils/getSubsubsectionFeatures"
import { polygonToGeoJSON } from "@/src/core/components/Map/utils/polygonToGeoJSON"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getAcquisitionAreasBySubsubsection, {
  type AcquisitionAreaWithTypedGeometry,
} from "@/src/server/acquisitionAreas/queries/getAcquisitionAreasBySubsubsection"
import type { TAcquisitionAreaGeometrySchema } from "@/src/server/acquisitionAreas/schema"
import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import type {
  SubsubsectionWithPosition,
  TGetSubsubsection,
} from "@/src/server/subsubsections/queries/getSubsubsection"
import { useQuery } from "@blitzjs/rpc"
import { feature, featureCollection } from "@turf/helpers"
import type { MultiPolygon, Polygon } from "geojson"
import type { ExpressionSpecification, MapLayerMouseEvent } from "maplibre-gl"
import { useMemo } from "react"
import { Layer, Source } from "react-map-gl/maplibre"
import type { SubsubsectionTabKey } from "./SubsubsectionDashboardClient"

const acquisitionAreaColorExpression: ExpressionSpecification = [
  "match",
  ["coalesce", ["get", "statusStyle"], 1],
  2,
  acquisitionAreaStatusStyles[2].color,
  3,
  acquisitionAreaStatusStyles[3].color,
  acquisitionAreaStatusStyles[1].color,
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
  const { acquisitionAreaId, setAcquisitionAreaId } = useAcquisitionAreaSelection()
  const isLandAcquisition = activeTab === "land-acquisition"

  const [acquisitionAreas = []] = useQuery(
    getAcquisitionAreasBySubsubsection,
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

  const selectedAcquisitionAreas = useMemo(
    () => acquisitionAreas.filter((acquisitionArea) => acquisitionArea.id === acquisitionAreaId),
    [acquisitionAreaId, acquisitionAreas],
  )

  const unselectedAcquisitionAreas = useMemo(
    () => acquisitionAreas.filter((acquisitionArea) => acquisitionArea.id !== acquisitionAreaId),
    [acquisitionAreaId, acquisitionAreas],
  )

  const toAcquisitionAreaFeatureCollection = (areas: AcquisitionAreaWithTypedGeometry[]) =>
    featureCollection(
      areas.flatMap((acquisitionArea) =>
        polygonToGeoJSON(acquisitionArea.geometry as TAcquisitionAreaGeometrySchema, {
          acquisitionAreaId: acquisitionArea.id,
          statusStyle: acquisitionArea.acquisitionAreaStatus?.style ?? 1,
        }).map((item, index) =>
          feature(item.geometry, {
            ...item.properties,
            featureId: `acquisition-area-${acquisitionArea.id}-${index}`,
          }),
        ),
      ),
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
            featureId: `acquisition-area-parcel-${acquisitionArea.parcel.id}`,
          }),
        ),
      ),
    [acquisitionAreas],
  )

  const mapBbox = useMemo(() => {
    const geometries: SupportedGeometry[] = [subsubsection.geometry as SupportedGeometry]
    if (isLandAcquisition) {
      acquisitionAreas.forEach((acquisitionArea) => {
        geometries.push(acquisitionArea.geometry as SupportedGeometry)
      })
    }
    return geometriesBbox(geometries)
  }, [acquisitionAreas, isLandAcquisition, subsubsection.geometry])

  const handleClickMap = (event: MapLayerMouseEvent) => {
    if (!isLandAcquisition) return

    const clickedAcquisitionAreaId = Number(event.features?.at(0)?.properties?.acquisitionAreaId)
    if (!Number.isFinite(clickedAcquisitionAreaId)) return

    void setAcquisitionAreaId(clickedAcquisitionAreaId)
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
            ? ["acquisition-area-click-target-unselected", "acquisition-area-click-target-selected"]
            : undefined
        }
        lines={subsubsectionLines?.features.length ? subsubsectionLines : undefined}
        polygons={subsubsectionPolygons?.features.length ? subsubsectionPolygons : undefined}
        points={subsubsectionPoints?.features.length ? subsubsectionPoints : undefined}
        lineEndPoints={
          subsubsectionLineEndPoints?.features.length ? subsubsectionLineEndPoints : undefined
        }
        selectableLayerIdSuffix="_subsubsection_detail"
        interactiveUnifiedFeatures={!isLandAcquisition}
        colorSchema="subsubsection"
        staticOverlay={getStaticOverlayForProject(projectSlug)}
      >
        {isLandAcquisition && (
          <>
            <Source id="acquisition-area-parcels" type="geojson" data={parcelFeatureCollection}>
              <Layer
                id="acquisition-area-parcels-fill"
                type="fill"
                paint={{
                  "fill-color": subsectionColors.hull.current,
                  "fill-opacity": 0.05,
                }}
              />
              <Layer
                id="acquisition-area-parcels-outline"
                type="line"
                paint={{
                  "line-color": subsectionColors.hull.current,
                  "line-width": 2,
                  "line-opacity": 0.3,
                }}
              />
            </Source>

            <Source
              id="acquisition-area-unselected"
              type="geojson"
              data={unselectedAcquisitionAreasFc}
            >
              <Layer
                id="acquisition-area-fill-unselected"
                type="fill"
                paint={{
                  "fill-color": acquisitionAreaColorExpression,
                  "fill-opacity": 0.32,
                }}
              />
              <Layer
                id="acquisition-area-line-unselected"
                type="line"
                paint={{
                  "line-color": acquisitionAreaColorExpression,
                  "line-width": 2,
                  "line-opacity": 0.9,
                }}
              />
              <Layer
                id="acquisition-area-click-target-unselected"
                type="fill"
                paint={{ "fill-opacity": 0 }}
              />
            </Source>

            <Source id="acquisition-area-selected" type="geojson" data={selectedAcquisitionAreasFc}>
              <Layer
                id="acquisition-area-fill-selected"
                type="fill"
                paint={{
                  "fill-color": subsubsectionColors.polygon.selected,
                  "fill-opacity": 0.38,
                }}
              />
              <Layer
                id="acquisition-area-line-selected"
                type="line"
                paint={{
                  "line-color": subsubsectionColors.polygon.selected,
                  "line-width": 3,
                  "line-opacity": 1,
                }}
              />
              <Layer
                id="acquisition-area-click-target-selected"
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
