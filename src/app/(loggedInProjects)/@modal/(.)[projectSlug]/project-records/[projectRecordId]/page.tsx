import { ProjectRecordDetailModalClient } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordDetailModalClient"
import { invoke } from "@/src/blitz-server"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"

export default async function ProjectRecordDetailModalPage({
  params,
}: {
  params: { projectSlug: string; projectRecordId: string }
}) {
  const projectRecord = await invoke(getProjectRecord, {
    projectSlug: params.projectSlug,
    id: parseInt(params.projectRecordId),
  })

  return <ProjectRecordDetailModalClient initialProjectRecord={projectRecord} />
}
