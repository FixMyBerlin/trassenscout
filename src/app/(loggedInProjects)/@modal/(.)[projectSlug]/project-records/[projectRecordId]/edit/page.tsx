import { ProjectRecordEditModalClient } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordEditModalClient"
import { invoke } from "@/src/blitz-server"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"

export default async function ProjectRecordEditModalPage({
  params,
}: {
  params: { projectSlug: string; projectRecordId: string }
}) {
  if (!/^\d+$/.test(params.projectRecordId)) return null

  const projectRecord = await invoke(getProjectRecord, {
    projectSlug: params.projectSlug,
    id: Number(params.projectRecordId),
  })

  return <ProjectRecordEditModalClient initialProjectRecord={projectRecord} />
}
