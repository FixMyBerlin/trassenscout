import { Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { Pagination } from "src/core/components/Pagination"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getFiles from "src/files/queries/getFiles"

const ITEMS_PER_PAGE = 100

export const FilesList = () => {
  const router = useRouter()
  const sectionSlug = useParam("sectionSlug", "string")
  const projectSlug = useParam("projectSlug", "string")
  const page = Number(router.query.page) || 0
  const [{ files, hasMore }] = usePaginatedQuery(getFiles, {
    where: { project: { slug: projectSlug! } },
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
        <Link href={Routes.NewFilePage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })}>
          File erstellen
        </Link>
      </p>

      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <Link
              href={Routes.ShowFilePage({
                projectSlug: projectSlug!,
                sectionSlug: sectionSlug,
                fileId: file.id,
              })}
            >
              {file.title}
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

const FilesPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Files" />

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <FilesList />
      </Suspense>
    </LayoutRs>
  )
}

export default FilesPage
