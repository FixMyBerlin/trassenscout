import { Layer, Source } from "react-map-gl/maplibre"
import {
  TILDA_INFRA_ANCHOR_LAYER_ID,
  TILDA_INFRA_ATTRIBUTION,
  TILDA_INFRA_FULL_TAGS_MIN_ZOOM,
  TILDA_INFRA_HIT_LAYER_ID,
  TILDA_INFRA_LAYER_ID,
  TILDA_INFRA_LINE,
  TILDA_INFRA_SOURCE_ID,
  TILDA_INFRA_SOURCE_LAYER,
  TILDA_INFRA_TILES_URL,
} from "./tildaInfra.const"

type Props = { visible: boolean; interactive: boolean }

export const TildaInfraLayer = ({ visible, interactive }: Props) => {
  // The tiles come from tilda-geo.de; skip them in E2E like StaticOverlay.
  if (import.meta.env.VITE_PLAYWRIGHT_ENABLED === "true") return null

  const visibility = visible ? "visible" : "none"

  return (
    <>
      {/* Needs no source, so it is added before every Trassenscout layer */}
      <Layer id={TILDA_INFRA_ANCHOR_LAYER_ID} type="background" layout={{ visibility: "none" }} />
      <Source
        id={TILDA_INFRA_SOURCE_ID}
        type="vector"
        tiles={[TILDA_INFRA_TILES_URL]}
        minzoom={4}
        maxzoom={14}
        promoteId="id"
        attribution={TILDA_INFRA_ATTRIBUTION}
      />
      <Layer
        id={TILDA_INFRA_LAYER_ID}
        beforeId={TILDA_INFRA_ANCHOR_LAYER_ID}
        type="line"
        source={TILDA_INFRA_SOURCE_ID}
        source-layer={TILDA_INFRA_SOURCE_LAYER}
        layout={{ visibility }}
        paint={{
          "line-color": TILDA_INFRA_LINE.color,
          "line-width": TILDA_INFRA_LINE.width,
          "line-dasharray": TILDA_INFRA_LINE.dasharray,
        }}
      />
      {interactive && (
        <Layer
          id={TILDA_INFRA_HIT_LAYER_ID}
          beforeId={TILDA_INFRA_ANCHOR_LAYER_ID}
          type="line"
          source={TILDA_INFRA_SOURCE_ID}
          source-layer={TILDA_INFRA_SOURCE_LAYER}
          minzoom={TILDA_INFRA_FULL_TAGS_MIN_ZOOM}
          layout={{ visibility }}
          paint={{ "line-width": 12, "line-opacity": 0 }}
        />
      )}
    </>
  )
}
