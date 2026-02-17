import { invoke } from "@/src/blitz-server"
import { seoTitleSlug } from "@/src/core/components/text"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import "server-only"
import { SubsectionDashboardClient } from "./_components/SubsectionDashboardClient"

export async function generateMetadata({
  params,
}: {
  params: { projectSlug: string; subsectionSlug: string }
}) {
  try {
    const subsection = await invoke(getSubsection, {
      projectSlug: params.projectSlug,
      subsectionSlug: params.subsectionSlug,
    })
    return {
      title: seoTitleSlug(subsection.slug),
      robots: "noindex",
    }
  } catch {
    return {
      title: "Planungsabschnitt",
      robots: "noindex",
    }
  }
}

export default function SubsectionDashboardPage() {
  return <SubsectionDashboardClient />
}
