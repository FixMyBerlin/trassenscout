import { Routes, useParam } from "@blitzjs/next"
import { PaperClipIcon } from "@heroicons/react/20/solid"
import { PromiseReturnType } from "blitz"
import { TableWrapper } from "src/core/components/Table/TableWrapper"
import { Link } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { ZeroCase } from "src/core/components/text/ZeroCase"
import { Prettify } from "src/core/types"
import getUploadsWithSubsections from "../queries/getUploadsWithSubsections"
import { uploadUrl } from "../utils"

type Props = Prettify<
  Pick<PromiseReturnType<typeof getUploadsWithSubsections>, "uploads"> & {
    withAction?: boolean
  }
>

export const UploadTable: React.FC<Props> = ({ uploads, withAction = true }) => {
  const projectSlug = useParam("projectSlug", "string")

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
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Titel
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Hochgeladen
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Planungsabschnitt
            </th>
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
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <Link blank href={uploadUrl(upload)} className="flex items-center gap-2">
                    <PaperClipIcon className="h-6 w-6 text-gray-500" />
                    <strong className="font-semibold">{upload.title}</strong>
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {upload.createdAt.toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {upload.subsection && `${upload.subsection.start}–${upload.subsection.end}`}
                </td>
                <td className="whitespace-nowrap py-4 text-sm font-medium sm:pr-6">
                  <ButtonWrapper className="justify-end">
                    <Link blank icon="download" href={uploadUrl(upload)}>
                      Download
                    </Link>
                    {withAction && (
                      <>
                        <Link
                          icon="edit"
                          href={Routes.EditUploadPage({
                            projectSlug: projectSlug!,
                            uploadId: upload.id,
                          })}
                        >
                          Bearbeiten
                        </Link>
                        <Link
                          icon="delete"
                          href={Routes.ShowUploadPage({
                            projectSlug: projectSlug!,
                            uploadId: upload.id,
                          })}
                        >
                          Löschen
                        </Link>
                      </>
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
