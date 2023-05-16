import { Routes, useParam } from "@blitzjs/next"
import { PaperClipIcon } from "@heroicons/react/20/solid"
import React from "react"
import { TableWrapper } from "src/core/components/Table/TableWrapper"
import { Link } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { Prettify } from "src/core/types"
import getFilesWithSubsections from "../queries/getFilesWithSubsections"

type Props = Prettify<
  Pick<Awaited<ReturnType<typeof getFilesWithSubsections>>, "files"> & {
    withAction?: boolean
  }
>

export const FileTable: React.FC<Props> = ({ files, withAction = true }) => {
  const projectSlug = useParam("projectSlug", "string")

  if (!files.length) {
    return (
      <p className="text-center text-xl text-gray-500">
        <span>Es wurden noch keine Dokumente eingetragen.</span>
      </p>
    )
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
              Planungsabschnitt (optional)
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
          {files.map((file) => {
            const url = `/api/files/${file.id}/${file.externalUrl.split("/").at(-1)}`

            return (
              <tr key={file.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <Link blank href={url} className="flex items-center gap-2">
                    <PaperClipIcon className="h-6 w-6 text-gray-500" />
                    <strong className="font-semibold">{file.title}</strong>
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {file.subsection && `${file.subsection.start}–${file.subsection.end}`}
                </td>
                <td className="whitespace-nowrap py-4 text-sm font-medium sm:pr-6">
                  <ButtonWrapper className="justify-end">
                    <Link blank icon="download" href={url}>
                      Download
                    </Link>
                    {withAction && (
                      <>
                        <Link
                          icon="edit"
                          href={Routes.EditFilePage({
                            projectSlug: projectSlug!,
                            fileId: file.id,
                          })}
                        >
                          Bearbeiten
                        </Link>
                        <Link
                          icon="delete"
                          href={Routes.ShowFilePage({
                            projectSlug: projectSlug!,
                            fileId: file.id,
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
