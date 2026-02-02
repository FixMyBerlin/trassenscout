import { EditNetworkHierarchyForm } from "@/src/app/(loggedInProjects)/[projectSlug]/network-hierarchy/_components/EditNetworkHierarchyForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getNetworkHierarchy from "@/src/server/networkHierarchy/queries/getNetworkHierarchy"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Netzhierarchie"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; networkHierarchyId: string }
}

export default async function EditNetworkHierarchyPage({
  params: { projectSlug, networkHierarchyId },
}: Props) {
  const networkHierarchy = await invoke(getNetworkHierarchy, {
    projectSlug,
    id: Number(networkHierarchyId),
  })

  return (
    <>
      <PageHeader title="Netzstufe bearbeiten" className="mt-12" />
      <EditNetworkHierarchyForm networkHierarchy={networkHierarchy} projectSlug={projectSlug} />
    </>
  )
}
