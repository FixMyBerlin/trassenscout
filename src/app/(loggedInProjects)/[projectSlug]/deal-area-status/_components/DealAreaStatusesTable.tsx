"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link, linkIcons, linkStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import deleteDealAreaStatus from "@/src/server/dealAreaStatuses/mutations/deleteDealAreaStatus"
import getDealAreaStatuses from "@/src/server/dealAreaStatuses/queries/getDealAreaStatuses"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { clsx } from "clsx"
import { Route } from "next"
import { useRouter } from "next/navigation"
import {
  dealAreaStatusStyleBadgeClasses,
  dealAreaStatusStyleTranslations,
} from "../_utils/dealAreaStatusStyles"

type Props = {
  dealAreaStatuses: PromiseReturnType<typeof getDealAreaStatuses>["dealAreaStatuses"]
  fromPath?: string
}

export const DealAreaStatusesTable = ({ dealAreaStatuses, fromPath }: Props) => {
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const appendFrom = fromPath ? `?from=${encodeURIComponent(fromPath)}` : ""

  const [deleteDealAreaStatusMutation] = useMutation(deleteDealAreaStatus)

  const handleDelete = async (dealAreaStatusId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${dealAreaStatusId} unwiderruflich löschen?`)) {
      try {
        await deleteDealAreaStatusMutation({ projectSlug, id: dealAreaStatusId })
        router.push(`/${projectSlug}/deal-area-status` as Route)
        router.refresh()
      } catch {
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
              Anzahl Dealflächen in diesem Status
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
          {dealAreaStatuses.map((status) => (
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
                    dealAreaStatusStyleBadgeClasses[status.style as 1 | 2 | 3],
                  )}
                >
                  {dealAreaStatusStyleTranslations[status.style as 1 | 2 | 3]}
                </span>
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                {status.dealAreaCount} {status.dealAreaCount === 1 ? "Dealfläche" : "Dealflächen"}
              </td>
              <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                <IfUserCanEdit>
                  <ButtonWrapper className="justify-end">
                    <Link
                      icon="edit"
                      href={
                        `/${projectSlug}/deal-area-status/${status.id}/edit${appendFrom}` as Route
                      }
                    >
                      Bearbeiten
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(status.id)}
                      className={clsx(linkStyles, "inline-flex items-center justify-center gap-1")}
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
