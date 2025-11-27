"use client"

import { UploadTable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadTable"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Pagination } from "@/src/core/components/Pagination"
import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { useQuery } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { useRouter, useSearchParams } from "next/navigation"

type Props = {
  uploads: PromiseReturnType<typeof getUploadsWithSubsections>["uploads"]
  hasMore: boolean
  page: number
  onDelete?: () => Promise<void>
}

export const UploadsTableWithFilter = ({ uploads, hasMore, page, onDelete }: Props) => {
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterSubsectionId = searchParams?.get("filterSubsectionId") || undefined
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })

  const selectOptions: [number, string, number][] = [
    [0, `Alle Dateien (${uploads.length})`, uploads.length],
  ]
  subsections.forEach((ss) => {
    const count = uploads.filter((f) => f.subsectionId === ss.id).length
    selectOptions.push([ss.id, `${shortTitle(ss.slug)} – ${ss.start}–${ss.end} (${count})`, count])
  })

  const filteredUploads = filterSubsectionId
    ? uploads.filter((f) => f.subsectionId === parseInt(filterSubsectionId))
    : uploads

  const goToPreviousPage = () => {
    const params = new URLSearchParams({ page: String(page - 1) })
    if (filterSubsectionId) params.set("filterSubsectionId", filterSubsectionId)
    router.push(`?${params.toString()}`)
  }

  const goToNextPage = () => {
    const params = new URLSearchParams({ page: String(page + 1) })
    if (filterSubsectionId) params.set("filterSubsectionId", filterSubsectionId)
    router.push(`?${params.toString()}`)
  }

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sectionOrNull = parseInt(event.target.value) === 0 ? null : event.target.value
    const params = new URLSearchParams()
    if (sectionOrNull) params.set("filterSubsectionId", sectionOrNull)
    router.push(`?${params.toString()}`)
  }

  return (
    <>
      <select
        id="filterSubsectionId"
        name="filterSubsectionId"
        value={filterSubsectionId || 0}
        onChange={handleFilterChange}
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

      <UploadTable withRelations={true} uploads={filteredUploads} onDelete={onDelete} />

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
