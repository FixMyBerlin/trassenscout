import { getRouteApi } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link, linkIcons } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import {
  tableBodyClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadCellRightClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import {
  useSubsubsectionInfrastructureTypeMutations,
  useSubsubsectionInfrastructureTypeRouteLinks,
} from "@/src/components/subsubsection-infrastructure-type/useSubsubsectionInfrastructureTypeActions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  subsubsectionInfrastructureTypes: any[]
}

export const SubsubsectionInfrastructureTypesTable = ({
  subsubsectionInfrastructureTypes,
}: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { search, editLink } = useSubsubsectionInfrastructureTypeRouteLinks(projectSlug)
  const { deleteRow } = useSubsubsectionInfrastructureTypeMutations(projectSlug, search)

  const handleDelete = async (subsubsectionInfrastructureTypeId: number) => {
    if (
      window.confirm(
        `Den Eintrag mit ID ${subsubsectionInfrastructureTypeId} unwiderruflich löschen?`,
      )
    ) {
      try {
        await deleteRow(subsubsectionInfrastructureTypeId)
      } catch {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  return (
    <>
      <TableWrapper>
        <table className={tableClassName}>
          <thead>
            <tr className={tableHeadRowClassName}>
              <th scope="col" className={tableHeadCellClassName}>
                Titel
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Kürzel
              </th>
              <th scope="col" className={twJoin(tableHeadCellRightClassName, "sr-only")}>
                bearbeiten
              </th>
            </tr>
          </thead>
          <tbody className={tableBodyClassName}>
            {subsubsectionInfrastructureTypes.map((infrastructureType) => {
              return (
                <tr key={infrastructureType.id} className={tableRowClassName}>
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
                        <Link icon="edit" {...editLink(infrastructureType.id)}>
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(infrastructureType.id)}
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
              )
            })}
          </tbody>
        </table>
      </TableWrapper>
    </>
  )
}
