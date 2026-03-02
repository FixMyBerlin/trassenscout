import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getSubsectionStatussWithCount from "@/src/server/subsectionStatus/queries/getSubsectionStatussWithCount"
import { Metadata, Route } from "next"
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
  searchParams: { from?: string }
}

export default async function SubsectionStatusesPage({
  params: { projectSlug },
  searchParams,
}: Props) {
  // Fetch all rows (no pagination per plan)
  const { subsectionStatuss } = await invoke(getSubsectionStatussWithCount, {
    projectSlug,
  })

  // Preserve `from` param for navigation within this domain
  const fromParam = searchParams?.from
  const appendFrom = fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""

  return (
    <>
      <PageHeader title="Status" className="mt-12" />

      <SubsectionStatusesTable
        subsectionStatuss={subsectionStatuss}
        projectSlug={projectSlug}
        fromPath={fromParam}
      />

      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/subsection-status/new${appendFrom}` as Route}
        >
          Neuer Status
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromParam} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ subsectionStatuss }} />
    </>
  )
}
