import { EditAcquisitionAreaForm } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/_components/EditAcquisitionAreaForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getAcquisitionArea from "@/src/server/acquisitionAreas/queries/getAcquisitionArea"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Verhandlungsfläche"),
  robots: {
    index: false,
  },
}

type Props = {
  params: {
    projectSlug: string
    subsectionSlug: string
    subsubsectionSlug: string
    acquisitionAreaId: string
  }
}

export default async function EditAcquisitionAreaPage({
  params: { projectSlug, subsectionSlug, subsubsectionSlug, acquisitionAreaId },
}: Props) {
  const acquisitionArea = await invoke(getAcquisitionArea, {
    projectSlug,
    id: Number(acquisitionAreaId),
  })

  return (
    <>
      <PageHeader title={`Verhandlungsfläche ${acquisitionArea.id} bearbeiten`} className="mt-12" />
      <EditAcquisitionAreaForm
        acquisitionArea={acquisitionArea}
        projectSlug={projectSlug}
        subsectionSlug={subsectionSlug}
        subsubsectionSlug={subsubsectionSlug}
      />
    </>
  )
}
