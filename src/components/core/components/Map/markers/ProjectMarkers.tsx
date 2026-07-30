import { Marker } from "react-map-gl/maplibre"
import { twJoin } from "tailwind-merge"
import type { ProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/types"
import { shortTitle } from "../../text/titles"
import { MarkerLabel } from "../Labels/MarkerLabel"
import { TipMarker } from "../TipMarker"
import { useMarkerHighlight } from "../useMarkerHighlight"

const dotModeMarkerSizeClass = "h-5 w-5"

const markerStyles = {
  default: { zIndex: 0 },
  highlighted: { zIndex: 10 },
} as const

type Props = {
  projects: ProjectsWithGeometryWithMembershipRole
  dotMode: boolean | null
  onSelect: (projectSlug: string) => void
}

type ProjectMarkerProps = {
  project: ProjectsWithGeometryWithMembershipRole[number]
  previewPoint: ProjectsWithGeometryWithMembershipRole[number]["previewPoint"]
  dotMode: boolean
  onSelect: (projectSlug: string) => void
}

const ProjectMarker = ({ project, previewPoint, dotMode, onSelect }: ProjectMarkerProps) => {
  const { isHighlighted, handleMouseEnter, handleMouseLeave } = useMarkerHighlight(
    "project",
    project.slug,
  )

  if (!previewPoint) return null

  const [longitude, latitude] = previewPoint

  const label = (
    <TipMarker
      anchor="top"
      slug={project.slug}
      highlightLevel="project"
      syncHighlightOnHover={false}
      highlighted={isHighlighted}
      highlightVariant="filled"
    >
      <MarkerLabel
        icon={
          <div className="flex h-5 w-auto flex-none items-center justify-center px-1.5 font-sans text-xs leading-none font-semibold text-yellow-950">
            {shortTitle(project.slug)}
          </div>
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
      onClick={() => onSelect(project.slug)}
    >
      <div
        className={twJoin("group relative cursor-pointer", dotMode && dotModeMarkerSizeClass)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {dotMode
          ? isHighlighted && <div className="absolute top-1/2 left-1/2">{label}</div>
          : label}
      </div>
    </Marker>
  )
}

export const ProjectMarkers = ({ projects, dotMode, onSelect }: Props) => {
  if (dotMode === null) return null

  return (
    <>
      {projects.map((project) => (
        <ProjectMarker
          key={project.slug}
          project={project}
          previewPoint={project.previewPoint}
          dotMode={dotMode}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}
