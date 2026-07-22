import { Marker } from "react-map-gl/maplibre"
import type { ProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/types"
import { shortTitle } from "../../text/titles"
import { MarkerLabel } from "../Labels/MarkerLabel"
import { TipMarker } from "../TipMarker"

type Props = {
  projects: ProjectsWithGeometryWithMembershipRole
  onSelect: (projectSlug: string) => void
}

type ProjectMarkerProps = {
  projectSlug: string
  previewPoint: ProjectsWithGeometryWithMembershipRole[number]["previewPoint"]
  onSelect: (projectSlug: string) => void
}

const ProjectMarker = ({ projectSlug, previewPoint, onSelect }: ProjectMarkerProps) => {
  if (!previewPoint) return null

  const [longitude, latitude] = previewPoint

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
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
          previewPoint={project.previewPoint}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}
