import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { ConditionalBackLink } from "@/src/core/components/forms/ConditionalBackLink"
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
  searchParams: { from?: string }
}

export default async function SubsubsectionTasksPage({
  params: { projectSlug },
  searchParams,
}: Props) {
  const { subsubsectionTasks } = await invoke(getSubsubsectionTasksWithCount, {
    projectSlug,
  })

  // Preserve `from` param for navigation within this domain
  const fromParam = searchParams?.from

  return (
    <>
      <PageHeader title="Eintragstypen" className="mt-12" />
      <SubsubsectionTasksTable subsubsectionTasks={subsubsectionTasks} fromPath={fromParam} />
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromParam} />
      </IfUserCanEdit>
    </>
  )
}
