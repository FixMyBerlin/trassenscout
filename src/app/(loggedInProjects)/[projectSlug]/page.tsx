import { Metadata } from "next"
import { ProjectDashboardClient } from "./_components/ProjectDashboardClient"

export const metadata: Metadata = {
  title: "Projekt",
  robots: "noindex",
}

export default function ProjectDashboardPage() {
  return <ProjectDashboardClient />
}
