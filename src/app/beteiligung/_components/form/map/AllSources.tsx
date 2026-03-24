import { MapData, MapSourceType } from "@/src/app/beteiligung/_shared/types"
import { Source } from "react-map-gl/maplibre"

type Props = { mapData: MapData }

export const AllSources = ({ mapData }: Props) => {
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
