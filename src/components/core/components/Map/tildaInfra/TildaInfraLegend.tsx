import { ArrowUpRightIcon, InformationCircleIcon } from "@heroicons/react/20/solid"
import { useMap } from "react-map-gl/maplibre"
import { twJoin } from "tailwind-merge"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { getTildaInfraUrl } from "./getTildaInfraUrl"
import { useTildaInfraLayerVisible } from "./tilda-infra-layer-store"
import { TILDA_INFRA_INFO_TEXT, TILDA_INFRA_LABEL, TILDA_INFRA_LINE } from "./tildaInfra.const"

type Props = {
  // Without a map id (no MapProvider) there is no view to link to
  mapId?: string
}

export const TildaInfraLegend = ({ mapId }: Props) => {
  const visible = useTildaInfraLayerVisible()
  const maps = useMap()
  if (!visible) return null

  const openTilda = () => {
    const map = mapId ? maps[mapId] : undefined
    if (!map) return
    const { lat, lng } = map.getCenter()
    window.open(getTildaInfraUrl({ zoom: map.getZoom(), lat, lng }), "_blank", "noopener")
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <svg width="32" height="6" aria-hidden="true">
          <line
            x1="0"
            y1="3"
            x2="32"
            y2="3"
            stroke={TILDA_INFRA_LINE.color}
            strokeWidth={TILDA_INFRA_LINE.width}
            strokeDasharray={TILDA_INFRA_LINE.dasharray
              .map((length) => length * TILDA_INFRA_LINE.width)
              .join(" ")}
          />
        </svg>
        <p>{TILDA_INFRA_LABEL}</p>
      </div>
      {mapId && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openTilda}
            className={twJoin(linkStyles, "flex items-center gap-1")}
          >
            <ArrowUpRightIcon className="size-3" aria-hidden="true" />
            In TILDA ansehen
          </button>
          <Tooltip content={TILDA_INFRA_INFO_TEXT}>
            <button
              type="button"
              aria-label={TILDA_INFRA_INFO_TEXT}
              className="text-gray-500 hover:text-gray-700"
            >
              <InformationCircleIcon className="size-4" aria-hidden="true" />
            </button>
          </Tooltip>
        </div>
      )}
    </>
  )
}
