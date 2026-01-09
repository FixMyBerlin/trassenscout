"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link, linkIcons, linkStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { shortTitle } from "@/src/core/components/text"
import deleteSubsectionStatus from "@/src/server/subsectionStatus/mutations/deleteSubsectionStatus"
import { useMutation } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { Route } from "next"
import { useRouter } from "next/navigation"

type SubsectionStatusWithCount = {
  id: number
  slug: string
  title: string
  style: "REGULAR" | "DASHED"
  subsectionCount: number
}

type Props = {
  subsectionStatuss: SubsectionStatusWithCount[]
  projectSlug: string
}

export const SubsectionStatusesTable = ({ subsectionStatuss, projectSlug }: Props) => {
  const router = useRouter()
  const [deleteSubsectionStatusMutation] = useMutation(deleteSubsectionStatus)

  const handleDelete = async (subsectionStatusId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${subsectionStatusId} unwiderruflich löschen?`)) {
      try {
        await deleteSubsectionStatusMutation({ projectSlug, id: subsectionStatusId })
        router.push(`/${projectSlug}/subsection-status` as Route)
        router.refresh()
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
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
              Kürzel
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Titel
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Darstellung
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Anzahl Planungsabschnitte mit diesem Status
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
          {subsectionStatuss.map((status) => {
            return (
              <tr key={status.id}>
                <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                  <strong className="font-semibold">{shortTitle(status.slug)}</strong>
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  <strong className="font-semibold">{status.title}</strong>
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      status.style === "REGULAR"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800",
                    )}
                  >
                    {status.style === "REGULAR" ? "Durchgezogen" : "Gestrichelt"}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {status.subsectionCount}{" "}
                  {status.subsectionCount > 1 ? "Planungsabschnitte" : "Planungsabschnitt"}
                </td>
                <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                  <IfUserCanEdit>
                    <ButtonWrapper className="justify-end">
                      <Link
                        icon="edit"
                        href={`/${projectSlug}/subsection-status/${status.id}/edit`}
                      >
                        Bearbeiten
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(status.id)}
                        className={clsx(
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
            )
          })}
        </tbody>
      </table>
    </TableWrapper>
  )
}
