import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { Pagination } from "src/core/components/Pagination"
import { Spinner } from "src/core/components/Spinner"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getProjects from "src/projects/queries/getProjects"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"

const ITEMS_PER_PAGE = 100

const ProjectsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ projects, hasMore }] = usePaginatedQuery(getProjects, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const user = useCurrentUser()

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <p>Willkommen zurück{Boolean(user?.firstName) && `, ${user?.firstName}`}!</p>
      <h1>Alle Radschnellverbindungen</h1>

      <SuperAdminBox>
        <p>
          <Link href={Routes.AdminNewProjectPage()}>Radschnellverbindung erstellen</Link>
        </p>
      </SuperAdminBox>

      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={Routes.ProjectDashboardPage({ projectSlug: project.slug })}>
              {project.title}
            </Link>
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

      <Suspense fallback={<Spinner page />}>
        <ProjectsList />
      </Suspense>
    </LayoutArticle>
  )
}

export default PageHomeProjects
