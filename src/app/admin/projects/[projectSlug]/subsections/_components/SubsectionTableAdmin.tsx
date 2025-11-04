"use client"
import { SubsectionIcon } from "@/src/core/components/Map/Icons"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import deleteSubsection from "@/src/server/subsections/mutations/deleteSubsection"
import { SubsectionWithPosition } from "@/src/server/subsections/queries/getSubsection"
import { useMutation } from "@blitzjs/rpc"
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid"
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline"
import { lineString } from "@turf/helpers"
import { clsx } from "clsx"
import { useSearchParams } from "next/navigation"
import { defaultGeometryForMultipleSubsectionForm } from "../multiple-new/_components/MultipleNewSubsectionsForm"

type Props = {
  subsections: SubsectionWithPosition[]
}

export const SubsectionTableAdmin = ({ subsections }: Props) => {
  const projectSlug = useProjectSlug()
  const updatedIds = useSearchParams()?.get("updatedIds")?.split(",")

  const handleSlugCopyClick = async (slug: string) => {
    await navigator.clipboard.writeText(slug)
  }

  const [deleteSubsectionMutation] = useMutation(deleteSubsection)
  const handleDeleteSubsection = async (subsectionId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${subsectionId} unwiderruflich löschen?`)) {
      try {
        await deleteSubsectionMutation({ projectSlug, id: subsectionId })
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }
  return (
    <section>
      {Boolean(updatedIds?.length) && (
        <p className="mt-8 border-4 border-blue-100 p-8 text-base">
          {updatedIds![0] === ""
            ? "Keine Planungsabschnitte im ausgewählten GeoJSON erkannt."
            : `Die Planungsabschnitte mit den Ids ${JSON.stringify(updatedIds)} (in der
            Tabelle blau hinterlegt) wurden im ausgewählten GeoJSON erkannt und ggf. aktualisiert.`}
        </p>
      )}

      <TableWrapper className="mt-12">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Planungsabschnitt
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Slug
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Nummer (order)
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                Start
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                Ende
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                Geometrie
              </th>
              <th
                scope="col"
                className="sr-only px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                bearbeiten
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subsections.map((subsection) => {
              const noPreviewForDefaultGeometry =
                String(subsection.geometry) === defaultGeometryForMultipleSubsectionForm.join(",")

              return (
                <tr
                  key={subsection.id}
                  className={clsx(
                    "h-full",
                    updatedIds?.includes(String(subsection.id)) && "bg-blue-100",
                  )}
                >
                  <td className="h-20 w-20 py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                    <SubsectionIcon label={shortTitle(subsection.slug)} />
                  </td>

                  <td className="cursor-pointer py-4 pr-3 pl-4 text-sm font-medium text-blue-500 hover:text-blue-800">
                    <button onClick={() => handleSlugCopyClick(subsection.slug)}>
                      <div className="flex gap-5">
                        <p>{subsection.slug}</p>

                        <ClipboardDocumentListIcon className="w-4" />
                      </div>
                    </button>
                  </td>
                  <td className="py-4 pr-3 pl-4 text-sm font-medium text-gray-900">
                    {subsection.order}
                  </td>
                  <td
                    className={clsx(
                      "py-4 pr-3 pl-4 text-sm font-medium",
                      subsection.end === "unbekannt" ? "text-gray-300" : "text-gray-900",
                    )}
                  >
                    {subsection.start}
                  </td>
                  <td
                    className={clsx(
                      "py-4 pr-3 pl-4 text-sm font-medium",
                      subsection.end === "unbekannt" ? "text-gray-300" : "text-gray-900",
                    )}
                  >
                    {subsection.end}
                  </td>

                  <td
                    className={clsx(
                      "py-4 pr-3 pl-4 text-sm font-medium group-hover:bg-gray-50",
                      noPreviewForDefaultGeometry
                        ? "text-gray-300 group-hover:text-gray-500"
                        : "text-gray-900",
                    )}
                  >
                    {noPreviewForDefaultGeometry ? (
                      "Geometrie unbekannt (Fallbackgeometrie)"
                    ) : (
                      <Link
                        blank
                        href={`https://play.placemark.io/?load=data:application/json,${encodeURIComponent(
                          JSON.stringify(lineString(subsection.geometry)),
                        )}`}
                      >
                        Auf placemark.io öffnen
                      </Link>
                    )}
                  </td>
                  <td className="space-y-2 pr-2">
                    <Link href={`/${projectSlug}/abschnitte/${subsection.slug}/edit`}>
                      <PencilSquareIcon className="h-4 w-4" />
                      <span className="sr-only">Bearbeiten</span>
                    </Link>
                    <button
                      className="text-blue-500 hover:text-blue-800"
                      onClick={() => handleDeleteSubsection(subsection.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {!subsections.length && (
          <div className="border-t px-3 py-5 text-center text-gray-500">
            Noch keine Planungsabschnitte angelegt
          </div>
        )}
      </TableWrapper>

      <ButtonWrapper className="mt-5">
        <Link
          icon="plus"
          button="blue"
          href={`/admin/projects/${projectSlug}/subsections/multiple-new`}
        >
          Mehrere Planungsabschnitte erstellen
        </Link>
      </ButtonWrapper>
    </section>
  )
}
