import { Routes } from "@blitzjs/next"
import clsx from "clsx"
import React from "react"
import { Subsubsection } from "@prisma/client"

import { SuperAdminBox } from "src/core/components/AdminBox"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Link, whiteButtonStyles } from "src/core/components/links"
import { PageDescription } from "src/core/components/pages/PageDescription"
import { H2 } from "src/core/components/text/Headings"
import { useSlugs } from "src/core/hooks"

type Props = {
  subsubsection: Subsubsection
  onClose: () => void
}

export const SubsubsectionSidebar: React.FC<Props> = ({ subsubsection, onClose }) => {
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  return (
    <div className="overlflow-y-scroll h-full w-[40rem] overflow-x-hidden rounded-md border border-gray-400/10 bg-white p-3 drop-shadow-md">
      <div className="mt-3 flex items-center justify-between">
        <H2>{subsubsection.title}</H2>
        <div className="flex items-center gap-3">
          <Link
            icon="edit"
            className="mt-0.5"
            href={Routes.EditSubsubsectionPage({
              projectSlug: projectSlug!,
              sectionSlug: sectionSlug!,
              subsectionSlug: subsectionSlug!,
              subsubsectionSlug: subsubsectionSlug!,
            })}
          >
            bearbeiten
          </Link>
          <button className={clsx("h-8 !w-8 !p-0 !pt-1", whiteButtonStyles)} onClick={onClose}>
            &times;
          </button>
        </div>
      </div>

      <PageDescription className="mt-5">
        <Markdown markdown={subsubsection.description} />
      </PageDescription>

      <div className="-mx-3 -my-2 mt-5 overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="sr-only">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-3 pr-3 text-left text-sm font-semibold text-gray-900"
                >
                  Attribut
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Wert
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <th className="py-4 pl-3 pr-3 text-left text-sm font-medium text-gray-900">
                  Führungsform
                </th>
                <td className="break-words px-3 py-4 text-sm text-gray-500">
                  {subsubsection.guidance}
                </td>
              </tr>
              <tr>
                <th className="py-4 pl-3 pr-3 text-left text-sm font-medium text-gray-900">
                  Maßnahmentyp
                </th>
                <td className="break-words px-3 py-4 text-sm text-gray-500">
                  {subsubsection.task}
                </td>
              </tr>
              <tr>
                <th className="py-4 pl-3 pr-3 text-left text-sm font-medium text-gray-900">
                  Länge
                </th>
                <td className="break-words px-3 py-4 text-sm text-gray-500">
                  {subsubsection.length || "-"} km
                </td>
              </tr>
              <tr>
                <th className="py-4 pl-3 pr-3 text-left text-sm font-medium text-gray-900">
                  Breite
                </th>
                <td className="break-words px-3 py-4 text-sm text-gray-500">
                  {subsubsection.width || "-"} m
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <SuperAdminBox>
        <pre>{JSON.stringify(subsubsection, null, 2)}</pre>
      </SuperAdminBox>
    </div>
  )
}
