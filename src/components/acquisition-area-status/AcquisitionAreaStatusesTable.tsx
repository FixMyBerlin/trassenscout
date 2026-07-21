import { getRouteApi } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import {
  useAcquisitionAreaStatusMutations,
  useAcquisitionAreaStatusRouteLinks,
} from "@/src/components/acquisition-area-status/useAcquisitionAreaStatusActions"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link, linkIcons } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import {
  type AcquisitionAreaStatusStyle,
  acquisitionAreaStatusStyleBadgeClasses,
  acquisitionAreaStatusStyleTranslations,
} from "./acquisitionAreaStatusStyles"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  acquisitionAreaStatuses: any[]
}

export const AcquisitionAreaStatusesTable = ({ acquisitionAreaStatuses }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { search, editLink } = useAcquisitionAreaStatusRouteLinks(projectSlug)
  const { deleteRow } = useAcquisitionAreaStatusMutations(projectSlug, search)

  const handleDelete = async (acquisitionAreaStatusId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${acquisitionAreaStatusId} unwiderruflich löschen?`)) {
      try {
        await deleteRow(acquisitionAreaStatusId)
      } catch {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  return (
    <TableWrapper flushTop>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Kürzel
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Titel
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Darstellung
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Anzahl Verhandlungsflächen in diesem Status
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
          {acquisitionAreaStatuses.map((status) => (
            <tr key={status.id}>
              <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                <strong className="font-semibold">{shortTitle(status.slug)}</strong>
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                <strong className="font-semibold">{status.title}</strong>
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                <span
                  className={twJoin(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    acquisitionAreaStatusStyleBadgeClasses[
                      status.style as AcquisitionAreaStatusStyle
                    ],
                  )}
                >
                  {
                    acquisitionAreaStatusStyleTranslations[
                      status.style as AcquisitionAreaStatusStyle
                    ]
                  }
                </span>
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                {status.acquisitionAreaCount}{" "}
                {status.acquisitionAreaCount === 1 ? "Verhandlungsfläche" : "Verhandlungsflächen"}
              </td>
              <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                <IfUserCanEdit>
                  <ButtonWrapper className="justify-end">
                    <Link icon="edit" {...editLink(status.id)}>
                      Bearbeiten
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(status.id)}
                      className={twJoin(
                        linkStyles,
                        "inline-flex items-center justify-center gap-1",
                      )}
                    >
                      {linkIcons["delete"]}
                      Löschen
                    </button>
                  </ButtonWrapper>
                </IfUserCanEdit>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  )
}
