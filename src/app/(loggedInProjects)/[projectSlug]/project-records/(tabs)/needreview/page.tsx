import { invoke } from "@/src/blitz-server"
import getProjectRecordsNeedsReview from "@/src/server/projectRecords/queries/getProjectRecordsNeedsReview"
import { AuthorizationError } from "blitz"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import "server-only"
import { ProjectRecordsNeedsReviewContent } from "../../_components/ProjectRecordsNeedsReviewContent"

export const metadata: Metadata = {
  title: "Bestätigung erforderlich - Projektprotokoll",
}

export default async function ProjectRecordsNeedsReviewPage({
  params,
}: {
  params: { projectSlug: string }
}) {
  let projectRecords
  try {
    projectRecords = await invoke(getProjectRecordsNeedsReview, {
      projectSlug: params.projectSlug,
    })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect(`/${params.projectSlug}/project-records`)
    }
    throw error
  }

  return <ProjectRecordsNeedsReviewContent initialProjectRecords={projectRecords} />
}
