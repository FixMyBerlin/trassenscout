import { invoke } from "@/src/blitz-server"
import { seoTitleSlug } from "@/src/core/components/text"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import "server-only"
import { SubsectionDashboardClient } from "../../_components/SubsectionDashboardClient"

export async function generateMetadata({
  params,
}: {
  params: { projectSlug: string; subsectionSlug: string; subsubsectionSlug: string }
}) {
  try {
    const subsubsection = await invoke(getSubsubsection, {
      projectSlug: params.projectSlug,
      subsectionSlug: params.subsectionSlug,
      subsubsectionSlug: params.subsubsectionSlug,
    })
    return {
      title: seoTitleSlug(subsubsection.slug),
      robots: "noindex",
    }
  } catch {
    return {
      title: "Eintrag",
      robots: "noindex",
    }
  }
}

export default function SubsubsectionDashboardPage() {
  return <SubsectionDashboardClient />
}
