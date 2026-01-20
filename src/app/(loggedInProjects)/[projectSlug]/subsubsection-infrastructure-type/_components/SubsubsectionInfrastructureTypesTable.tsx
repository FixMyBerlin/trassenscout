"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link, linkIcons, linkStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import deleteSubsubsectionInfrastructureType from "@/src/server/subsubsectionInfrastructureType/mutations/deleteSubsubsectionInfrastructureType"
import getSubsubsectionInfrastructureTypesWithCount from "@/src/server/subsubsectionInfrastructureType/queries/getSubsubsectionInfrastructureTypesWithCount"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { clsx } from "clsx"
import { Route } from "next"
import { useRouter } from "next/navigation"

type Props = {
  subsubsectionInfrastructureTypes: PromiseReturnType<
    typeof getSubsubsectionInfrastructureTypesWithCount
  >["subsubsectionInfrastructureTypes"]
}

export const SubsubsectionInfrastructureTypesTable = ({
  subsubsectionInfrastructureTypes,
}: Props) => {
  const projectSlug = useProjectSlug()
  const router = useRouter()

  const [deleteSubsubsectionInfrastructureTypeMutation] = useMutation(
    deleteSubsubsectionInfrastructureType,
  )

  const handleDelete = async (subsubsectionInfrastructureTypeId: number) => {
    if (
      window.confirm(
        `Den Eintrag mit ID ${subsubsectionInfrastructureTypeId} unwiderruflich löschen?`,
      )
    ) {
      try {
        await deleteSubsubsectionInfrastructureTypeMutation({
          projectSlug,
          id: subsubsectionInfrastructureTypeId,
        })
        router.push(`/${projectSlug}/subsubsection-infrastructure-type` as Route)
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
                Fördergegenstand
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Slug
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
            {subsubsectionInfrastructureTypes.map((infrastructureType) => {
              return (
                <tr key={infrastructureType.id}>
                  <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                    {infrastructureType.title}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(infrastructureType.slug)}
                      className="text-left font-mono text-xs"
                    >
                      {shortTitle(infrastructureType.slug)}
                    </button>
                  </td>
                  <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link
                          icon="edit"
                          href={
                            `/${projectSlug}/subsubsection-infrastructure-type/${infrastructureType.id}/edit` as Route
                          }
                        >
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(infrastructureType.id)}
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
