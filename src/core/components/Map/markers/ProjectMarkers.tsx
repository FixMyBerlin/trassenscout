import type { TGetProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/queries/getProjectsWithGeometryWithMembershipRole"
import { Marker } from "react-map-gl/maplibre"
import { shortTitle } from "../../text"
import { ProjectMapIcon } from "../Icons/ProjectIcon"
import { MarkerLabel } from "../Labels"
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
      <TipMarker anchor="top" slug={projectSlug} highlightLevel="project">
        <MarkerLabel icon={<ProjectMapIcon label={shortTitle(projectSlug)} />} />
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
