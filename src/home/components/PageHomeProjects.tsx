import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { Pagination } from "src/core/components/Pagination"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getProjects from "src/projects/queries/getProjects"

const ITEMS_PER_PAGE = 100

const ProjectsList = () => {
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
      <h1>Alle Radschnellverbindungen</h1>

      <SuperAdminBox>
        <p>
          <Link href={Routes.NewProjectPage()}>Radschnellverbindung erstellen</Link>
        </p>
      </SuperAdminBox>

      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={Routes.ShowProjectPage({ projectId: project.id })}>{project.name}</Link>
          </li>
        ))}
      </ul>

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />
    </>
  )
}

const PageHomeProjects = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title="Projects" />

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <ProjectsList />
      </Suspense>
    </LayoutArticle>
  )
}

export default PageHomeProjects
