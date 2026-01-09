"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link, linkIcons, linkStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import deleteNetworkHierarchy from "@/src/server/networkHierarchy/mutations/deleteNetworkHierarchy"
import getNetworkHierarchyWithCount from "@/src/server/networkHierarchy/queries/getNetworkHierarchysWithCount"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { clsx } from "clsx"
import { Route } from "next"
import { useRouter } from "next/navigation"

type Props = {
  networkHierarchys: PromiseReturnType<typeof getNetworkHierarchyWithCount>["networkHierarchys"]
}

export const NetworkHierarchysTable = ({ networkHierarchys }: Props) => {
  const projectSlug = useProjectSlug()
  const router = useRouter()

  const [deleteNetworkHierarchyMutation] = useMutation(deleteNetworkHierarchy)

  const handleDelete = async (networkHierarchyId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${networkHierarchyId} unwiderruflich löschen?`)) {
      try {
        await deleteNetworkHierarchyMutation({ projectSlug, id: networkHierarchyId })
        router.push(`/${projectSlug}/network-hierarchy` as Route)
        router.refresh()
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  return (
    <>
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
                Anzahl der Planungsabschnitte
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
            {networkHierarchys.map((networkHierarchy) => {
              return (
                <tr key={networkHierarchy.id}>
                  <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                    <strong className="font-semibold">{shortTitle(networkHierarchy.slug)}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    <strong className="font-semibold">{networkHierarchy.title}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {networkHierarchy.subsectionCount} Planungsabschnitte
                  </td>
                  <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link
                          icon="edit"
                          href={
                            `/${projectSlug}/network-hierarchy/${networkHierarchy.id}/edit` as Route
                          }
                        >
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(networkHierarchy.id)}
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
    </>
  )
}
