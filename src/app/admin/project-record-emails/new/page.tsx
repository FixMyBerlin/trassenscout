import { invoke } from "@/src/blitz-server"
import getProjects from "@/src/server/projects/queries/getProjects"
import "server-only"
import { NewProjectRecordEmailPage } from "./NewProjectRecordEmailPage"

export default async function Page() {
  const { projects } = await invoke(getProjects, {})

  return <NewProjectRecordEmailPage projects={projects} />
}
