"use client"

import { UploadTable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadTable"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Pagination } from "@/src/core/components/Pagination"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { shortTitle } from "@/src/core/components/text"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { SubsectionWithPosition } from "@/src/server/subsections/queries/getSubsection"

import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { PromiseReturnType } from "blitz"
import { useRouter } from "next/navigation"

type Props = {
  uploads: PromiseReturnType<typeof getUploadsWithSubsections>["uploads"]
  subsections: SubsectionWithPosition[]
  hasMore: boolean
  page: number
  projectSlug: string
  filterSubsectionId?: string
}

export const UploadsTableWithFilter = ({
  uploads,
  subsections,
  hasMore,
  page,
  projectSlug,
  filterSubsectionId,
}: Props) => {
  const router = useRouter()

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

      <UploadTable uploads={filteredUploads} />

      <IfUserCanEdit>
        <ButtonWrapper className="mt-5">
          <Link button="blue" icon="plus" href={`/${projectSlug}/uploads/new`}>
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
