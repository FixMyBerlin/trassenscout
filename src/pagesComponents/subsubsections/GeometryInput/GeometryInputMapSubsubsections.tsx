import { layerColors } from "@/src/core/components/Map/layerColors"
import { useSlug } from "@/src/core/routes/usePagesDirectorySlug"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { useQuery } from "@blitzjs/rpc"
import { featureCollection, lineString, point } from "@turf/helpers"
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
      .map((sub) => sub.type === "ROUTE" && lineString(sub.geometry, { name: sub.slug }))
      .filter(Boolean),
  )
  const subsubsectionPointFeatures = featureCollection(
    subsubsections
      .filter((sub) => sub.slug !== subsubsectionSlug)
      .map((sub) => sub.type === "AREA" && point(sub.geometry, { name: sub.slug }))
      .filter(Boolean),
  )

  return (
    <>
      <Source key="otherSubsubsectionsLine" type="geojson" data={subsubsectionLineFeatures}>
        <Layer
          id="otherSubsubsectionsLine"
          type="line"
          paint={{
            "line-width": 4,
            "line-color": layerColors.unselectable,
          }}
        />
        <Layer
          id="otherSubsubsectionsLineLabel"
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
      </Source>
      <Source key="otherSubsubsectionsPoints" type="geojson" data={subsubsectionPointFeatures}>
        <Layer
          id="otherSubsubsectionsPoints"
          type="circle"
          paint={{
            "circle-radius": 14,
            "circle-color": layerColors.unselectable,
          }}
        />
        <Layer
          id="otherSubsubsectionsPointsLabel"
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
      </Source>
    </>
  )
}
