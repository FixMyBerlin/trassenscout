import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getSubsubsectionTasksWithCount from "@/src/server/subsubsectionTask/queries/getSubsubsectionTasksWithCount"
import { Metadata } from "next"
import "server-only"
import { SubsubsectionTasksTable } from "./_components/SubsubsectionTasksTable"

export const metadata: Metadata = {
  title: "Eintragstypen",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function SubsubsectionTasksPage({ params: { projectSlug } }: Props) {
  const { subsubsectionTasks } = await invoke(getSubsubsectionTasksWithCount, {
    projectSlug,
  })

  return (
    <>
      <PageHeader title="Eintragstypen" className="mt-12" />
      <SubsubsectionTasksTable subsubsectionTasks={subsubsectionTasks} />
    </>
  )
}
