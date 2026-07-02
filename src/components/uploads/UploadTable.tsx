import { MapPinIcon, UserGroupIcon } from "@heroicons/react/24/outline"
import { getRouteApi } from "@tanstack/react-router"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link } from "@/src/components/core/components/links/Link"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { useCurrentReturnTo } from "@/src/components/core/routes/useCurrentPathWithSearch"
import { Prettify } from "@/src/components/core/types"
import { getFullname } from "@/src/components/core/users/getFullname"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import { IfUserCanEdit } from "@/src/components/shared/memberships/IfUserCan"
import { DeleteUploadButton } from "@/src/components/uploads/DeleteUploadButton"
import { useProjectUploadModal } from "@/src/components/uploads/ProjectUploadModalHost"
import { UploadPreviewClickable } from "@/src/components/uploads/UploadPreviewClickable"
import { UploadVerknuepfungen } from "@/src/components/uploads/UploadVerknuepfungen"
import { isPdf } from "@/src/components/uploads/utils/getFileType"
import { uploadUrl } from "@/src/components/uploads/utils/uploadUrl"
import { getFilenameFromS3 } from "@/src/shared/uploads/url"
import type { UploadEditLink, UploadWithRelations } from "./uploadTypes"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = Prettify<{
  uploads: UploadWithRelations[]
  withAction?: boolean
  withRelations: boolean
  onDelete?: (uploadId: number) => Promise<void>
}>

export const UploadTable = ({ uploads, withAction = true, withRelations, onDelete }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()

  if (!uploads.length) {
    return <ZeroCase small visible={uploads.length} name="Dokumente" verb="hochgeladen" />
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
              Dateiname
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
  upload: UploadWithRelations
  projectSlug: string
  withAction: boolean
  withRelations: boolean
  onDelete?: (uploadId: number) => Promise<void>
}) => {
  const hasLocation = upload.latitude !== null && upload.longitude !== null
  const projectUploadModal = useProjectUploadModal()
  const returnTo = useCurrentReturnTo()
  const editLink: UploadEditLink = {
    to: "/$projectSlug/uploads/$uploadId/edit",
    params: { projectSlug, uploadId: String(upload.id) },
    search: returnTo ? { returnTo } : undefined,
  }
  const handleDelete = onDelete
    ? async () => {
        await onDelete(upload.id)
      }
    : undefined
  const filename = getFilenameFromS3(upload.externalUrl)
  const isUploadPdf = isPdf(upload)
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
              editLink={editLink}
              onDeleted={handleDelete}
            />
          </div>
          {isUploadPdf ? (
            <Link
              to="/$projectSlug/uploads/$uploadId/view"
              params={{ projectSlug, uploadId: String(upload.id) }}
              className="min-w-0 text-sm break-all"
            >
              {filename || "-"}
            </Link>
          ) : (
            <Link
              blank
              href={upload.collaborationUrl ?? uploadUrl(upload, projectSlug)}
              className="min-w-0 text-sm break-all"
            >
              {filename || "-"}
            </Link>
          )}
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
              <Link
                icon="edit"
                to={
                  projectUploadModal
                    ? projectUploadModal.getUploadEditHref({ uploadId: upload.id })
                    : editLink.to
                }
                params={projectUploadModal ? undefined : editLink.params}
                search={projectUploadModal ? undefined : editLink.search}
                preload="intent"
                resetScroll={false}
              >
                Bearbeiten
              </Link>
              {handleDelete && (
                <DeleteUploadButton
                  projectSlug={projectSlug}
                  uploadId={upload.id}
                  uploadTitle={upload.title}
                  onDeleted={handleDelete}
                />
              )}
            </IfUserCanEdit>
          )}
        </ButtonWrapper>
      </td>
    </tr>
  )
}
