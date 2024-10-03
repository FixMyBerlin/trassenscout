import { Breadcrumb } from "@/src/app/admin/_components/Breadcrumb"
import { HeaderWrapper } from "@/src/app/admin/_components/HeaderWrapper"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links/Link"
import getProjects from "@/src/server/projects/queries/getProjects"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Projekte" }

export default async function AdminProjectSubsectionsPage() {
  const { projects } = await invoke(getProjects, {})
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/projects", name: "Projekte" },
          ]}
        />
      </HeaderWrapper>

      <ul>
        {projects.map((project) => {
          return (
            <li key={project.id}>
              <h2>{project.slug}</h2>
              <Link button href={`/admin/projects/${project.slug}/subsections`}>
                Planungsabschnitte
              </Link>
              <pre>{JSON.stringify(project, undefined, 2)}</pre>
            </li>
          )
        })}
      </ul>
    </>
  )
}
