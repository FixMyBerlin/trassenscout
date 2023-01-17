import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getSections from "src/sections/queries/getSections"
import { Link } from "src/core/components/links"
import { Pagination } from "src/core/components/Pagination"

const ITEMS_PER_PAGE = 100

export const SectionsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const projectSlug = useParam("projectSlug", "string")
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
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <Link
              href={Routes.ShowSectionPage({
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
    </>
  )
}

const SectionsPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutArticle>
      <MetaTags noindex title="Sections" />

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <SectionsList />
      </Suspense>
    </LayoutArticle>
  )
}

export default SectionsPage
