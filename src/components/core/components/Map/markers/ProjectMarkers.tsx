import { Marker } from "react-map-gl/maplibre"
import { shortTitle } from "../../text/titles"
import { MarkerLabel } from "../Labels/MarkerLabel"
import type { ProjectMapEntities as TGetProjectsWithGeometryWithMembershipRole } from "../mapEntityTypes"
import { TipMarker } from "../TipMarker"
import { getLabelPosition } from "../utils/getLabelPosition"

type Props = {
  projects: TGetProjectsWithGeometryWithMembershipRole
  onSelect: (projectSlug: string) => void
}

type ProjectMarkerProps = {
  projectSlug: string
  subsections: TGetProjectsWithGeometryWithMembershipRole[number]["subsections"]
  onSelect: (projectSlug: string) => void
}

const ProjectMarker = ({ projectSlug, subsections, onSelect }: ProjectMarkerProps) => {
  if (subsections.length === 0) return null

  const firstSubsection = subsections[0]
  if (!firstSubsection) return null

  const center = getLabelPosition(firstSubsection.geometry, firstSubsection.labelPos)

  return (
    <Marker
      longitude={center[0]}
      latitude={center[1]}
      anchor="center"
      onClick={() => onSelect(projectSlug)}
    >
      <TipMarker anchor="top" slug={projectSlug} highlightLevel="project" highlightVariant="filled">
        <MarkerLabel
          icon={
            <div className="flex h-5 w-auto flex-none items-center justify-center px-1.5 font-sans text-xs leading-none font-semibold text-yellow-950">
              {shortTitle(projectSlug)}
            </div>
          }
        />
      </TipMarker>
    </Marker>
  )
}

export const ProjectMarkers = ({ projects, onSelect }: Props) => {
  return (
    <>
      {projects.map((project) => (
        <ProjectMarker
          key={project.slug}
          projectSlug={project.slug}
          subsections={project.subsections}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}
