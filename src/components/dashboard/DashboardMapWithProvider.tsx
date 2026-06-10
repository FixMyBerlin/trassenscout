import { MapProvider } from "react-map-gl/maplibre"
import type { ProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/types"
import { DashboardMap } from "./DashboardMap"

type Props = {
  projects: ProjectsWithGeometryWithMembershipRole
}

export const DashboardMapWithProvider = ({ projects }: Props) => {
  return (
    <MapProvider>
      <DashboardMap projects={projects} />
    </MapProvider>
  )
}
