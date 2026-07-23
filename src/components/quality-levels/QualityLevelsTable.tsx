import { ArrowUpRightIcon } from "@heroicons/react/16/solid"
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
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import {
  useQualityLevelMutations,
  useQualityLevelRouteLinks,
} from "@/src/components/quality-levels/useQualityLevelActions"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  qualityLevels: any[]
}

export const QualityLevelsTable = ({ qualityLevels }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { search, editLink } = useQualityLevelRouteLinks(projectSlug)
  const { deleteRow } = useQualityLevelMutations(projectSlug, search)

  const handleDelete = async (qualityLevelId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${qualityLevelId} unwiderruflich löschen?`)) {
      try {
        await deleteRow(qualityLevelId)
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
                Kürzel
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Titel (mit externem Link, wenn vorhanden)
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Anzahl der Maßnahmen
              </th>
              <th scope="col" className={tableHeadCellRightClassName}>
                <span className="sr-only">Aktionen</span>
              </th>
            </tr>
          </thead>
          <tbody className={tableBodyClassName}>
            {qualityLevels.map((qualityLevel) => {
              return (
                <tr key={qualityLevel.id} className={tableRowClassName}>
                  <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                    <strong className="font-semibold">{shortTitle(qualityLevel.slug)}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {qualityLevel.url ? (
                      <Link
                        blank
                        className="flex items-center gap-1 font-semibold"
                        href={qualityLevel.url}
                      >
                        {qualityLevel.title} <ArrowUpRightIcon className="size-4" />
                      </Link>
                    ) : (
                      <strong className="font-semibold">{qualityLevel.title}</strong>
                    )}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {qualityLevel.subsubsectionCount} Maßnahmen
                  </td>
                  <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link icon="edit" {...editLink(qualityLevel.id)}>
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(qualityLevel.id)}
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
        {!qualityLevels.length && <ZeroCase visible name="Ausbaustandards" verb="angelegt" />}
      </TableWrapper>
    </>
  )
}
