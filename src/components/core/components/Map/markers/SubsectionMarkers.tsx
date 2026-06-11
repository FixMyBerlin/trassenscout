import { Marker } from "react-map-gl/maplibre"
import { twJoin } from "tailwind-merge"
import { shortTitle } from "../../text/titles"
import { SubsectionMapIcon } from "../Icons/SubsectionIcon"
import { MarkerLabel } from "../Labels/MarkerLabel"
import type { SubsectionMapEntities as TSubsections } from "../mapEntityTypes"
import { useIsMapHighlighted } from "../mapHighlightContext"
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
  const isHighlighted = useIsMapHighlighted("subsection", subsection.slug)

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      onClick={(e) => onSelect({ subsectionSlug: subsection.slug, edit: e.originalEvent.altKey })}
    >
      <TipMarker anchor={subsection.labelPos} slug={subsection.slug} highlightLevel="subsection">
        <MarkerLabel
          icon={
            <SubsectionMapIcon
              label={shortTitle(subsection.slug)}
              className={twJoin(
                "transition-colors",
                isHighlighted ? "border-[#F8C62B] bg-[#F8C62B] text-gray-900" : "",
              )}
            />
          }
        />
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
