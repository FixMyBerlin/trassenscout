import { ProjectDashboardClient } from "./_components/ProjectDashboardClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Projekt",
  robots: "noindex",
}

export default function ProjectDashboardPage() {
  return <ProjectDashboardClient />
}
