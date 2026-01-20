import { EditNetworkHierarchyForm } from "@/src/app/(loggedInProjects)/[projectSlug]/network-hierarchy/_components/EditNetworkHierarchyForm"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getNetworkHierarchy from "@/src/server/networkHierarchy/queries/getNetworkHierarchy"
import { Metadata, Route } from "next"
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
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/network-hierarchy` as Route}>Zurück zur Übersicht</Link>
    </>
  )
}
