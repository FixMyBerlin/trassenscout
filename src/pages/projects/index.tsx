import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getProjects from "src/projects/queries/getProjects"
import { Link } from "src/core/components/links"
import { Pagination } from "src/core/components/Pagination"

const ITEMS_PER_PAGE = 100

export const ProjectsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ projects, hasMore }] = usePaginatedQuery(getProjects, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <h1>Projects</h1>

      <p>
        <Link href={Routes.NewProjectPage()}>Project erstellen</Link>
      </p>

      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={Routes.ShowProjectPage({ projectId: project.id })}>
              <a>{project.name}</a>
            </Link>
          </li>
        ))}
      </ul>

      <Pagination
        visible={!hasMore || page !== 0}
        disablePrev={page === 0}
        disableNext={!hasMore}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />
    </>
  )
}

const ProjectsPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title="Projects" />

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <ProjectsList />
      </Suspense>
    </LayoutArticle>
  )
}

export default ProjectsPage
