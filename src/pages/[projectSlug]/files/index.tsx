import { BlitzPage, Routes, useParam, useRouterQuery } from "@blitzjs/next"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Pagination } from "src/core/components/Pagination"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FileTable } from "src/files/components/FileTable"
import getFiles from "src/files/queries/getFilesWithSubsections"
import getSectionsIncludeSubsections from "src/sections/queries/getSectionsIncludeSubsections"

const ITEMS_PER_PAGE = 100

export const FilesWithData = () => {
  const projectSlug = useParam("projectSlug", "string")
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ files, hasMore }] = usePaginatedQuery(getFiles, {
    projectSlug: projectSlug!,
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const [{ sections: sectionsWithSubsections }] = useQuery(getSectionsIncludeSubsections, {
    where: { project: { slug: projectSlug! } },
  })

  const selectOptions: [number, string, number][] = [
    [0, `Alle Dateien (${files.length})`, files.length],
  ]
  sectionsWithSubsections.forEach((s) =>
    s.subsections.forEach((ss) => {
      const count = files.filter((f) => f.subsectionId === ss.id).length
      selectOptions.push([ss.id, `${s.title}: ${ss.start}–${ss.end} (${count})`, count])
    })
  )

  // We use the URL param `filterSubsectionId` to filter the UI
  // Docs: https://blitzjs.com/docs/route-params-query#use-router-query
  const params = useRouterQuery()
  const filteredFiles = params.filterSubsectionId
    ? files.filter(
        (f) =>
          typeof params.filterSubsectionId === "string" &&
          f.subsectionId === parseInt(params.filterSubsectionId)
      )
    : files

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
            Routes.FilesPage({
              projectSlug: projectSlug!,
              ...(sectionOrNull ? { filterSubsectionId: sectionOrNull } : {}),
            })
          )
        }}
        className="mb-5 mt-2 block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
      >
        {selectOptions.map(([subsectionId, name, count]) => {
          return (
            <option key={subsectionId} value={subsectionId} disabled={!count}>
              {name}
            </option>
          )
        })}
      </select>

      <FileTable files={filteredFiles} />

      <ButtonWrapper className="mt-5">
        <Link button="blue" icon="plus" href={Routes.UploadFilePage({ projectSlug: projectSlug! })}>
          Datei hochladen
        </Link>
      </ButtonWrapper>

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />

      <SuperAdminLogData data={{ files, filteredFiles }} />
    </>
  )
}

const FilesPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Dokumente" />
      <PageHeader
        title="Dokumente"
        description="Dokumente und Grafiken hochladen und bei Bedarf mit einem Planungsabschnitt verknüpfen."
      />

      <Suspense fallback={<Spinner page />}>
        <FilesWithData />
      </Suspense>
    </LayoutRs>
  )
}

export default FilesPage
