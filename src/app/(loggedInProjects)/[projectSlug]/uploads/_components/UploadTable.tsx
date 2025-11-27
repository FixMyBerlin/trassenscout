"use client"

import { DeleteUploadButton } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/DeleteUploadButton"
import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { uploadUrl } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadUrl"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/core/components/text/titles"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import {
  subsectionDashboardRoute,
  subsubsectionDashboardRoute,
} from "@/src/core/routes/subsectionRoutes"
import { uploadEditRoute } from "@/src/core/routes/uploadRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { Prettify } from "@/src/core/types"
import { formatBerlinTime } from "@/src/core/utils/formatBerlinTime"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { MapPinIcon } from "@heroicons/react/24/outline"
import { PromiseReturnType } from "blitz"

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

  return (
    <tr>
      <td className="py-4 pr-3 pl-4 text-sm sm:pl-6">
        <div className="flex items-center gap-3">
          <UploadPreviewClickable
            uploadId={upload.id}
            projectSlug={projectSlug}
            size="table"
            editUrl={uploadEditRoute(projectSlug, upload.id)}
            onDeleted={onDelete}
          />
          <span className="text-sm text-gray-900">{upload.title || "-"}</span>
        </div>
        <div className="flex flex-col">
          {upload.summary && (
            <details className="mt-2 mb-1">
              <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                Zusammenfassung
              </summary>
              <div className="mt-1 text-xs whitespace-normal text-gray-700">
                <Markdown className="prose-sm" markdown={upload.summary} />
              </div>
            </details>
          )}
        </div>
      </td>
      <td className="px-3 py-4 text-center text-sm">
        {hasLocation && <MapPinIcon className="h-4 w-4 text-gray-400" title="Ist Geolokalisiert" />}
      </td>
      <td className="px-3 py-4 text-sm text-gray-500">
        <div className="whitespace-nowrap">
          {formatBerlinTime(upload.createdAt, "dd.MM.yyyy, HH:mm")}
        </div>
        {upload.createdBy && <>von {getFullname(upload.createdBy)}</>}
      </td>
      {withRelations && (
        <td className="px-3 py-4 text-sm text-gray-500">
          <ul className="flex flex-col gap-1">
            {upload.subsection && (
              <li>
                <Link href={subsectionDashboardRoute(projectSlug, upload.subsection.slug)}>
                  Planungsabschnitt: {upload.subsection.start}–{upload.subsection.end}
                </Link>
              </li>
            )}
            {upload.Subsubsection && (
              <li>
                <Link
                  href={subsubsectionDashboardRoute(
                    projectSlug,
                    upload.Subsubsection.subsection.slug,
                    upload.Subsubsection.slug,
                  )}
                >
                  Eintrag: {shortTitle(upload.Subsubsection.slug)}
                </Link>
              </li>
            )}
            {upload.projectRecords &&
              upload.projectRecords.length > 0 &&
              upload.projectRecords.map((projectRecord) => (
                <li key={projectRecord.id}>
                  <Link href={projectRecordDetailRoute(projectSlug, projectRecord.id)}>
                    Protokoll: {projectRecord.title}
                  </Link>
                </li>
              ))}
          </ul>
        </td>
      )}
      <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
        <ButtonWrapper className="justify-end">
          <Link blank icon="download" href={uploadUrl(upload, projectSlug)}>
            Download
          </Link>
          {withAction && (
            <IfUserCanEdit>
              <Link icon="edit" href={uploadEditRoute(projectSlug, upload.id)}>
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
