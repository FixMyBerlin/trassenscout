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
  const [longitude, latitude] = getCenterOfMass(subsubsection.geometry)

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
      >
        <TitleLabel
          icon={<SubsubsectionMapIcon label={shortTitle(subsubsection.slug)} />}
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
