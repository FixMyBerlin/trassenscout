import { invoke } from "@/src/blitz-server"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getEvaluationsPage from "@/src/server/evaluationsPage/queries/getEvaluationsPage"
import getProject from "@/src/server/projects/queries/getProject"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import "server-only"

export const metadata: Metadata = {
  title: "Auswertungen",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function EvaluationsPage({ params: { projectSlug } }: Props) {
  const project = await invoke(getProject, { projectSlug })

  if (!project.evaluationsEnabled) {
    redirect(`/${projectSlug}`)
  }

  const content = await invoke(getEvaluationsPage, {})

  return (
    <>
      <PageHeader title={content.title} className="mt-12" />
      <Markdown markdown={content.markdown} className="mt-7" />
    </>
  )
}
