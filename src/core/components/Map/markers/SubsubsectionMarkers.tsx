import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { Marker } from "react-map-gl/maplibre"
import { shortTitle } from "../../text"
import { SubsubsectionMapIcon } from "../Icons"
import { TitleLabel } from "../Labels"
import { TipMarker } from "../TipMarker"
import { getCenterOfMass } from "../utils/getCenterOfMass"

type Props = {
  subsubsections: SubsubsectionWithPosition[]
  pageSubsectionSlug: string | null
  onSelect: (props: { subsectionSlug: string; subsubsectionSlug: string; edit: boolean }) => void
  onMarkerHover: (slug: string | number | null) => void
}

export const SubsubsectionMarkers = ({
  subsubsections,
  pageSubsectionSlug,
  onSelect,
  onMarkerHover,
}: Props) => {
  return (
    <>
      {subsubsections.map((subsub) => {
        const [longitude, latitude] = getCenterOfMass(subsub.geometry)

        return (
          <Marker
            key={subsub.id}
            longitude={longitude as number}
            latitude={latitude as number}
            anchor="center"
            onClick={(e) => {
              onSelect({
                subsectionSlug: subsub.subsection.slug,
                subsubsectionSlug: subsub.slug,
                edit: e.originalEvent.altKey,
              })
            }}
          >
            <TipMarker
              anchor={subsub.labelPos}
              onMouseEnter={() => onMarkerHover(subsub.slug)}
              onMouseLeave={() => onMarkerHover(null)}
              className={
                subsub.subsection.slug === pageSubsectionSlug
                  ? "opacity-100"
                  : "opacity-50 hover:opacity-100"
              }
            >
              <TitleLabel
                icon={<SubsubsectionMapIcon label={shortTitle(subsub.slug)} />}
                subtitle={subsub.SubsubsectionTask?.title}
              />
            </TipMarker>
          </Marker>
        )
      })}
    </>
  )
}
