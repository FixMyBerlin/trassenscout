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

export const Project = () => {
  const router = useRouter()
  const projectId = useParam("projectId", "number")
  const [deleteProjectMutation] = useMutation(deleteProject)
  const [project] = useQuery(getProject, { id: projectId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${project.id} unwiderruflich löschen?`)) {
      await deleteProjectMutation({ id: project.id })
      await router.push(Routes.ProjectsPage())
    }
  }

  return (
    <>
      <h1>Project {quote(project.id)}</h1>
      <pre>{JSON.stringify(project, null, 2)}</pre>

      <Link href={Routes.EditProjectPage({ projectId: project.id })}>Bearbeiten</Link>

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
        Löschen
      </button>
    </>
  )
}

const ShowProjectPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title={`Project ${quote(project.id)}`} />

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <Project />
      </Suspense>

      <p>
        <Link href={Routes.ProjectsPage()}>Alle Projects</Link>
      </p>
    </LayoutArticle>
  )
}

ShowProjectPage.authenticate = true

export default ShowProjectPage
