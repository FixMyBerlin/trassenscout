import { EditSubsubsectionTaskForm } from "@/src/app/(loggedInProjects)/[projectSlug]/subsubsection-task/_components/EditSubsubsectionTaskForm"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getSubsubsectionTask from "@/src/server/subsubsectionTask/queries/getSubsubsectionTask"
import { Metadata, Route } from "next"
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
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/subsubsection-task` as Route}>Zurück zur Übersicht</Link>
    </>
  )
}
