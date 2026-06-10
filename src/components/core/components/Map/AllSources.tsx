import { Source } from "react-map-gl/maplibre"
import type { MapData } from "./mapDataTypes"
import { MapSourceType } from "./mapDataTypes"
import { isMapTestMode } from "./mapStyleConfig"

type Props = { mapData: Pick<MapData, "sources"> }

export const AllSources = ({ mapData }: Props) => {
  // PMTiles and remote GeoJSON overlays hit tilda-geo.de; skip in E2E to keep tests offline.
  if (isMapTestMode()) return null

  const sources = Object.values(mapData.sources)

  return (
    <>
      {sources.map(({ tildaUrl, type }) => {
        if (type === MapSourceType.geojson) {
          return <Source key={tildaUrl} id={tildaUrl} type="geojson" data={`${tildaUrl}.geojson`} />
        }
        return <Source key={tildaUrl} id={tildaUrl} type="vector" url={`pmtiles://${tildaUrl}`} />
      })}
    </>
  )
}
