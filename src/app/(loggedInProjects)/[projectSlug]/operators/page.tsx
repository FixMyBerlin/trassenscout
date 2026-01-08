import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
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

const ITEMS_PER_PAGE = 100

type Props = {
  params: { projectSlug: string }
  searchParams: { page?: string }
}

export default async function OperatorsPage({ params: { projectSlug }, searchParams }: Props) {
  const page = Number(searchParams?.page ?? 0) || 0
  const { operators, hasMore } = await invoke(getOperatorsWithCount, {
    projectSlug,
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  return (
    <>
      <PageHeader title="Baulastträger" className="mt-12" />
      <OperatorsTable operators={operators} hasMore={hasMore} page={page} />
      <SuperAdminLogData data={{ operators }} />
    </>
  )
}
