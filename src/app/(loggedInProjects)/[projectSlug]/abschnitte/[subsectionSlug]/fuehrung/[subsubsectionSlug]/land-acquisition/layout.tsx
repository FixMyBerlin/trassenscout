import { invoke } from "@/src/blitz-server"
import { subsubsectionDashboardRoute } from "@/src/core/routes/subsectionRoutes"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import { redirect } from "next/navigation"
import { ReactNode } from "react"
import "server-only"

type Props = {
  children: ReactNode
  params: {
    projectSlug: string
    subsectionSlug: string
    subsubsectionSlug: string
  }
}

export default async function LandAcquisitionLayout({
  children,
  params: { projectSlug, subsectionSlug, subsubsectionSlug },
}: Props) {
  const subsubsection = await invoke(getSubsubsection, {
    projectSlug,
    subsectionSlug,
    subsubsectionSlug,
  })

  if (!subsubsection.subsection.project.landAcquisitionModuleEnabled) {
    redirect(subsubsectionDashboardRoute(projectSlug, subsectionSlug, subsubsectionSlug))
  }

  return children
}
