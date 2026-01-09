"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link, linkIcons, linkStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import deleteQualityLevel from "@/src/server/qualityLevels/mutations/deleteQualityLevel"
import getQualityLevelsWithCount from "@/src/server/qualityLevels/queries/getQualityLevelsWithCount"
import { useMutation } from "@blitzjs/rpc"
import { ArrowUpRightIcon } from "@heroicons/react/16/solid"
import { PromiseReturnType } from "blitz"
import { clsx } from "clsx"
import { Route } from "next"
import { useRouter } from "next/navigation"

type Props = {
  qualityLevels: PromiseReturnType<typeof getQualityLevelsWithCount>["qualityLevels"]
}

export const QualityLevelsTable = ({ qualityLevels }: Props) => {
  const projectSlug = useProjectSlug()
  const router = useRouter()

  const [deleteQualityLevelMutation] = useMutation(deleteQualityLevel)

  const handleDelete = async (qualityLevelId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${qualityLevelId} unwiderruflich löschen?`)) {
      try {
        await deleteQualityLevelMutation({ projectSlug, id: qualityLevelId })
        router.push(`/${projectSlug}/quality-levels` as Route)
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
                Titel (mit externem Link, wenn vorhanden)
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Anzahl der Einträge
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
            {qualityLevels.map((qualityLevel) => {
              return (
                <tr key={qualityLevel.id}>
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
                        {qualityLevel.title} <ArrowUpRightIcon className="h-4 w-4" />
                      </Link>
                    ) : (
                      <strong className="font-semibold">{qualityLevel.title}</strong>
                    )}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {qualityLevel.subsubsectionCount} Einträge
                  </td>
                  <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link
                          icon="edit"
                          href={`/${projectSlug}/quality-levels/${qualityLevel.id}/edit` as Route}
                        >
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(qualityLevel.id)}
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
