import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/core/components/forms/ConditionalBackLink"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import { Metadata } from "next"
import "server-only"
import { OperatorsTable } from "./_components/OperatorsTable"

export const metadata: Metadata = {
  title: "Baulastträger",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
  searchParams: { page?: string; from?: string }
}

export default async function OperatorsPage({ params: { projectSlug }, searchParams }: Props) {
  const page = Number(searchParams?.page ?? 0) || 0
  const { operators, hasMore } = await invoke(getOperatorsWithCount, {
    projectSlug,
  })

  // Preserve `from` param for navigation within this domain
  const fromParam = searchParams?.from

  return (
    <>
      <PageHeader title="Baulastträger" className="mt-12" />
      <OperatorsTable operators={operators} hasMore={hasMore} page={page} fromPath={fromParam} />
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromParam} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ operators }} />
    </>
  )
}
