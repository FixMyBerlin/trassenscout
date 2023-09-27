import { Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import React from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { SubsubsectionIcon } from "src/core/components/Map/Icons"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Link, whiteButtonStyles } from "src/core/components/links"
import { PageDescription } from "src/core/components/pages/PageDescription"
import {
  formattedEuro,
  formattedLength,
  formattedWidth,
  shortTitle,
} from "src/core/components/text"
import { H2 } from "src/core/components/text/Headings"
import { useSlugs } from "src/core/hooks"
import { FilePreview } from "src/files/components/FilePreview"
import getFilesWithSubsections from "src/files/queries/getFilesWithSubsections"
import { SubsubsectionWithPosition } from "src/subsubsections/queries/getSubsubsection"
import { getFullname } from "src/users/utils"
import { mapillaryLink } from "./utils/mapillaryLink"

type Props = {
  subsubsection: SubsubsectionWithPosition
  onClose: () => void
}

export const SubsubsectionMapSidebar: React.FC<Props> = ({ subsubsection, onClose }) => {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  const [{ files }] = useQuery(getFilesWithSubsections, {
    projectSlug: projectSlug!,
    where: { subsubsectionId: subsubsection.id },
  })

  const mapillaryHref = mapillaryLink(subsubsection)

  return (
    <section className="overlflow-y-scroll h-full w-[55rem] overflow-x-hidden rounded-md border border-gray-400/10 bg-white p-3 drop-shadow-md">
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center justify-start gap-2">
          <SubsubsectionIcon label={shortTitle(subsubsection.slug)} />
          {subsubsection.type === "ROUTE" ? "Regelführung" : "Sonderführung"}
        </div>
        <div className="flex items-center gap-3">
          <Link
            icon="edit"
            href={Routes.EditSubsubsectionPage({
              projectSlug: projectSlug!,
              subsectionSlug: subsectionSlug!,
              subsubsectionSlug: subsubsectionSlug!,
            })}
          >
            bearbeiten
          </Link>
          <button
            className={clsx("h-8 !w-8 !rounded-full !p-0", whiteButtonStyles)}
            onClick={onClose}
          >
            &times;
          </button>
        </div>
      </div>
      <H2 className="mt-2">{subsubsection.subTitle}</H2>

      <PageDescription className="mt-5 !p-3">
        <Markdown markdown={subsubsection.description} className="leading-tight" />
      </PageDescription>

      <div className="-mx-3 -my-2 mt-5 overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle">
          <table className="min-w-full divide-y divide-gray-300 border-b border-b-gray-300">
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
                  {formattedLength(subsubsection.length)}
                </td>
              </tr>
              <tr>
                <th className="py-4 pl-3 pr-3 text-left text-sm font-medium text-gray-900">
                  Breite
                </th>
                <td className="break-words px-3 py-4 text-sm text-gray-500">
                  {formattedWidth(subsubsection.width)}
                </td>
              </tr>
              <tr>
                <th className="py-4 pl-3 pr-3 text-left text-sm font-medium text-gray-900">
                  Kostenschätzung
                </th>
                <td className="break-words px-3 py-4 text-sm text-gray-500">
                  {formattedEuro(subsubsection.costEstimate)}
                </td>
              </tr>
              <tr>
                <th className="py-4 pl-3 pr-3 text-left text-sm font-medium text-gray-900">
                  Ausbaustandard
                </th>
                <td className="break-words px-3 py-4 text-sm text-gray-500">
                  {subsubsection.qualityLevel?.title || "k.A."}
                </td>
              </tr>
              <tr>
                <th className="py-4 pl-3 pr-3 text-left text-sm font-medium text-gray-900">
                  Ansprechpartner:in
                </th>
                <td className="break-words px-3 py-4 text-sm text-gray-500">
                  {getFullname(subsubsection.manager)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-2 flex items-center justify-between">
          <H2>Grafiken</H2>
          <Link
            icon="plus"
            href={Routes.NewFilePage({
              projectSlug: projectSlug!,
              subsubsectionId: subsubsection.id,
              returnPath: [subsectionSlug, subsubsectionSlug].join("/"),
            })}
          >
            Grafik
          </Link>
        </div>
        {!files.length && <p>Es gibt noch keine Grafiken für diese Planung</p>}
        <div className="grid grid-cols-2 gap-3">
          {files.map((file) => {
            return (
              <FilePreview
                key={file.id}
                file={file}
                editUrl={Routes.EditFilePage({
                  projectSlug: projectSlug!,
                  fileId: file.id,
                  returnPath: [subsectionSlug, subsubsectionSlug].join("/"),
                })}
                showFileUrl={Routes.ShowFilePage({
                  projectSlug: projectSlug!,
                  fileId: file.id,
                  returnPath: [subsectionSlug, subsubsectionSlug].join("/"),
                })}
              />
            )
          })}
        </div>
      </section>

      <section className="mt-10">
        <H2>Straßenansicht (Mapillary)</H2>
        {subsubsection.mapillaryKey ? (
          <iframe
            title="Mapillary Image Preview"
            src={`https://www.mapillary.com/embed?image_key=${subsubsection.mapillaryKey}&style=photo`}
            className="mt-2 aspect-video w-full"
          />
        ) : (
          mapillaryHref && (
            <Link blank href={mapillaryHref} className="block mt-3">
              Mapillary öffnen
            </Link>
          )
        )}
      </section>

      <SuperAdminLogData data={{ subsubsection, files }} />
    </section>
  )
}
