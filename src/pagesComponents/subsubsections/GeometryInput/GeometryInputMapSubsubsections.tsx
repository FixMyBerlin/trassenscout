import { layerColors } from "@/src/core/components/Map/layerColors"
import { lineStringToGeoJSON } from "@/src/core/components/Map/utils/lineStringToGeoJSON"
import { pointToGeoJSON } from "@/src/core/components/Map/utils/pointToGeoJSON"
import { polygonToGeoJSON } from "@/src/core/components/Map/utils/polygonToGeoJSON"
import { useSlug } from "@/src/core/routes/usePagesDirectorySlug"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { useQuery } from "@blitzjs/rpc"
import { featureCollection } from "@turf/helpers"
import { Layer, Source } from "react-map-gl/maplibre"

export const GeometryInputMapSubsubsections = () => {
  // We render all other subsubsections data to give context for the user
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()
  const [{ subsubsections }] = useQuery(getSubsubsections, {
    projectSlug,
    subsectionSlug: subsectionSlug!,
  })

  const subsubsectionLineFeatures = featureCollection(
    subsubsections
      .filter((sub) => sub.slug !== subsubsectionSlug)
      .filter((sub) => sub.type === "LINE")
      .flatMap((sub) => {
        return lineStringToGeoJSON(sub.geometry, { name: sub.slug })
      })
      .filter(Boolean),
  )
  const subsubsectionPointFeatures = featureCollection(
    subsubsections
      .filter((sub) => sub.slug !== subsubsectionSlug)
      .filter((sub) => sub.type === "POINT")
      .map((sub) => {
        return pointToGeoJSON(sub.geometry, { name: sub.slug })
      })
      .filter(Boolean),
  )
  const subsubsectionPolygonFeatures = featureCollection(
    subsubsections
      .filter((sub) => sub.slug !== subsubsectionSlug)
      .filter((sub) => sub.type === "POLYGON")
      .flatMap((sub) => {
        return polygonToGeoJSON(sub.geometry, { name: sub.slug })
      })
      .filter(Boolean),
  )

  return (
    <>
      <Source
        id="otherSubsubsectionsLine"
        key="otherSubsubsectionsLine"
        type="geojson"
        data={subsubsectionLineFeatures}
      />
      <Layer
        id="otherSubsubsectionsLine-layer"
        key="otherSubsubsectionsLine-layer"
        source="otherSubsubsectionsLine"
        type="line"
        paint={{
          "line-width": 4,
          "line-color": layerColors.unselectable,
        }}
      />
      <Layer
        id="otherSubsubsectionsLineLabel-layer"
        key="otherSubsubsectionsLineLabel-layer"
        source="otherSubsubsectionsLine"
        type="symbol"
        layout={{
          "text-field": ["get", "name"],
          "text-size": 14,
          "text-anchor": "center",
          "symbol-placement": "line",
          "text-transform": "uppercase",
        }}
        paint={{
          "text-color": "white",
          "text-halo-color": layerColors.unselectable,
          "text-halo-width": 2,
        }}
      />

      <Source
        id="otherSubsubsectionsPoints"
        key="otherSubsubsectionsPoints"
        type="geojson"
        data={subsubsectionPointFeatures}
      />
      <Layer
        id="otherSubsubsectionsPoints-layer"
        key="otherSubsubsectionsPoints-layer"
        source="otherSubsubsectionsPoints"
        type="circle"
        paint={{
          "circle-radius": 14,
          "circle-color": layerColors.unselectable,
        }}
      />
      <Layer
        id="otherSubsubsectionsPointsLabel-layer"
        key="otherSubsubsectionsPointsLabel-layer"
        source="otherSubsubsectionsPoints"
        type="symbol"
        layout={{
          "text-field": ["get", "name"],
          "text-size": 14,
          "text-anchor": "center",
          "text-offset": [0.1, 0],
          "text-transform": "uppercase",
        }}
        paint={{
          "text-color": "white",
          "text-halo-color": layerColors.unselectable,
          "text-halo-width": 2,
        }}
      />

      <Source
        id="otherSubsubsectionsPolygon"
        key="otherSubsubsectionsPolygon"
        type="geojson"
        data={subsubsectionPolygonFeatures}
      />
      <Layer
        id="otherSubsubsectionsPolygon-fill"
        key="otherSubsubsectionsPolygon-fill"
        source="otherSubsubsectionsPolygon"
        type="fill"
        paint={{
          "fill-color": layerColors.unselectable,
          "fill-opacity": 0.2,
        }}
      />
      <Layer
        id="otherSubsubsectionsPolygon-outline"
        key="otherSubsubsectionsPolygon-outline"
        source="otherSubsubsectionsPolygon"
        type="line"
        paint={{
          "line-width": 3,
          "line-color": layerColors.unselectable,
          "line-opacity": 0.8,
        }}
      />
      <Layer
        id="otherSubsubsectionsPolygonLabel-layer"
        key="otherSubsubsectionsPolygonLabel-layer"
        source="otherSubsubsectionsPolygon"
        type="symbol"
        layout={{
          "text-field": ["get", "name"],
          "text-size": 14,
          "text-anchor": "center",
          "text-transform": "uppercase",
        }}
        paint={{
          "text-color": "white",
          "text-halo-color": layerColors.unselectable,
          "text-halo-width": 2,
        }}
      />
    </>
  )
}
