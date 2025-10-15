import { invoke } from "@/src/blitz-server"
import getProjects from "@/src/server/projects/queries/getProjects"
import "server-only"
import { NewProtocolEmailPage } from "./NewProtocolEmailPage"

export default async function Page() {
  const { projects } = await invoke(getProjects, {})

  return <NewProtocolEmailPage projects={projects} />
}
