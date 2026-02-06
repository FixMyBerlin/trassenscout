"use client"
import type { TGetProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/queries/getProjectsWithGeometryWithMembershipRole"
import { MapProvider } from "react-map-gl/maplibre"
import { DashboardMap } from "./DashboardMap"

type Props = {
  projects: TGetProjectsWithGeometryWithMembershipRole
}

export const DashboardMapWithProvider = ({ projects }: Props) => {
  return (
    <MapProvider>
      <DashboardMap projects={projects} />
    </MapProvider>
  )
}
