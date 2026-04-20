"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link, linkIcons, linkStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import deleteAcquisitionAreaStatus from "@/src/server/acquisitionAreaStatuses/mutations/deleteAcquisitionAreaStatus"
import getAcquisitionAreaStatuses from "@/src/server/acquisitionAreaStatuses/queries/getAcquisitionAreaStatuses"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { clsx } from "clsx"
import { Route } from "next"
import { useRouter } from "next/navigation"
import {
  type AcquisitionAreaStatusStyle,
  acquisitionAreaStatusStyleBadgeClasses,
  acquisitionAreaStatusStyleTranslations,
} from "../_utils/acquisitionAreaStatusStyles"

type Props = {
  acquisitionAreaStatuses: PromiseReturnType<
    typeof getAcquisitionAreaStatuses
  >["acquisitionAreaStatuses"]
  fromPath?: string
}

export const AcquisitionAreaStatusesTable = ({ acquisitionAreaStatuses, fromPath }: Props) => {
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const appendFrom = fromPath ? `?from=${encodeURIComponent(fromPath)}` : ""

  const [deleteAcquisitionAreaStatusMutation] = useMutation(deleteAcquisitionAreaStatus)

  const handleDelete = async (acquisitionAreaStatusId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${acquisitionAreaStatusId} unwiderruflich löschen?`)) {
      try {
        await deleteAcquisitionAreaStatusMutation({ projectSlug, id: acquisitionAreaStatusId })
        router.push(`/${projectSlug}/acquisition-area-status` as Route)
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
                  className={clsx(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    acquisitionAreaStatusStyleBadgeClasses[status.style as AcquisitionAreaStatusStyle],
                  )}
                >
                  {acquisitionAreaStatusStyleTranslations[status.style as AcquisitionAreaStatusStyle]}
                </span>
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                {status.acquisitionAreaCount}{" "}
                {status.acquisitionAreaCount === 1 ? "Verhandlungsfläche" : "Verhandlungsflächen"}
              </td>
              <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                <IfUserCanEdit>
                  <ButtonWrapper className="justify-end">
                    <Link
                      icon="edit"
                      href={
                        `/${projectSlug}/acquisition-area-status/${status.id}/edit${appendFrom}` as Route
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
