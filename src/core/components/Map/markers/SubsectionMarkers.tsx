import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { Marker } from "react-map-gl/maplibre"
import { shortTitle } from "../../text"
import { SubsectionMapIcon } from "../Icons"
import { MarkerLabel } from "../Labels"
import { TipMarker } from "../TipMarker"
import { getLabelPosition } from "../utils/getLabelPosition"

type Props = {
  subsections: TSubsections
  onSelect: (props: { subsectionSlug: string; edit: boolean }) => void
}

type SubsectionMarkerProps = {
  subsection: TSubsections[number]
  onSelect: (props: { subsectionSlug: string; edit: boolean }) => void
}

const SubsectionMarker = ({ subsection, onSelect }: SubsectionMarkerProps) => {
  const [longitude, latitude] = getLabelPosition(subsection.geometry, subsection.labelPos)

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      onClick={(e) => onSelect({ subsectionSlug: subsection.slug, edit: e.originalEvent.altKey })}
    >
      <TipMarker anchor={subsection.labelPos} slug={subsection.slug} highlightLevel="subsection">
        <MarkerLabel icon={<SubsectionMapIcon label={shortTitle(subsection.slug)} />} />
      </TipMarker>
    </Marker>
  )
}

export const SubsectionMarkers = ({ subsections, onSelect }: Props) => {
  return (
    <>
      {subsections.map((sub) => (
        <SubsectionMarker key={sub.id} subsection={sub} onSelect={onSelect} />
      ))}
    </>
  )
}
