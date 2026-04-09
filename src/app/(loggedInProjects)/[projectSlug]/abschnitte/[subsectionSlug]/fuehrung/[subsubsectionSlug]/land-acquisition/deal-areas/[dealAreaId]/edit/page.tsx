import { EditDealAreaForm } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/deal-areas/_components/EditDealAreaForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getDealArea from "@/src/server/dealAreas/queries/getDealArea"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Dealfläche"),
  robots: {
    index: false,
  },
}

type Props = {
  params: {
    projectSlug: string
    subsectionSlug: string
    subsubsectionSlug: string
    dealAreaId: string
  }
}

export default async function EditDealAreaPage({
  params: { projectSlug, subsectionSlug, subsubsectionSlug, dealAreaId },
}: Props) {
  const dealArea = await invoke(getDealArea, {
    projectSlug,
    id: Number(dealAreaId),
  })

  return (
    <>
      <PageHeader title={`Dealfläche ${dealArea.id} bearbeiten`} className="mt-12" />
      <EditDealAreaForm
        dealArea={dealArea}
        projectSlug={projectSlug}
        subsectionSlug={subsectionSlug}
        subsubsectionSlug={subsubsectionSlug}
      />
    </>
  )
}
