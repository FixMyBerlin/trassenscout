import { EditSubsubsectionSpecialForm } from "@/src/app/(loggedInProjects)/[projectSlug]/subsubsection-special/_components/EditSubsubsectionSpecialForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getSubsubsectionSpecial from "@/src/server/subsubsectionSpecial/queries/getSubsubsectionSpecial"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Besonderheit"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; subsubsectionSpecialId: string }
}

export default async function EditSubsubsectionSpecialPage({
  params: { projectSlug, subsubsectionSpecialId },
}: Props) {
  const subsubsectionSpecial = await invoke(getSubsubsectionSpecial, {
    projectSlug,
    id: Number(subsubsectionSpecialId),
  })

  return (
    <>
      <PageHeader title="Besonderheit bearbeiten" className="mt-12" />
      <EditSubsubsectionSpecialForm
        subsubsectionSpecial={subsubsectionSpecial}
        projectSlug={projectSlug}
      />
    </>
  )
}
