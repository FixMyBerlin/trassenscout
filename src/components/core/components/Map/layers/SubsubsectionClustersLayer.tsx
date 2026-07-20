import type { FeatureCollection, Point } from "geojson"
import { Layer, Source } from "react-map-gl/maplibre"
import { mapColorTokens } from "@/src/components/core/components/Map/colors/mapColorTokens"

export const SUBSUBSECTION_CLUSTER_SOURCE_ID = "subsubsection-clusters"
export const SUBSUBSECTION_CLUSTER_MAX_ZOOM = 18
const SUBSUBSECTION_CLUSTER_CIRCLE_LAYER_ID = "subsubsection-cluster-circles"
const SUBSUBSECTION_CLUSTER_COUNT_LAYER_ID = "subsubsection-cluster-counts"
const SUBSUBSECTION_UNCLUSTERED_LAYER_ID = "subsubsection-unclustered-points"

/** Layer ids the map must treat as click targets while the cluster layers are visible. */
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
