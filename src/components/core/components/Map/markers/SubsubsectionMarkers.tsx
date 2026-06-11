import { Marker } from "react-map-gl/maplibre"
import { twJoin } from "tailwind-merge"
import { SubsubsectionMapIcon } from "../Icons/SubsubsectionIcon"
import { TitleLabel } from "../Labels/TitleLabel"
import type { SubsubsectionMapEntity as SubsubsectionWithPosition } from "../mapEntityTypes"
import { useIsMapHighlighted } from "../mapHighlightContext"
import { TipMarker } from "../TipMarker"
import { getLabelPosition } from "../utils/getLabelPosition"

type Props = {
  subsubsections: SubsubsectionWithPosition[]
  pageSubsectionSlug: string | null
  onSelect: (props: { subsectionSlug: string; subsubsectionSlug: string; edit: boolean }) => void
}

type SubsubsectionMarkerProps = {
  subsubsection: SubsubsectionWithPosition
  pageSubsectionSlug: string | null
  onSelect: (props: { subsectionSlug: string; subsubsectionSlug: string; edit: boolean }) => void
}

const SubsubsectionMarker = ({
  subsubsection,
  pageSubsectionSlug,
  onSelect,
}: SubsubsectionMarkerProps) => {
  const [longitude, latitude] = getLabelPosition(subsubsection.geometry, subsubsection.labelPos)
  const isHighlighted = useIsMapHighlighted("subsubsection", subsubsection.slug)

  return (
    <Marker
      longitude={longitude as number}
      latitude={latitude as number}
      anchor="center"
      onClick={(e) => {
        onSelect({
          subsectionSlug: subsubsection.subsection.slug,
          subsubsectionSlug: subsubsection.slug,
          edit: e.originalEvent.altKey,
        })
      }}
    >
      <TipMarker
        anchor={subsubsection.labelPos}
        className={
          subsubsection.subsection.slug === pageSubsectionSlug
            ? "opacity-100"
            : "opacity-50 hover:opacity-100"
        }
        slug={subsubsection.slug}
        highlightLevel="subsubsection"
      >
        <TitleLabel
          icon={
            <SubsubsectionMapIcon
              slug={subsubsection.slug}
              className={twJoin(
                "transition-colors",
                isHighlighted ? "border-[#F8C62B] bg-[#F8C62B] text-gray-900" : "",
              )}
            />
          }
          subtitle={subsubsection.SubsubsectionTask?.title}
        />
      </TipMarker>
    </Marker>
  )
}

export const SubsubsectionMarkers = ({ subsubsections, pageSubsectionSlug, onSelect }: Props) => {
  return (
    <>
      {subsubsections.map((subsub) => (
        <SubsubsectionMarker
          key={subsub.id}
          subsubsection={subsub}
          pageSubsectionSlug={pageSubsectionSlug}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}
