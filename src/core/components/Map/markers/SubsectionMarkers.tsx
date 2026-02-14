import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { Marker } from "react-map-gl/maplibre"
import { shortTitle } from "../../text"
import { SubsectionMapIcon } from "../Icons"
import { StartEndLabel } from "../Labels"
import { TipMarker } from "../TipMarker"
import { getLabelPosition } from "../utils/getLabelPosition"

type Props = {
  subsections: TSubsections
  zoom: number | null
  onSelect: (props: { subsectionSlug: string; edit: boolean }) => void
}

const expandByZoom = (zoom: number | null) => !!zoom && zoom < 13

type SubsectionMarkerProps = {
  subsection: TSubsections[number]
  zoom: number | null
  onSelect: (props: { subsectionSlug: string; edit: boolean }) => void
}

const SubsectionMarker = ({ subsection, zoom, onSelect }: SubsectionMarkerProps) => {
  const [longitude, latitude] = getLabelPosition(subsection.geometry, subsection.labelPos)

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      onClick={(e) => onSelect({ subsectionSlug: subsection.slug, edit: e.originalEvent.altKey })}
    >
      <TipMarker anchor={subsection.labelPos} slug={subsection.slug} highlightLevel="subsection">
        <StartEndLabel
          icon={<SubsectionMapIcon label={shortTitle(subsection.slug)} />}
          subIcon={subsection.operator?.slug}
          start={subsection.start}
          end={subsection.end}
          layout={expandByZoom(zoom) ? "compact" : "details"}
        />
      </TipMarker>
    </Marker>
  )
}

export const SubsectionMarkers = ({ subsections, zoom, onSelect }: Props) => {
  return (
    <>
      {subsections.map((sub) => (
        <SubsectionMarker key={sub.id} subsection={sub} zoom={zoom} onSelect={onSelect} />
      ))}
    </>
  )
}
