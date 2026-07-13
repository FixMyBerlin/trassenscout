import { Marker } from "react-map-gl/maplibre"
import { twJoin } from "tailwind-merge"
import { shortTitle } from "../../text/titles"
import { SubsectionMapIcon } from "../Icons/SubsectionIcon"
import { MarkerLabel } from "../Labels/MarkerLabel"
import type { SubsectionMapEntities as TSubsections } from "../mapEntityTypes"
import { TipMarker } from "../TipMarker"
import { useMarkerHighlight } from "../useMarkerHighlight"
import { getLabelPosition } from "../utils/getLabelPosition"

export const SUBSECTION_LABEL_MIN_ZOOM = 11

const markerStyles = {
  default: { zIndex: 0 },
  highlighted: { zIndex: 10 },
} as const

type Props = {
  subsections: TSubsections
  dotMode: boolean | null
  onSelect: (props: { subsectionSlug: string; edit: boolean }) => void
}

type SubsectionMarkerProps = {
  subsection: TSubsections[number]
  dotMode: boolean
  onSelect: (props: { subsectionSlug: string; edit: boolean }) => void
}

const SubsectionDot = () => {
  return (
    <div data-testid="subsection-dot" className="flex h-6 w-6 items-center justify-center">
      <div className="h-3 w-3 rounded-full border border-white bg-gray-900 shadow transition-colors group-hover:bg-yellow-400" />
    </div>
  )
}

const SubsectionMarker = ({ subsection, dotMode, onSelect }: SubsectionMarkerProps) => {
  const [longitude, latitude] = getLabelPosition(subsection.geometry, subsection.labelPos)
  const { isHighlighted, handleMouseEnter, handleMouseLeave } = useMarkerHighlight(
    "subsection",
    subsection.slug,
  )

  const label = (props: { dotMode: boolean }) => (
    <TipMarker
      anchor={subsection.labelPos}
      slug={subsection.slug}
      highlightLevel="subsection"
      syncHighlightOnHover={false}
      highlighted={props.dotMode ? false : undefined}
      pillClassName={props.dotMode ? "group-hover:border-yellow-400" : undefined}
    >
      <MarkerLabel
        icon={
          <SubsectionMapIcon
            label={shortTitle(subsection.slug)}
            className={twJoin(
              "transition-colors",
              props.dotMode
                ? "group-hover:border-yellow-400 group-hover:bg-yellow-400 group-hover:text-gray-900"
                : isHighlighted
                  ? "border-yellow-400 bg-yellow-400 text-gray-900"
                  : "",
            )}
          />
        }
      />
    </TipMarker>
  )

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      style={isHighlighted ? markerStyles.highlighted : markerStyles.default}
      onClick={(e) => onSelect({ subsectionSlug: subsection.slug, edit: e.originalEvent.altKey })}
    >
      <div
        className="group relative cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {dotMode && <SubsectionDot />}
        {dotMode
          ? isHighlighted && (
              <div className="absolute top-1/2 left-1/2">{label({ dotMode: true })}</div>
            )
          : label({ dotMode: false })}
      </div>
    </Marker>
  )
}

export const SubsectionMarkers = ({ subsections, dotMode, onSelect }: Props) => {
  if (dotMode === null) return null

  return (
    <>
      {subsections.map((sub) => (
        <SubsectionMarker key={sub.id} subsection={sub} dotMode={dotMode} onSelect={onSelect} />
      ))}
    </>
  )
}
