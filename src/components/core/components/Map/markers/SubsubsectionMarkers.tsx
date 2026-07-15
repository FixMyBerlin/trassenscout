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
  dotMode: boolean | null
  pageSubsectionSlug: string | null
  selectedSubsubsectionSlug?: string
  onSelect: (props: { subsectionSlug: string; subsubsectionSlug: string; edit: boolean }) => void
}

type SubsubsectionMarkerProps = {
  subsubsection: SubsubsectionWithPosition
  dotMode: boolean
  pageSubsectionSlug: string | null
  selectedSubsubsectionSlug?: string
  onSelect: (props: { subsectionSlug: string; subsubsectionSlug: string; edit: boolean }) => void
}

const SubsubsectionMarker = ({
  subsubsection,
  dotMode,
  pageSubsectionSlug,
  selectedSubsubsectionSlug,
  onSelect,
}: SubsubsectionMarkerProps) => {
  const [longitude, latitude] = getLabelPosition(subsubsection.geometry, subsubsection.labelPos)
  const isHighlighted = useIsMapHighlighted("subsubsection", subsubsection.slug)
  const isSelected = subsubsection.slug === selectedSubsubsectionSlug
  const shouldShowLabel = !dotMode || isHighlighted || isSelected
  const label = (
    <TipMarker
      anchor={subsubsection.labelPos}
      className={
        subsubsection.subsection.slug === pageSubsectionSlug
          ? "opacity-100"
          : "opacity-50 hover:opacity-100"
      }
      slug={subsubsection.slug}
      highlightLevel="subsubsection"
      highlightVariant="filled"
    >
      <TitleLabel
        icon={
          <SubsubsectionMapIcon
            slug={subsubsection.slug}
            className={twJoin(
              "transition-colors",
              isHighlighted ? "border-yellow-400 bg-yellow-400 text-gray-900" : "",
            )}
          />
        }
        subtitle={subsubsection.SubsubsectionTask?.title}
      />
    </TipMarker>
  )

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
      <div className={twJoin("group relative", dotMode && "h-6 w-6")}>
        {shouldShowLabel ? (
          dotMode ? (
            <div className="absolute top-1/2 left-1/2">{label}</div>
          ) : (
            label
          )
        ) : null}
      </div>
    </Marker>
  )
}

export const SubsubsectionMarkers = ({
  subsubsections,
  dotMode,
  pageSubsectionSlug,
  selectedSubsubsectionSlug,
  onSelect,
}: Props) => {
  if (dotMode === null) return null

  return (
    <>
      {subsubsections.map((subsub) => (
        <SubsubsectionMarker
          key={subsub.id}
          subsubsection={subsub}
          dotMode={dotMode}
          pageSubsectionSlug={pageSubsectionSlug}
          selectedSubsubsectionSlug={selectedSubsubsectionSlug}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}
