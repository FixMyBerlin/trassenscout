import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { Marker } from "react-map-gl/maplibre"
import { shortTitle } from "../../text"
import { SubsectionMapIcon } from "../Icons"
import { StartEndLabel } from "../Labels"
import { TipMarker } from "../TipMarker"
import { getCenterOfMass } from "../utils/getCenterOfMass"

type Props = {
  subsections: TSubsections
  hoveredMarker: string | null
  hoveredMap: string | null
  zoom: number | null
  onSelect: (props: { subsectionSlug: string; edit: boolean }) => void
  onMarkerHover: (slug: string | null) => void
}

const expandByZoom = (zoom: number | null) => !!zoom && zoom < 13

export const SubsectionMarkers = ({
  subsections,
  hoveredMarker,
  hoveredMap,
  zoom,
  onSelect,
  onMarkerHover,
}: Props) => {
  return (
    <>
      {subsections.map((sub) => {
        const [longitude, latitude] = getCenterOfMass(sub.geometry)

        return (
          <Marker
            key={sub.id}
            longitude={longitude as number}
            latitude={latitude as number}
            anchor="center"
            onClick={(e) => onSelect({ subsectionSlug: sub.slug, edit: e.originalEvent.altKey })}
          >
            <TipMarker
              anchor={sub.labelPos}
              onMouseEnter={() => onMarkerHover(sub.slug)}
              onMouseLeave={() => onMarkerHover(null)}
            >
              <StartEndLabel
                icon={<SubsectionMapIcon label={shortTitle(sub.slug)} />}
                subIcon={sub.operator?.slug}
                start={sub.start}
                end={sub.end}
                layout={
                  expandByZoom(zoom) && !(sub.slug === hoveredMarker || sub.slug === hoveredMap)
                    ? "compact"
                    : "details"
                }
              />
            </TipMarker>
          </Marker>
        )
      })}
    </>
  )
}
