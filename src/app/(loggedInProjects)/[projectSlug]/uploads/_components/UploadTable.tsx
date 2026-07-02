"use client"

import { DeleteUploadButton } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/DeleteUploadButton"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { UploadVerknuepfungen } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadVerknuepfungen"
import { uploadUrl } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadUrl"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { useModalNavigationGuard } from "@/src/core/components/Modal/useModalNavigationGuard"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { Tooltip } from "@/src/core/components/Tooltip/Tooltip"
import { uploadEditRoute } from "@/src/core/routes/uploadRoutes"
import { useCurrentReturnTo } from "@/src/core/routes/useCurrentPathWithSearch"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { Prettify } from "@/src/core/types"
import { formatBerlinTime } from "@/src/core/utils/formatBerlinTime"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { MapPinIcon, UserGroupIcon } from "@heroicons/react/24/outline"
import { PromiseReturnType } from "blitz"

// NOTE:
// This version of "IfUserCanEdit" currently only works in the Next.js app directory.
// Reason: it relies on app router features.
// We'll leave this page as-is for now and plan to migrate all remaining pages to the app dir soon.

type Props = Prettify<
  Pick<PromiseReturnType<typeof getUploadsWithSubsections>, "uploads"> & {
    withAction?: boolean
    withRelations: boolean
    onDelete?: () => Promise<void>
  }
>

export const UploadTable = ({ uploads, withAction = true, withRelations, onDelete }: Props) => {
  const projectSlug = useProjectSlug()

  if (!uploads.length) {
    return <ZeroCase visible={uploads.length} name="Dokumente" />
  }

  return (
    <TableWrapper>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Titel
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              <span className="sr-only">Standort</span>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Hochgeladen
            </th>
            {withRelations && (
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Verknüpfungen
              </th>
            )}
            <th
              scope="col"
              className="px-3 py-4 text-right text-sm font-semibold text-gray-900 sm:pr-6"
            >
              <span className="sr-only">Aktionen</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {uploads.map((upload) => (
            <UploadTableRow
              key={upload.id}
              upload={upload}
              projectSlug={projectSlug}
              withAction={withAction}
              withRelations={withRelations}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </TableWrapper>
  )
}

const UploadTableRow = ({
  upload,
  projectSlug,
  withAction,
  withRelations,
  onDelete,
}: {
  upload: PromiseReturnType<typeof getUploadsWithSubsections>["uploads"][number]
  projectSlug: string
  withAction: boolean
  withRelations: boolean
  onDelete?: () => Promise<void>
}) => {
  const hasLocation = upload.latitude !== null && upload.longitude !== null
  const navigationGuard = useModalNavigationGuard()
  const returnTo = useCurrentReturnTo()
  const editUrl = uploadEditRoute(projectSlug, upload.id, { returnTo })
  const handleEditClick = () => {
    navigationGuard.beginNavigationToModal({ holdUntilNextModalMount: true })
  }
  return (
    <tr>
      <td className="py-2 pr-3 pl-4 text-sm sm:pl-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="-mt-0.5 -mb-0.5 -ml-1">
            <UploadPreviewClickable
              uploadId={upload.id}
              upload={upload}
              projectSlug={projectSlug}
              size="table"
              editUrl={editUrl}
              onDeleted={onDelete}
            />
          </div>
          <span
            className="max-w-xs min-w-0 truncate text-sm text-gray-900"
            title={upload.title || undefined}
          >
            {upload.title || "-"}
          </span>
        </div>
      </td>
      <td className="px-1.5 py-2 text-sm">
        {hasLocation && (
          <div className="flex items-center justify-center">
            <Tooltip content="Ist Geolokalisiert">
              <MapPinIcon className="size-4 text-gray-400" />
            </Tooltip>
          </div>
        )}
      </td>
      <td className="px-3 py-2 text-sm text-gray-500">
        <div className="whitespace-nowrap">
          {formatBerlinTime(upload.createdAt, "dd.MM.yyyy, HH:mm")}
        </div>
        {upload.createdBy && (
          <span
            className="inline-block max-w-[150px] truncate"
            title={getFullname(upload.createdBy) || undefined}
          >
            {getFullname(upload.createdBy)}
          </span>
        )}
      </td>
      {withRelations && (
        <td className="px-3 py-2 text-sm text-gray-500">
          <UploadVerknuepfungen
            projectSlug={projectSlug}
            landAcquisitionModuleEnabled={upload.project?.landAcquisitionModuleEnabled ?? false}
            subsubsections={upload.subsubsections}
            acquisitionAreas={upload.acquisitionAreas}
            projectRecords={upload.projectRecords}
            projectRecordEmail={upload.projectRecordEmail}
            surveyResponse={null}
          />
        </td>
      )}
      <td className="py-2 text-sm font-medium whitespace-nowrap sm:pr-6">
        <ButtonWrapper className="justify-end">
          {upload.collaborationUrl && (
            <Link
              blank
              button
              href={upload.collaborationUrl}
              icon={<UserGroupIcon className="size-4 text-yellow-400" />}
              className="px-3 py-2 text-sm"
            >
              Kollaboration
            </Link>
          )}
          {!upload.collaborationUrl && (
            <Link blank icon="download" href={uploadUrl(upload, projectSlug)}>
              Download
            </Link>
          )}
          {withAction && (
            <IfUserCanEdit>
              <Link icon="edit" href={editUrl} prefetch scroll={false} onClick={handleEditClick}>
                Bearbeiten
              </Link>
              {onDelete && (
                <DeleteUploadButton
                  projectSlug={projectSlug}
                  uploadId={upload.id}
                  uploadTitle={upload.title}
                  onDeleted={onDelete}
                />
              )}
            </IfUserCanEdit>
          )}
        </ButtonWrapper>
      </td>
    </tr>
  )
}
