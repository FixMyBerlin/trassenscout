import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getSubsectionStatussWithCount from "@/src/server/subsectionStatus/queries/getSubsectionStatussWithCount"
import { Metadata } from "next"
import "server-only"
import { SubsectionStatusesTable } from "./_components/SubsectionStatusesTable"

export const metadata: Metadata = {
  title: "Status",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function SubsectionStatusesPage({ params: { projectSlug } }: Props) {
  // Fetch all rows (no pagination per plan)
  const { subsectionStatuss } = await invoke(getSubsectionStatussWithCount, {
    projectSlug,
  })

  return (
    <>
      <PageHeader title="Status" className="mt-12" />

      <SubsectionStatusesTable subsectionStatuss={subsectionStatuss} projectSlug={projectSlug} />

      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/subsection-status/new`}
        >
          Neuer Status
        </Link>
      </IfUserCanEdit>

      <SuperAdminLogData data={{ subsectionStatuss }} />
    </>
  )
}
