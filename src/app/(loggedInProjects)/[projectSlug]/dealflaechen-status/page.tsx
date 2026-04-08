import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getDealAreaStatuses from "@/src/server/dealAreaStatuses/queries/getDealAreaStatuses"
import { Metadata, Route } from "next"
import "server-only"
import { DealAreaStatusesTable } from "./_components/DealAreaStatusesTable"

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

export default async function DealAreaStatusesPage({ params: { projectSlug }, searchParams }: Props) {
  const { dealAreaStatuses } = await invoke(getDealAreaStatuses, { projectSlug })
  const fromParam = searchParams?.from
  const appendFrom = fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""

  return (
    <>
      <PageHeader title="Status" className="mt-12" />
      <DealAreaStatusesTable dealAreaStatuses={dealAreaStatuses} fromPath={fromParam} />
      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/dealflaechen-status/new${appendFrom}` as Route}
        >
          Neuer Status
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromParam} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ dealAreaStatuses }} />
    </>
  )
}
