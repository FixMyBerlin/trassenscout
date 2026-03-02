import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getNetworkHierarchyWithCount from "@/src/server/networkHierarchy/queries/getNetworkHierarchysWithCount"
import { Metadata, Route } from "next"
import "server-only"
import { NetworkHierarchysTable } from "./_components/NetworkHierarchysTable"

export const metadata: Metadata = {
  title: "Netzstufen",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
  searchParams: { from?: string }
}

export default async function NetworkHierarchysPage({
  params: { projectSlug },
  searchParams,
}: Props) {
  const { networkHierarchys } = await invoke(getNetworkHierarchyWithCount, {
    projectSlug,
  })

  // Preserve `from` param for navigation within this domain
  const fromParam = searchParams?.from
  const appendFrom = fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""

  return (
    <>
      <PageHeader title="Netzstufen" className="mt-12" />
      <NetworkHierarchysTable networkHierarchys={networkHierarchys} fromPath={fromParam} />
      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/network-hierarchy/new${appendFrom}` as Route}
        >
          Neue Netzstufe
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromParam} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ networkHierarchys }} />
    </>
  )
}
