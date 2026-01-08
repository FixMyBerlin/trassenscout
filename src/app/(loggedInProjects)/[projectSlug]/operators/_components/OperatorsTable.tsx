"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { Pagination } from "@/src/core/components/Pagination"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link, linkIcons, linkStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import deleteOperator from "@/src/server/operators/mutations/deleteOperator"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { clsx } from "clsx"
import { Route } from "next"
import { useRouter, useSearchParams } from "next/navigation"

type Props = {
  operators: PromiseReturnType<typeof getOperatorsWithCount>["operators"]
  hasMore: boolean
  page: number
}

export const OperatorsTable = ({ operators, hasMore, page }: Props) => {
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [deleteOperatorMutation] = useMutation(deleteOperator)

  const handleDelete = async (operatorId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${operatorId} unwiderruflich löschen?`)) {
      try {
        await deleteOperatorMutation({ projectSlug, id: operatorId })
        const currentPage = searchParams?.get("page") || "0"
        router.push(`/${projectSlug}/operators?page=${currentPage}` as Route)
        router.refresh()
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  const goToPreviousPage = () => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("page", String(page - 1))
    router.push(`/${projectSlug}/operators?${params.toString()}` as Route)
  }

  const goToNextPage = () => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("page", String(page + 1))
    router.push(`/${projectSlug}/operators?${params.toString()}` as Route)
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
                Anzahl Planungsabschnitt
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
            {operators.map((operator) => {
              return (
                <tr key={operator.id}>
                  <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                    <strong className="font-semibold">{shortTitle(operator.slug)}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    <strong className="font-semibold">{operator.title}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {operator.subsectionCount} Planungsabschnitte
                  </td>
                  <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link
                          icon="edit"
                          href={`/${projectSlug}/operators/${operator.id}/edit` as Route}
                        >
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(operator.id)}
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

      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={`/${projectSlug}/operators/new` as Route}
        >
          Neuer Baulastträger
        </Link>
      </IfUserCanEdit>

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />
    </>
  )
}
