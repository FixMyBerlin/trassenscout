import { EditDealAreaStatusForm } from "@/src/app/(loggedInProjects)/[projectSlug]/deal-area-status/_components/EditDealAreaStatusForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getDealAreaStatus from "@/src/server/dealAreaStatuses/queries/getDealAreaStatus"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Status"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; dealAreaStatusId: string }
  searchParams: { from?: string }
}

export default async function EditDealAreaStatusPage({
  params: { projectSlug, dealAreaStatusId },
  searchParams,
}: Props) {
  const dealAreaStatus = await invoke(getDealAreaStatus, {
    projectSlug,
    id: Number(dealAreaStatusId),
  })

  const fromParam = searchParams?.from

  return (
    <>
      <PageHeader title="Status bearbeiten" className="mt-12" />
      <EditDealAreaStatusForm
        dealAreaStatus={dealAreaStatus}
        projectSlug={projectSlug}
        fromParam={fromParam}
      />
    </>
  )
}
