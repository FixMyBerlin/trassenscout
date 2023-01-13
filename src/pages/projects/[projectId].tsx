import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getProject from "src/projects/queries/getProject"
import deleteProject from "src/projects/mutations/deleteProject"
import { Link, linkStyles } from "src/core/components/links"
import clsx from "clsx"
import { quote } from "src/core/components/text"
import { SuperAdminBox } from "src/core/components/AdminBox"

export const Project = () => {
  const router = useRouter()
  const projectId = useParam("projectId", "number")
  const [deleteProjectMutation] = useMutation(deleteProject)
  const [project] = useQuery(getProject, { id: projectId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${project.id} unwiderruflich löschen?`)) {
      await deleteProjectMutation({ id: project.id })
      await router.push(Routes.Home())
    }
  }

  return (
    <>
      <MetaTags noindex title={`Radschnellverbindung ${project.name}`} />

      <h1>Project {quote(project.name)}</h1>
      <pre>{JSON.stringify(project, null, 2)}</pre>
      <SuperAdminBox>
        <Link href={Routes.EditProjectPage({ projectId: project.id })}>Bearbeiten</Link>
        <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
          Löschen
        </button>
      </SuperAdminBox>
    </>
  )
}

const ShowProjectPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <Project />
      </Suspense>

      <p>
        <Link href={Routes.Home()}>Alle Projects</Link>
      </p>
    </LayoutArticle>
  )
}

ShowProjectPage.authenticate = true

export default ShowProjectPage
