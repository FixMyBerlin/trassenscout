import { twJoin } from "tailwind-merge"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link, linkIcons, type LinkProps } from "@/src/components/core/components/links/Link"
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
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"

export type TagManagementRow = {
  id: number
  title: string
  archivedAt: Date | string | null
  usageCount: number
}

type EditLinkProps = Omit<Extract<LinkProps, { to: string }>, "children">

type Props = {
  tags: TagManagementRow[]
  editLink: (id: number) => EditLinkProps
  onArchive: (tag: TagManagementRow) => Promise<void>
  onDelete: (tag: TagManagementRow) => Promise<void>
}

export const TagsManagementTable = ({ tags, editLink, onArchive, onDelete }: Props) => {
  return (
    <TableWrapper>
      <table className={tableClassName}>
        <thead>
          <tr className={tableHeadRowClassName}>
            <th scope="col" className={tableHeadCellClassName}>
              Titel
            </th>
            <th scope="col" className={tableHeadCellClassName}>
              Verwendungen
            </th>
            <th scope="col" className={tableHeadCellClassName}>
              Status
            </th>
            <th scope="col" className={tableHeadCellRightClassName}>
              <span className="sr-only">Aktionen</span>
            </th>
          </tr>
        </thead>
        <tbody className={tableBodyClassName}>
          {tags.map((tag) => (
            <tr
              key={tag.id}
              className={twJoin(
                tableRowClassName,
                tag.archivedAt ? "bg-gray-50 text-gray-500" : undefined,
              )}
            >
              <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                <strong className="font-semibold">{tag.title}</strong>
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                {tag.usageCount}
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                {tag.archivedAt ? "Archiviert" : "Aktiv"}
              </td>
              <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                <IfUserCanEdit>
                  <ButtonWrapper className="justify-end">
                    <Link icon="edit" {...editLink(tag.id)}>
                      Bearbeiten
                    </Link>
                    <button
                      type="button"
                      onClick={() => onArchive(tag)}
                      className={twJoin(
                        linkStyles,
                        "inline-flex items-center justify-center gap-1",
                      )}
                    >
                      {tag.archivedAt ? "Reaktivieren" : "Archivieren"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(tag)}
                      disabled={tag.usageCount > 0}
                      title={
                        tag.usageCount > 0
                          ? "Tag wird noch verwendet und kann nicht gelöscht werden."
                          : undefined
                      }
                      className={twJoin(
                        linkStyles,
                        "inline-flex items-center justify-center gap-1",
                        tag.usageCount > 0 && "cursor-not-allowed opacity-50",
                      )}
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
