"use client"

import { uploadUrl } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadUrl"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { Prettify } from "@/src/core/types"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { PaperClipIcon } from "@heroicons/react/20/solid"
import { PromiseReturnType } from "blitz"
import { MimeTypePill } from "./MimeTypePill"

type Props = Prettify<
  Pick<PromiseReturnType<typeof getUploadsWithSubsections>, "uploads"> & {
    withAction?: boolean
    withSubsectionColumn?: boolean
  }
>

export const UploadTable = ({ uploads, withAction = true, withSubsectionColumn = true }: Props) => {
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
              Hochgeladen
            </th>
            {withSubsectionColumn && (
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Planungsabschnitt
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
          {uploads.map((upload) => {
            return (
              <tr key={upload.id}>
                <td className="py-4 pr-3 pl-4 text-sm sm:pl-6">
                  <Link blank href={uploadUrl(upload)} className="flex items-center gap-2">
                    <PaperClipIcon className="h-6 w-6 text-gray-500" />
                    <MimeTypePill mimeType={upload.mimeType} />
                    <strong className="font-semibold">{upload.title}</strong>
                  </Link>
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
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  {upload.createdAt.toLocaleDateString()}
                </td>
                {withSubsectionColumn && (
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {upload.subsection && `${upload.subsection.start}–${upload.subsection.end}`}
                  </td>
                )}
                <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                  <ButtonWrapper className="justify-end">
                    <Link blank icon="download" href={uploadUrl(upload)}>
                      Download
                    </Link>
                    {withAction && (
                      <IfUserCanEdit>
                        <Link icon="edit" href={`/${projectSlug}/uploads/${upload.id}/edit`}>
                          Bearbeiten
                        </Link>
                        <Link icon="delete" href={`/${projectSlug}/uploads/${upload.id}`}>
                          Löschen
                        </Link>
                      </IfUserCanEdit>
                    )}
                  </ButtonWrapper>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </TableWrapper>
  )
}
