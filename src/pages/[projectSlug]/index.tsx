import { Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Pagination } from "src/core/components/Pagination"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getProject from "src/projects/queries/getProject"
import getSections from "src/sections/queries/getSections"

const ITEMS_PER_PAGE = 100

export const ProjectDashboardWithQuery = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })
  const [{ sections, hasMore }] = usePaginatedQuery(getSections, {
    where: { project: { slug: projectSlug! } },
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <MetaTags noindex title={project.name} />
      <PageHeader title={project.name} />

      <h2>Alle Teilstrecken</h2>
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <Link
              href={Routes.SectionDashboardPage({
                projectSlug: projectSlug!,
                sectionSlug: section.slug,
              })}
            >
              {section.name}
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

      <h2>Kommende Termine</h2>
      <code>todo</code>
      {/* TODO: Termine Dashboard Modul */}

      <section className="rounded border border-cyan-800 bg-cyan-100 p-5">
        <Link href={Routes.EditProjectPage({ projectSlug: projectSlug! })}>
          {project.name} bearbeiten
        </Link>

        <Link href={Routes.NewSectionPage({ projectSlug: projectSlug! })}>Neue Teilstrecke</Link>
      </section>
    </>
  )
}

const ProjectDashboardPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <ProjectDashboardWithQuery />
      </Suspense>
    </LayoutArticle>
  )
}

export default ProjectDashboardPage
