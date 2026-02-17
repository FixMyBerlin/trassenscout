"use client"

import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadsTableWithFilter } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadsTableWithFilter"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
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
    // Filter out uploads that are ONLY related to survey responses
    where: {
      NOT: {
        AND: [
          { surveyResponseId: { not: null } },
          { subsectionId: null },
          { subsubsectionId: null },
          { projectRecordEmailId: null },
          { projectRecords: { none: {} } },
        ],
      },
    },
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
      <SuperAdminBox>
        <strong>Hinweis:</strong> Uploads, die ausschließlich mit Beteiligungsbeiträgen verknüpft
        sind, werden in dieser Übersicht nicht angezeigt. Diese Uploads sind nur über den jeweiligen
        Beteiligungsbeitrag zugänglich.
      </SuperAdminBox>
    </>
  )
}
