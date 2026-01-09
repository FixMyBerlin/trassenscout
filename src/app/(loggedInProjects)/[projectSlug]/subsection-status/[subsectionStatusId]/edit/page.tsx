import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getSubsectionStatus from "@/src/server/subsectionStatus/queries/getSubsectionStatus"
import { Metadata } from "next"
import "server-only"
import { EditSubsectionStatusForm } from "../../_components/EditSubsectionStatusForm"

export const metadata: Metadata = {
  title: seoEditTitle("Status"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; subsectionStatusId: string }
}

export default async function EditSubsectionStatusPage({
  params: { projectSlug, subsectionStatusId },
}: Props) {
  const subsectionStatus = await invoke(getSubsectionStatus, {
    projectSlug,
    id: parseInt(subsectionStatusId),
  })

  return (
    <>
      <PageHeader title="Status bearbeiten" className="mt-12" />

      <EditSubsectionStatusForm subsectionStatus={subsectionStatus} projectSlug={projectSlug} />
    </>
  )
}
