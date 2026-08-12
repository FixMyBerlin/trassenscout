import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminBadge } from "@/src/components/admin/AdminBadge"
import {
  adminTableBodyClassName,
  adminTableCellClassName,
  adminTableCellRightClassName,
  adminTableClassName,
  adminTableHeaderClassName,
  adminTableHeaderRightClassName,
  adminTableHeadRowClassName,
  adminTableRowClassName,
} from "@/src/components/admin/adminListClasses"
import {
  AdminTableActions,
  AdminTableDeleteButton,
  AdminTableEditLink,
} from "@/src/components/admin/AdminTableActions"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { deleteProjectRecordTemplateFn } from "@/src/server/projectRecordTemplates/projectRecordTemplates.functions"
import { projectRecordTemplatesQueryOptions } from "@/src/server/projectRecordTemplates/projectRecordTemplatesQueryOptions"
import type { ProjectRecordTemplatesList } from "@/src/server/projectRecordTemplates/types"

type Props = {
  templates: ProjectRecordTemplatesList
}

export const AdminProjectRecordTemplatesTable = ({ templates }: Props) => {
  const queryClient = useQueryClient()
  const deleteProjectRecordTemplateMutation = useMutation({
    mutationFn: deleteProjectRecordTemplateFn,
  })

  const handleDelete = async (id: number) => {
    if (!window.confirm("Vorlage wirklich löschen?")) return
    await deleteProjectRecordTemplateMutation.mutateAsync({ data: { id } })
    await queryClient.invalidateQueries({
      queryKey: projectRecordTemplatesQueryOptions().queryKey,
    })
  }

  if (!templates.length) {
    return <p className="px-4 text-sm text-gray-600">Noch keine Vorlagen vorhanden.</p>
  }

  return (
    <TableWrapper withTopBorder className="mt-7">
      <table className={adminTableClassName}>
        <thead>
          <tr className={adminTableHeadRowClassName}>
            <th className={adminTableHeaderClassName}>Titel der Vorlage</th>
            <th className={adminTableHeaderClassName}>Projekte</th>
            <th className={adminTableHeaderRightClassName}>Aktion</th>
          </tr>
        </thead>
        <tbody className={adminTableBodyClassName}>
          {templates.map((template) => (
            <tr key={template.id} className={adminTableRowClassName}>
              <td className={adminTableCellClassName}>{template.templateTitle}</td>
              <td className={adminTableCellClassName}>
                <div className="flex flex-wrap gap-2">
                  {template.projects.length ? (
                    template.projects.map((project) => (
                      <AdminBadge key={project.id} variant="blue">
                        {project.slug}
                      </AdminBadge>
                    ))
                  ) : (
                    <span className="text-gray-400">Kein Projekt</span>
                  )}
                </div>
              </td>
              <td className={adminTableCellRightClassName}>
                <AdminTableActions>
                  <AdminTableEditLink to={`/admin/project-record-templates/${template.id}/edit`} />
                  <AdminTableDeleteButton onClick={() => handleDelete(template.id)} />
                </AdminTableActions>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  )
}
