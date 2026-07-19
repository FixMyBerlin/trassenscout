import { MapProvider } from "react-map-gl/maplibre"
import type { ProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/types"
import { DashboardMap } from "./DashboardMap"

type Props = {
  projects: ProjectsWithGeometryWithMembershipRole
  classHeight?: string
}

export const DashboardMapWithProvider = ({ projects, classHeight }: Props) => {
  return (
    <MapProvider>
      <DashboardMap projects={projects} classHeight={classHeight} />
    </MapProvider>
  )
}
