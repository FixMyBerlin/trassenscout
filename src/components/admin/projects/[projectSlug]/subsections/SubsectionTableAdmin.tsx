import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { clsx } from "clsx"
import {
  AdminTableActions,
  AdminTableDeleteButton,
  AdminTableEditLink,
  AdminTableExternalLink,
} from "@/src/components/admin/AdminTableActions"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link } from "@/src/components/core/components/links/Link"
import { SubsectionIcon } from "@/src/components/core/components/Map/Icons/SubsectionIcon"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { deleteSubsectionFn } from "@/src/server/subsections/subsections.functions"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { defaultGeometryForMultipleSubsectionForm } from "./multiple-new/MultipleNewSubsectionsForm"

type Props = {
  projectSlug: string
}

const routeApi = getRouteApi("/admin/projects/$projectSlug/subsections/")

export const SubsectionTableAdmin = ({ projectSlug }: Props) => {
  const queryClient = useQueryClient()
  const { data: subsections } = useSuspenseQuery(subsectionsQueryOptions({ projectSlug }))
  const { updatedIds: updatedIdsParam } = routeApi.useSearch()
  const updatedIds = updatedIdsParam?.split(",")

  const handleSlugCopyClick = async (slug: string) => {
    await navigator.clipboard.writeText(slug)
  }

  const deleteSubsectionMutation = useMutation({ mutationFn: deleteSubsectionFn })
  const handleDeleteSubsection = async (subsectionId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${subsectionId} unwiderruflich löschen?`)) {
      try {
        await deleteSubsectionMutation.mutateAsync({
          data: { projectSlug, id: subsectionId },
        })
        await queryClient.invalidateQueries({
          queryKey: subsectionsQueryOptions({ projectSlug }).queryKey,
        })
      } catch {
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

      <TableWrapper>
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
                String(subsection.geometry.coordinates) ===
                defaultGeometryForMultipleSubsectionForm.coordinates.join(",")

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
                      "py-4 pr-3 pl-4 text-sm font-medium group-hover:bg-gray-50",
                      noPreviewForDefaultGeometry
                        ? "text-gray-300 group-hover:text-gray-500"
                        : "text-gray-900",
                    )}
                  >
                    {noPreviewForDefaultGeometry ? (
                      "Geometrie unbekannt (Fallbackgeometrie)"
                    ) : (
                      <AdminTableExternalLink
                        href={`https://play.placemark.io/?load=data:application/json,${encodeURIComponent(
                          JSON.stringify(subsection.geometry),
                        )}`}
                      >
                        Auf placemark.io öffnen
                      </AdminTableExternalLink>
                    )}
                  </td>
                  <td className="px-3 py-4 sm:pr-6">
                    <AdminTableActions>
                      <AdminTableEditLink
                        to={`/${projectSlug}/abschnitte/${subsection.slug}/edit`}
                      />
                      <AdminTableDeleteButton
                        onClick={() => handleDeleteSubsection(subsection.id)}
                      />
                    </AdminTableActions>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {!subsections.length && <ZeroCase small visible name="Planungsabschnitte" />}
      </TableWrapper>

      <ButtonWrapper className="mt-5">
        <Link
          icon="plus"
          button="blue"
          to={`/admin/projects/${projectSlug}/subsections/multiple-new`}
        >
          Mehrere Planungsabschnitte erstellen
        </Link>
      </ButtonWrapper>
    </section>
  )
}
