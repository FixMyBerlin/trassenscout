import { MapPinIcon, UserGroupIcon } from "@heroicons/react/24/outline"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { useIsInsideModal } from "@/src/components/core/components/Modal"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { useCurrentReturnTo } from "@/src/components/core/routes/useCurrentPathWithSearch"
import { Prettify } from "@/src/components/core/types"
import { getFullname } from "@/src/components/core/users/getFullname"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import { ProjectRecordTagsList } from "@/src/components/project-records/ProjectRecordTagsList"
import { IfUserCanEdit } from "@/src/components/shared/memberships/IfUserCan"
import { DeleteUploadButton } from "@/src/components/uploads/DeleteUploadButton"
import { useProjectUploadModal } from "@/src/components/uploads/ProjectUploadModalHost"
import { UploadPreviewClickable } from "@/src/components/uploads/UploadPreviewClickable"
import { UploadVerknuepfungen } from "@/src/components/uploads/UploadVerknuepfungen"
import { isPdf } from "@/src/components/uploads/utils/getFileType"
import { uploadDownloadUrl, uploadUrl } from "@/src/components/uploads/utils/uploadUrl"
import { getFilenameFromS3 } from "@/src/shared/uploads/url"
import type { UploadEditLink, UploadTableUpload } from "./uploadTypes"

/**
 * Column width classes for `table-fixed` layout. Adjust percentages here only.
 * Narrow containers show icon, title, and source (when enabled); `@xl` reveals the rest.
 */
const uploadTableColWidths = {
  icon: "w-[14%] @xl:w-[5%]",
  title: {
    default: "min-w-0 w-[86%] @xl:w-[24%]",
    withSource: "min-w-0 w-[54%] @xl:w-[24%]",
  },
  location: "hidden @xl:table-column @xl:w-[4%]",
  uploaded: "hidden @xl:table-column @xl:w-[16%]",
  tags: "hidden @xl:table-column @xl:w-[18%]",
  source: "w-[16%] @xl:w-[8%]",
  relations: "hidden @xl:table-column @xl:w-[18%]",
  actions: "hidden @xl:table-column @xl:w-[14%]",
} as const

type Props = Prettify<{
  // Passed as a prop (not read from the route) so the table also works outside
  // `/_loggedInProjects/$projectSlug`, e.g. on admin routes
  projectSlug: string
  uploads: UploadTableUpload[]
  withAction?: boolean
  withRelations: boolean
  withSource?: boolean
  withTags?: boolean
  onDelete?: (uploadId: number) => Promise<void>
  /** Omit top border when flush under PageHeader. */
  flushTop?: boolean
}>

export const UploadTable = ({
  projectSlug,
  uploads,
  withAction = true,
  withRelations,
  withSource = false,
  withTags = true,
  onDelete,
  flushTop = false,
}: Props) => {
  if (!uploads.length) {
    return <ZeroCase small visible={uploads.length} name="Dokumente" verb="hochgeladen" />
  }

  const spaceClasses = "px-3 py-2"

  return (
    <TableWrapper flushTop={flushTop}>
      <div className="@container w-full">
        <table className="min-w-full table-fixed border-collapse text-left text-sm text-gray-700">
          <colgroup>
            <col className={uploadTableColWidths.icon} />
            <col
              className={
                withSource
                  ? uploadTableColWidths.title.withSource
                  : uploadTableColWidths.title.default
              }
            />
            <col className={uploadTableColWidths.location} />
            <col className={uploadTableColWidths.uploaded} />
            {withTags && <col className={uploadTableColWidths.tags} />}
            {withSource && <col className={uploadTableColWidths.source} />}
            {withRelations && <col className={uploadTableColWidths.relations} />}
            <col className={uploadTableColWidths.actions} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
              <th scope="col" className={twJoin(spaceClasses, "sr-only font-medium")}>
                Vorschau
              </th>
              <th scope="col" className={twJoin(spaceClasses, "font-medium uppercase")}>
                Titel
              </th>
              <th
                scope="col"
                className={twJoin(spaceClasses, "hidden font-medium uppercase @xl:table-cell")}
              >
                <span className="sr-only">Standort</span>
              </th>
              <th
                scope="col"
                className={twJoin(spaceClasses, "hidden font-medium uppercase @xl:table-cell")}
              >
                Hochgeladen
              </th>
              {withTags && (
                <th
                  scope="col"
                  className={twJoin(spaceClasses, "hidden font-medium uppercase @xl:table-cell")}
                >
                  Tags
                </th>
              )}
              {withSource && (
                <th scope="col" className={twJoin(spaceClasses, "font-medium uppercase")}>
                  Quelle
                </th>
              )}
              {withRelations && (
                <th
                  scope="col"
                  className={twJoin(spaceClasses, "hidden font-medium uppercase @xl:table-cell")}
                >
                  Verknüpfungen
                </th>
              )}
              <th
                scope="col"
                className={twJoin(spaceClasses, "hidden text-right font-medium @xl:table-cell")}
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
                withSource={withSource}
                withTags={withTags}
                onDelete={onDelete}
                spaceClasses={spaceClasses}
              />
            ))}
          </tbody>
        </table>
      </div>
    </TableWrapper>
  )
}

const UploadTableRow = ({
  upload,
  projectSlug,
  withAction,
  withRelations,
  withSource,
  withTags,
  onDelete,
  spaceClasses,
}: {
  upload: UploadTableUpload
  projectSlug: string
  withAction: boolean
  withRelations: boolean
  withSource: boolean
  withTags: boolean
  onDelete?: (uploadId: number) => Promise<void>
  spaceClasses: string
}) => {
  const hasLocation = upload.latitude !== null && upload.longitude !== null
  const projectUploadModal = useProjectUploadModal()
  const insideModal = useIsInsideModal()
  // When the table is nested in another modal we keep the whole upload flow
  // (preview *and* edit) local so the surrounding modal stays open; otherwise the
  // hosted edit link would navigate and collapse it.
  const useHostedUploadModal = !insideModal
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
    <tr className="border-b border-gray-100">
      <td className={twJoin(spaceClasses, "align-top")}>
        <UploadPreviewClickable
          uploadId={upload.id}
          upload={upload}
          projectSlug={projectSlug}
          size="table"
          editLink={editLink}
          onDeleted={handleDelete}
        />
      </td>
      <td className={twJoin(spaceClasses, "min-w-0 align-top")}>
        {isUploadPdf ? (
          <Link
            to="/$projectSlug/uploads/$uploadId/view"
            params={{ projectSlug, uploadId: String(upload.id) }}
            className="block min-w-0 break-all"
            title={filename || undefined}
          >
            {filename || "-"}
          </Link>
        ) : (
          <Link
            blank
            href={upload.collaborationUrl ?? uploadUrl(upload, projectSlug)}
            className="block min-w-0 break-all"
            title={filename || undefined}
          >
            {filename || "-"}
          </Link>
        )}
      </td>
      <td className={twJoin("hidden align-top @xl:table-cell", spaceClasses)}>
        {hasLocation && (
          <div className="flex items-center justify-center">
            <Tooltip content="Ist Geolokalisiert">
              <MapPinIcon className="size-4 text-gray-400" />
            </Tooltip>
          </div>
        )}
      </td>
      <td className={twJoin("hidden align-top text-gray-500 @xl:table-cell", spaceClasses)}>
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
      {withTags && (
        <td className={twJoin("hidden align-top text-gray-500 @xl:table-cell", spaceClasses)}>
          <ProjectRecordTagsList tags={"tags" in upload ? upload.tags : []} />
        </td>
      )}
      {withSource && (
        <td className={twJoin("align-top whitespace-nowrap text-gray-500", spaceClasses)}>
          {upload.source ?? "-"}
        </td>
      )}
      {withRelations && (
        <td className={twJoin("hidden align-top text-gray-500 @xl:table-cell", spaceClasses)}>
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
      <td
        className={twJoin(
          "hidden align-top text-sm font-medium whitespace-nowrap @xl:table-cell",
          spaceClasses,
        )}
      >
        <div className="flex flex-col items-end gap-1">
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
            <Link icon="download" href={uploadDownloadUrl(upload, projectSlug)}>
              Download
            </Link>
          )}
          {withAction && (
            <IfUserCanEdit>
              <Link
                icon="edit"
                to={
                  useHostedUploadModal
                    ? projectUploadModal.getUploadEditHref({ uploadId: upload.id })
                    : editLink.to
                }
                params={useHostedUploadModal ? undefined : editLink.params}
                search={useHostedUploadModal ? undefined : editLink.search}
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
        </div>
      </td>
    </tr>
  )
}
