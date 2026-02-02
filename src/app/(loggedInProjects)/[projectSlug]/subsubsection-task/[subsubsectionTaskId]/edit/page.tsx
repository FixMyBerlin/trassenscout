import { EditSubsubsectionTaskForm } from "@/src/app/(loggedInProjects)/[projectSlug]/subsubsection-task/_components/EditSubsubsectionTaskForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getSubsubsectionTask from "@/src/server/subsubsectionTask/queries/getSubsubsectionTask"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Eintragstyp"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; subsubsectionTaskId: string }
}

export default async function EditSubsubsectionTaskPage({
  params: { projectSlug, subsubsectionTaskId },
}: Props) {
  const subsubsectionTask = await invoke(getSubsubsectionTask, {
    projectSlug,
    id: Number(subsubsectionTaskId),
  })

  return (
    <>
      <PageHeader title="Eintragstyp bearbeiten" className="mt-12" />
      <EditSubsubsectionTaskForm subsubsectionTask={subsubsectionTask} projectSlug={projectSlug} />
    </>
  )
}
