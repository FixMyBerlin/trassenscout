"use client"

import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getProjectRecordsNeedsReview from "@/src/server/projectRecords/queries/getProjectRecordsNeedsReview"
import { useQuery } from "@blitzjs/rpc"
import { ProjectRecordsNeedsReviewInfoBanner } from "./ProjectRecordNeedsReviewBanner"
import { ProjectRecordsTable } from "./ProjectRecordTable"

export const ProjectRecordsNeedsReviewContent = ({
  initialProjectRecords,
}: {
  initialProjectRecords: Awaited<ReturnType<typeof getProjectRecordsNeedsReview>>
}) => {
  const projectSlug = useProjectSlug()
  const [projectRecords] = useQuery(
    getProjectRecordsNeedsReview,
    { projectSlug },
    { initialData: initialProjectRecords },
  )

  if (projectRecords.length === 0) {
    return (
      <ZeroCase
        visible={projectRecords.length}
        text="Momentan gibt es keine Protokolleinträge, die Bestätigung benötigen."
      />
    )
  }

  return (
    <>
      <ProjectRecordsNeedsReviewInfoBanner />
      <ProjectRecordsTable projectRecords={projectRecords} />
    </>
  )
}
