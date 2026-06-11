"use client"

import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadTable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadTable"
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
          { projectRecordEmailId: null },
          { projectRecords: { none: {} } },
          { subsubsections: { none: {} } },
          { acquisitionAreas: { none: {} } },
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

      <UploadTable withAction withRelations={true} uploads={uploads} />

      <SuperAdminBox>
        <strong>Hinweis:</strong> Uploads, die ausschließlich mit Eingaben verknüpft sind, werden in
        dieser Übersicht nicht angezeigt. Diese Uploads sind nur über den jeweiligen Eingabe
        zugänglich.
      </SuperAdminBox>
    </>
  )
}
