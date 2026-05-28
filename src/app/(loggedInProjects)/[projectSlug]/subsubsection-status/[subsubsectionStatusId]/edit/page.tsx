import { EditSubsubsectionStatusForm } from "@/src/app/(loggedInProjects)/[projectSlug]/subsubsection-status/_components/EditSubsubsectionStatusForm"
import { authorizeProjectMember } from "@/src/app/(loggedInProjects)/_utils/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getSubsubsectionStatus from "@/src/server/subsubsectionStatus/queries/getSubsubsectionStatus"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Phase"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; subsubsectionStatusId: string }
  searchParams: { from?: string }
}

export default async function EditSubsubsectionStatusPage({
  params: { projectSlug, subsubsectionStatusId },
  searchParams,
}: Props) {
  await authorizeProjectMember(projectSlug, editorRoles)

  const subsubsectionStatus = await invoke(getSubsubsectionStatus, {
    projectSlug,
    id: Number(subsubsectionStatusId),
  })

  const fromParam = searchParams?.from

  return (
    <>
      <PageHeader title="Phase bearbeiten" className="mt-12" />
      <EditSubsubsectionStatusForm
        subsubsectionStatus={subsubsectionStatus}
        projectSlug={projectSlug}
        fromParam={fromParam}
      />
    </>
  )
}
