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
  return (
    <div className="my-5 -mx-4 max-w-prose overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-2 align-middle  md:px-6 lg:px-8">
        <div className="overflow-hidden shadow-md ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <tbody className="divide-y divide-gray-200 bg-white">
              {files.map((file) => (
                <tr key={file.title}>
                  <td className="h-20 whitespace-nowrap py-4 pr-3 pl-4 text-sm sm:pl-6">
                    <PaperClipIcon className="h-8 w-8 text-gray-500" />
                  </td>
                  <td className="h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center font-medium text-gray-900">{file.title}</div>
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {file.externalUrl && (
                      <Link blank href={file.externalUrl}>
                        Zur Datei
                      </Link>
                    )}
                  </td>
                  {withAction && (
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <p className="flex items-center justify-end gap-4 text-right">
                        <Link
                          button
                          href={Routes.EditFilePage({ projectSlug: projectSlug!, fileId: file.id })}
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                          <span className="sr-only">Bearbeiten</span>
                        </Link>
                        <Link
                          href={Routes.ShowFilePage({ projectSlug: projectSlug!, fileId: file.id })}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </Link>
                      </p>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
