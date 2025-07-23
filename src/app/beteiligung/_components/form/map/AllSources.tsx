import { MapData } from "@/src/app/beteiligung/_shared/types"
import { Source } from "react-map-gl/maplibre"

type Props = { mapData: MapData }

export const AllSources = ({ mapData }: Props) => {
  const sourceUrls = Object.values(mapData.sources)
    .map((source) => source.pmTilesUrl)
    .flat()

  return (
    <>
      {sourceUrls.map((sourceUrl) => {
        return (
          <Source id={sourceUrl} key={sourceUrl} type="vector" url={`pmtiles://${sourceUrl}`} />
        )
      })}
    </>
  )
}
