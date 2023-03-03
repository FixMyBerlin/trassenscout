import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Pagination } from "src/core/components/Pagination"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FileTable } from "src/files/components/FileTable"
import getFiles from "src/files/queries/getFiles"

const ITEMS_PER_PAGE = 100

export const Files = () => {
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
      <PageHeader
        title="Dokumente"
        description="Dieser Bereich hilft Ihnen Dokumente zu verwalten."
        action={
        <div>
          <Link
            button
            href={Routes.NewFilePage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })}
          >
            Neues Dokument
          </Link>
          <Link className="ml-2"
            button
            href={Routes.UploadFilePage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })}
          >
            Neue Datei hochladen
          </Link>
        </div>
        }
      />
      <FileTable files={files} />

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />
    </>
  )
}

const FilesPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Dokumente" />

      <Suspense fallback={<Spinner page />}>
        <Files />
      </Suspense>
    </LayoutRs>
  )
}

export default FilesPage
