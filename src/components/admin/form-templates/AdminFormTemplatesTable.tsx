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
import { deleteFormTemplateFn } from "@/src/server/formTemplates/formTemplates.functions"
import { formTemplatesQueryOptions } from "@/src/server/formTemplates/formTemplatesQueryOptions"
import type { FormTemplatesList } from "@/src/server/formTemplates/types"
import { resolveFormTemplateFields } from "@/src/shared/formTemplates/fieldSchemas"
import { formTemplateTypeLabels } from "@/src/shared/formTemplates/schemas"

type Props = {
  templates: FormTemplatesList
}

export const AdminFormTemplatesTable = ({ templates }: Props) => {
  const queryClient = useQueryClient()
  const deleteFormTemplateMutation = useMutation({ mutationFn: deleteFormTemplateFn })

  const handleDelete = async (id: number) => {
    if (!window.confirm("Formulartemplate wirklich löschen?")) return
    await deleteFormTemplateMutation.mutateAsync({ data: { id } })
    await queryClient.invalidateQueries({ queryKey: formTemplatesQueryOptions().queryKey })
  }

  if (!templates.length) {
    return <p className="px-4 text-sm text-gray-600">Noch keine Formulartemplates vorhanden.</p>
  }

  return (
    <TableWrapper withTopBorder className="mt-7">
      <table className={adminTableClassName}>
        <thead>
          <tr className={adminTableHeadRowClassName}>
            <th className={adminTableHeaderClassName}>Titel</th>
            <th className={adminTableHeaderClassName}>Verfügbar in</th>
            <th className={adminTableHeaderClassName}>Felder</th>
            <th className={adminTableHeaderClassName}>Projekte</th>
            <th className={adminTableHeaderRightClassName}>Aktion</th>
          </tr>
        </thead>
        <tbody className={adminTableBodyClassName}>
          {templates.map((template) => (
            <tr key={template.id} className={adminTableRowClassName}>
              <td className={adminTableCellClassName}>
                {template.title}
                <span className="block text-gray-500">{template.slug}</span>
              </td>
              <td className={adminTableCellClassName}>{formTemplateTypeLabels[template.type]}</td>
              <td className={adminTableCellClassName}>
                {resolveFormTemplateFields(template.bodyMarkdown, template.fields).length}
              </td>
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
                  <AdminTableEditLink to={`/admin/form-templates/${template.id}/edit`} />
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
