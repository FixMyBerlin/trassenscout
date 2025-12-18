import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjectRecordEmails from "@/src/server/ProjectRecordEmails/queries/getProjectRecordEmails"
import { Metadata } from "next"
import "server-only"
import { ProjectRecordEmailsTable } from "./_components/ProjectRecordEmailsTable"

export const metadata: Metadata = {
  title: "Protokoll-E-Mails",
}

export default async function ProjectRecordEmailsPage() {
  const projectRecordEmails = await invoke(getProjectRecordEmails, {})

  return (
    <>
      <PageHeader title="Protokoll-E-Mails" className="mt-12" />
      <Link href="/admin/project-records">Zu den Protokollen</Link>
      <ProjectRecordEmailsTable projectRecordEmails={projectRecordEmails} />
    </>
  )
}
