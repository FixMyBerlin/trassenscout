import { Source } from "react-map-gl/maplibre"
import type { MapData } from "./mapDataTypes"
import { mapSourceFromExternalUrl } from "./mapSourceFromExternalUrl"

type Props = { mapData: Pick<MapData, "sources"> }

export const AllSources = ({ mapData }: Props) => {
  return (
    <>
      {Object.entries(mapData.sources).map(([sourceId, { externalUrl, type, promoteId }]) => {
        const sourceProps = mapSourceFromExternalUrl(sourceId, externalUrl, type, promoteId)
        return <Source key={sourceProps.id} {...sourceProps} />
      })}
    </>
  )
}
