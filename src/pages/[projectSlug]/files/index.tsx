import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
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
import getFiles from "src/files/queries/getFiles"

const ITEMS_PER_PAGE = 100

export const FilesWithData = () => {
  const router = useRouter()
  const sectionSlug = useParam("sectionSlug", "string")
  const projectSlug = useParam("projectSlug", "string")
  const page = Number(router.query.page) || 0
  const [{ files, hasMore }] = usePaginatedQuery(getFiles, {
    projectSlug: projectSlug!,
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <FileTable files={files} />

      <ButtonWrapper>
        <Link
          button="blue"
          icon="plus"
          href={Routes.UploadFilePage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })}
        >
          Datei hochladen
        </Link>
        <Link
          button="white"
          icon="plus"
          href={Routes.NewFilePage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })}
        >
          Externer Dokumentenlink
        </Link>
      </ButtonWrapper>

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />

      <SuperAdminLogData data={files} />
    </>
  )
}

const FilesPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Dokumente" />
      <PageHeader
        title="Dokumente"
        description="Dieser Bereich hilft Ihnen Dokumente zu verwalten."
      />

      <Suspense fallback={<Spinner page />}>
        <FilesWithData />
      </Suspense>
    </LayoutRs>
  )
}

export default FilesPage
