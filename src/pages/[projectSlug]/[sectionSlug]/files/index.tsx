import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getFiles from "src/files/queries/getFiles"
import { Link } from "src/core/components/links"
import { Pagination } from "src/core/components/Pagination"

const ITEMS_PER_PAGE = 100

export const FilesList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ files, hasMore }] = usePaginatedQuery(getFiles, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <h1>Files</h1>

      <p>
        <Link href={Routes.NewFilePage()}>File erstellen</Link>
      </p>

      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <Link href={Routes.ShowFilePage({ fileId: file.id })}>{file.title}</Link>
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

const FilesPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title="Files" />

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <FilesList />
      </Suspense>
    </LayoutArticle>
  )
}

export default FilesPage
