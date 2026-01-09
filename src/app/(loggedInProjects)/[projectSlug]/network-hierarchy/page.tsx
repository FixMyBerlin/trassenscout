import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getNetworkHierarchyWithCount from "@/src/server/networkHierarchy/queries/getNetworkHierarchysWithCount"
import { Metadata } from "next"
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
}

export default async function NetworkHierarchysPage({ params: { projectSlug } }: Props) {
  const { networkHierarchys } = await invoke(getNetworkHierarchyWithCount, {
    projectSlug,
  })

  return (
    <>
      <PageHeader title="Netzstufen" className="mt-12" />
      <NetworkHierarchysTable networkHierarchys={networkHierarchys} />
      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/network-hierarchy/new`}
        >
          Neue Netzstufe
        </Link>
      </IfUserCanEdit>
      <SuperAdminLogData data={{ networkHierarchys }} />
    </>
  )
}
