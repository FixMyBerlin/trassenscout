import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Pagination } from "@/src/core/components/Pagination"
import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { shortTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { UploadTable } from "@/src/pagesComponents/uploads/UploadTable"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getUploads from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { BlitzPage, Routes, useRouterQuery } from "@blitzjs/next"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const ITEMS_PER_PAGE = 100

export const UploadsWithData = () => {
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ uploads, hasMore }] = usePaginatedQuery(getUploads, {
    projectSlug,
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const [{ subsections }] = useQuery(getSubsections, { projectSlug })

  const selectOptions: [number, string, number][] = [
    [0, `Alle Dateien (${uploads.length})`, uploads.length],
  ]
  subsections.forEach((ss) => {
    const count = uploads.filter((f) => f.subsectionId === ss.id).length
    selectOptions.push([ss.id, `${shortTitle(ss.slug)} – ${ss.start}–${ss.end} (${count})`, count])
  })

  // We use the URL param `filterSubsectionId` to filter the UI
  // Docs: https://blitzjs.com/docs/route-params-query#use-router-query
  const params = useRouterQuery()
  const filteredUploads = params.filterSubsectionId
    ? uploads.filter(
        (f) =>
          typeof params.filterSubsectionId === "string" &&
          f.subsectionId === parseInt(params.filterSubsectionId),
      )
    : uploads

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <select
        id="filterSubsectionId"
        name="filterSubsectionId"
        value={params.filterSubsectionId || 0}
        onChange={(event) => {
          const sectionOrNull = parseInt(event.target.value) === 0 ? null : event.target.value
          void router.push(
            Routes.UploadsPage({
              projectSlug,
              ...(sectionOrNull ? { filterSubsectionId: sectionOrNull } : {}),
            }),
          )
        }}
        className="mt-2 mb-5 block w-80 rounded-md border-0 py-1.5 pr-10 pl-3 text-ellipsis text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
      >
        {selectOptions.map(([subsectionId, name, count]) => {
          return (
            <option key={subsectionId} value={subsectionId} disabled={!count}>
              {name}
            </option>
          )
        })}
      </select>

      <UploadTable uploads={filteredUploads} />

      <IfUserCanEdit>
        <ButtonWrapper className="mt-5">
          <Link button="blue" icon="plus" href={Routes.NewUploadPage({ projectSlug })}>
            Datei hochladen
          </Link>
        </ButtonWrapper>
      </IfUserCanEdit>

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />

      <SuperAdminLogData data={{ uploads, filteredUploads }} />
    </>
  )
}

const UploadsPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Dokumente" />
      <PageHeader
        title="Dokumente"
        description="Dokumente und Grafiken hochladen und bei Bedarf mit einem Planungsabschnitt verknüpfen."
        className="mt-12"
      />

      <Suspense fallback={<Spinner page />}>
        <UploadsWithData />
      </Suspense>
    </LayoutRs>
  )
}

UploadsPage.authenticate = true

export default UploadsPage
