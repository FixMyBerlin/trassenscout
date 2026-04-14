import { NewAcquisitionAreasClient } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/new/_components/NewAcquisitionAreasClient"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { longTitle, seoIndexTitle } from "@/src/core/components/text"
import { subsubsectionLandAcquisitionRoute } from "@/src/core/routes/subsectionRoutes"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import { GeometryTypeEnum } from "@prisma/client"
import { redirect } from "next/navigation"
import "server-only"

export async function generateMetadata({
  params,
}: {
  params: { projectSlug: string; subsectionSlug: string; subsubsectionSlug: string }
}) {
  const subsubsection = await invoke(getSubsubsection, {
    projectSlug: params.projectSlug,
    subsectionSlug: params.subsectionSlug,
    subsubsectionSlug: params.subsubsectionSlug,
  })
  return {
    title: seoIndexTitle("Dealflächen erstellen", longTitle(subsubsection.slug)),
    robots: "noindex",
  }
}

type Props = {
  params: { projectSlug: string; subsectionSlug: string; subsubsectionSlug: string }
}

export default async function NewAcquisitionAreasPage({
  params: { projectSlug, subsectionSlug, subsubsectionSlug },
}: Props) {
  const subsubsection = await invoke(getSubsubsection, {
    projectSlug,
    subsectionSlug,
    subsubsectionSlug,
  })

  if (subsubsection.type === GeometryTypeEnum.POINT) {
    redirect(subsubsectionLandAcquisitionRoute(projectSlug, subsectionSlug, subsubsectionSlug))
  }

  return (
    <>
      <PageHeader title="Dealflächen des Eintrags erstellen" className="mt-12" />
      <NewAcquisitionAreasClient initialSubsubsection={subsubsection} />
    </>
  )
}
