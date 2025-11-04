import { ProjectRecordDetailClient } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/[projectRecordId]/_components/ProtocolDetailClient"
import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/CreateEditReviewHistory"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjectRecord from "@/src/server/projectRecord/queries/getProjectRecord"

import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Projektprotokoll",
}

export default async function ProjectRecordDetail({
  params,
}: {
  params: { projectSlug: string; projectRecordId: string }
}) {
  const projectRecordId = parseInt(params.projectRecordId)
  const projectRecord = await invoke(getProjectRecord, {
    projectSlug: params.projectSlug,
    id: projectRecordId,
  })

  return (
    <>
      <PageHeader
        title={projectRecord.title}
        className="mt-12"
        action={
          <IfUserCanEdit>
            <Link
              icon="edit"
              href={`/${params.projectSlug}/project-records/${projectRecordId}/edit`}
            >
              Bearbeiten
            </Link>
          </IfUserCanEdit>
        }
      />

      <CreateEditReviewHistory projectRecord={projectRecord} />

      <ProjectRecordDetailClient projectRecord={projectRecord} projectRecordId={projectRecordId} />

      <div className="mt-8 border-t border-gray-200 pt-4">
        <Link href={`/${params.projectSlug}/project-records`}>
          ← Zurück zur Protokoll-Übersicht
        </Link>
      </div>
    </>
  )
}
