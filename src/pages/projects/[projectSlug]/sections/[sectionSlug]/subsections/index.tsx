import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getSubsections from "src/subsections/queries/getSubsections"
import { Link } from "src/core/components/links"
import { Pagination } from "src/core/components/Pagination"

const ITEMS_PER_PAGE = 100

export const SubsectionsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const [{ subsections, hasMore }] = usePaginatedQuery(getSubsections, {
    where: { section: { slug: sectionSlug! } },
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <ul>
        {subsections.map((subsection) => (
          <li key={subsection.id}>
            <Link
              href={Routes.ShowSubsectionPage({
                projectSlug: projectSlug!,
                sectionSlug: sectionSlug!,
                subsectionSlug: subsection.slug,
              })}
            >
              {subsection.name}
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

const SubsectionsPage = () => {
  const sectionSlug = useParam("sectionSlug", "string")

  return (
    <LayoutArticle>
      <MetaTags noindex title="Abschnitte" />

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <SubsectionsList />
      </Suspense>
    </LayoutArticle>
  )
}

export default SubsectionsPage
