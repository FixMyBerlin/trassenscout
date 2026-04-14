import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getAcquisitionAreaStatuses from "@/src/server/acquisitionAreaStatuses/queries/getAcquisitionAreaStatuses"
import { Metadata, Route } from "next"
import "server-only"
import { AcquisitionAreaStatusesTable } from "./_components/AcquisitionAreaStatusesTable"

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

export default async function AcquisitionAreaStatusesPage({
  params: { projectSlug },
  searchParams,
}: Props) {
  const { acquisitionAreaStatuses } = await invoke(getAcquisitionAreaStatuses, { projectSlug })
  const fromParam = searchParams?.from
  const appendFrom = fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""

  return (
    <>
      <PageHeader title="Status" className="mt-12" />
      <AcquisitionAreaStatusesTable
        acquisitionAreaStatuses={acquisitionAreaStatuses}
        fromPath={fromParam}
      />
      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/acquisition-area-status/new${appendFrom}` as Route}
        >
          Neuer Status
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromParam} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ acquisitionAreaStatuses }} />
    </>
  )
}
