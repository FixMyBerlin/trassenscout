import { Routes, useParam } from "@blitzjs/next"
import { PaperClipIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid"
import { File } from "@prisma/client"
import React from "react"
import { Link } from "src/core/components/links"

type Props = {
  files: File[]
  withAction?: boolean
}

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
    <div className="-mx-4 max-w-prose overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-px align-middle md:px-6 lg:px-8">
        <div className="overflow-hidden ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <tbody className="divide-y divide-gray-200 bg-white">
              {files.map((file) => {
                const url = new URL(file.externalUrl).host.endsWith("amazonaws.com")
                  ? `/api/files/${file.id}/${file.externalUrl.split("/").at(-1)}`
                  : file.externalUrl
                return (
                  <tr key={file.id}>
                    <td className="h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <PaperClipIcon className="h-8 w-8 text-gray-500" />
                    </td>
                    <td className="h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center font-medium text-gray-900">
                        {file.title}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {url && (
                        <Link blank href={url}>
                          Download
                        </Link>
                      )}
                    </td>
                    {withAction && (
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <p className="flex items-center justify-end gap-4 text-right">
                          <Link
                            href={Routes.EditFilePage({
                              projectSlug: projectSlug!,
                              fileId: file.id,
                            })}
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                            <span className="sr-only">Bearbeiten</span>
                          </Link>
                          <Link
                            href={Routes.ShowFilePage({
                              projectSlug: projectSlug!,
                              fileId: file.id,
                            })}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Link>
                        </p>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
