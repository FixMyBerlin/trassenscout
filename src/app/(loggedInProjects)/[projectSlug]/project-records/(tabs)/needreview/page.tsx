import { redirect } from "next/navigation"
import "server-only"

export default async function ProjectRecordsNeedReviewLegacyPage({
  params,
}: {
  params: { projectSlug: string }
}) {
  redirect(`/${params.projectSlug}/project-records/review/pending`)
}
