import type { FeatureCollection, Point } from "geojson"
import { Layer, Source } from "react-map-gl/maplibre"
import { mapColorTokens } from "@/src/components/core/components/Map/colors/mapColorTokens"

export const SUBSUBSECTION_CLUSTER_SOURCE_ID = "subsubsection-clusters"
export const SUBSUBSECTION_CLUSTER_MAX_ZOOM = 18
const SUBSUBSECTION_CLUSTER_CIRCLE_LAYER_ID = "subsubsection-cluster-circles"
const SUBSUBSECTION_CLUSTER_COUNT_LAYER_ID = "subsubsection-cluster-counts"
const SUBSUBSECTION_UNCLUSTERED_LAYER_ID = "subsubsection-unclustered-points"

/**
 * Click targets while clustering is visible: the cluster blobs (click to expand)
 * and the location dot under each ungrouped point. The dot's styled tooltip is a
 * DOM SubsubsectionMarker rendered by the caller on top, but the dot stays
 * clickable for the area of it the bubble doesn't cover.
 */
export const SUBSUBSECTION_CLUSTER_INTERACTIVE_LAYER_IDS = [
  SUBSUBSECTION_CLUSTER_CIRCLE_LAYER_ID,
  SUBSUBSECTION_CLUSTER_COUNT_LAYER_ID,
  SUBSUBSECTION_UNCLUSTERED_LAYER_ID,
]

type SubsubsectionClusterProperties = {
  subsectionSlug: string
  subsubsectionSlug: string
}

type Props = {
  points: FeatureCollection<Point, SubsubsectionClusterProperties> | undefined
}

/**
 * Renders the cluster source and the grouped-point blobs only. Points that are
 * NOT grouped at the current zoom carry no canvas layer here — the caller reads
 * them off this source and renders DOM markers instead (see SubsubsectionMap).
 */
export function SubsubsectionClustersLayer({ points }: Props) {
  if (!points || points.features.length === 0) return null

  return (
    <>
      <Source
        id={SUBSUBSECTION_CLUSTER_SOURCE_ID}
        type="geojson"
        data={points}
        cluster={true}
        clusterMaxZoom={SUBSUBSECTION_CLUSTER_MAX_ZOOM}
        clusterRadius={64}
      />
      <Layer
        id={SUBSUBSECTION_CLUSTER_CIRCLE_LAYER_ID}
        type="circle"
        source={SUBSUBSECTION_CLUSTER_SOURCE_ID}
        filter={["has", "point_count"]}
        paint={{
          "circle-color": mapColorTokens.sky400,
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 18, 25, 21],
          "circle-stroke-color": mapColorTokens.sky400,
          "circle-stroke-width": 3,
          "circle-opacity": 0.6,
        }}
      />
      <Layer
        id={SUBSUBSECTION_CLUSTER_COUNT_LAYER_ID}
        type="symbol"
        source={SUBSUBSECTION_CLUSTER_SOURCE_ID}
        filter={["has", "point_count"]}
        layout={{
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Red Hat Text Regular", "Arial Unicode MS Regular"],
          "text-size": 12,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        }}
        paint={{
          "text-color": mapColorTokens.slate900,
        }}
      />
      {/* Location dot under each ungrouped point; the caller draws the styled
          tooltip on top as a DOM SubsubsectionMarker. */}
      <Layer
        id={SUBSUBSECTION_UNCLUSTERED_LAYER_ID}
        type="circle"
        source={SUBSUBSECTION_CLUSTER_SOURCE_ID}
        filter={["!", ["has", "point_count"]]}
        paint={{
          "circle-color": mapColorTokens.sky400,
          "circle-radius": 10,
          "circle-stroke-color": mapColorTokens.sky400,
          "circle-stroke-width": 3,
          "circle-opacity": 0.3,
        }}
      />
    </>
  )
}
