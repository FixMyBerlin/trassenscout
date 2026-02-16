"use client"

import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadsTableWithFilter } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadsTableWithFilter"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { useQuery } from "@blitzjs/rpc"
import { useSearchParams } from "next/navigation"

const ITEMS_PER_PAGE = 100

export const UploadsPageContent = () => {
  const projectSlug = useProjectSlug()
  const searchParams = useSearchParams()
  const page = Number(searchParams?.get("page")) || 0

  const [{ uploads, hasMore }, { refetch: refetchUploads }] = useQuery(getUploadsWithSubsections, {
    projectSlug,
  })

  return (
    <>
      <div className="mt-8">
        <UploadDropzone
          onUploadComplete={async (uploadIds) => {
            await refetchUploads()
          }}
        />
      </div>
      <UploadsTableWithFilter
        uploads={uploads}
        hasMore={hasMore}
        page={page}
        onDelete={async () => {
          await refetchUploads()
        }}
      />
    </>
  )
}
