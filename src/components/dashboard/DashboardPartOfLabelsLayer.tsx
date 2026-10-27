import type { FeatureCollection, Point } from "geojson"
import { Layer, Source } from "react-map-gl/maplibre"
import { mapColorTokens } from "@/src/components/core/components/Map/colors/mapColorTokens"
import { subsectionColors } from "@/src/components/core/components/Map/colors/subsectionColors"
import type { PartOfLabelProperties } from "@/src/shared/dashboard/partOfLabels"

const SOURCE_ID = "dashboard-part-of-labels"
// Hidden in the zoomed-out overview, where the labels of neighbouring projects overlap.
const PART_OF_LABEL_MIN_ZOOM = 8

type Props = {
  labels: FeatureCollection<Point, PartOfLabelProperties>
}

export const DashboardPartOfLabelsLayer = ({ labels }: Props) => {
  if (labels.features.length === 0) return null

  return (
    <>
      <Source id={SOURCE_ID} type="geojson" data={labels} />
      <Layer
        id={SOURCE_ID}
        type="symbol"
        source={SOURCE_ID}
        minzoom={PART_OF_LABEL_MIN_ZOOM}
        layout={{
          "text-field": ["get", "label"],
          "text-font": ["Red Hat Text Regular", "Arial Unicode MS Regular"],
          "text-size": 12,
          "text-rotate": ["get", "rotate"],
          "text-rotation-alignment": "map",
          "text-offset": [0, 1.2],
        }}
        paint={{
          "text-color": subsectionColors.line.current,
          "text-halo-color": mapColorTokens.white,
          "text-halo-width": 1.5,
        }}
      />
    </>
  )
}
