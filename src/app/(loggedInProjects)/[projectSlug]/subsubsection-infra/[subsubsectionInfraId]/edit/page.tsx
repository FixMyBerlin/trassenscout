import { EditSubsubsectionInfraForm } from "@/src/app/(loggedInProjects)/[projectSlug]/subsubsection-infra/_components/EditSubsubsectionInfraForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getSubsubsectionInfra from "@/src/server/subsubsectionInfra/queries/getSubsubsectionInfra"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Führungsform"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; subsubsectionInfraId: string }
}

export default async function EditSubsubsectionInfraPage({
  params: { projectSlug, subsubsectionInfraId },
}: Props) {
  const subsubsectionInfra = await invoke(getSubsubsectionInfra, {
    projectSlug,
    id: Number(subsubsectionInfraId),
  })

  return (
    <>
      <PageHeader title="Führungsform bearbeiten" className="mt-12" />
      <EditSubsubsectionInfraForm
        subsubsectionInfra={subsubsectionInfra}
        projectSlug={projectSlug}
      />
    </>
  )
}
