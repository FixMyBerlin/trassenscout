"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link, linkIcons, linkStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import deleteSubsubsectionSpecial from "@/src/server/subsubsectionSpecial/mutations/deleteSubsubsectionSpecial"
import getSubsubsectionSpecialsWithCount from "@/src/server/subsubsectionSpecial/queries/getSubsubsectionSpecialsWithCount"
import { useMutation } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { clsx } from "clsx"
import { Route } from "next"
import { useRouter } from "next/navigation"

type Props = {
  subsubsectionSpecials: PromiseReturnType<
    typeof getSubsubsectionSpecialsWithCount
  >["subsubsectionSpecials"]
}

export const SubsubsectionSpecialsTable = ({ subsubsectionSpecials }: Props) => {
  const projectSlug = useProjectSlug()
  const router = useRouter()

  const [deleteSubsubsectionSpecialMutation] = useMutation(deleteSubsubsectionSpecial)

  const handleDelete = async (subsubsectionSpecialId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${subsubsectionSpecialId} unwiderruflich löschen?`)) {
      try {
        await deleteSubsubsectionSpecialMutation({ projectSlug, id: subsubsectionSpecialId })
        router.push(`/${projectSlug}/subsubsection-special` as Route)
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
                Anzahl Einträge mit dieser Besonderheit
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
            {subsubsectionSpecials.map((special) => {
              return (
                <tr key={special.id}>
                  <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                    <strong className="font-semibold">{shortTitle(special.slug)}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    <strong className="font-semibold">{special.title}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {special.subsubsectionCount}{" "}
                    {special.subsubsectionCount > 1 ? "Einträge" : "Eintrag"}
                  </td>
                  <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link
                          icon="edit"
                          href={`/${projectSlug}/subsubsection-special/${special.id}/edit` as Route}
                        >
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(special.id)}
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
