"use client"

import { Link } from "@/src/core/components/links"
import deleteProjectRecordTemplate from "@/src/server/projectRecordTemplates/mutations/deleteProjectRecordTemplate"
import getAdminProjectRecordTemplates from "@/src/server/projectRecordTemplates/queries/getAdminProjectRecordTemplates"
import { useMutation, useQuery } from "@blitzjs/rpc"

type Props = {
  initialTemplates: Awaited<ReturnType<typeof getAdminProjectRecordTemplates>>
}

export const AdminProjectRecordTemplatesTable = ({ initialTemplates }: Props) => {
  const [templates, { refetch }] = useQuery(
    getAdminProjectRecordTemplates,
    {},
    { initialData: initialTemplates },
  )
  const [deleteProjectRecordTemplateMutation] = useMutation(deleteProjectRecordTemplate)

  const handleDelete = async (id: number) => {
    if (!window.confirm("Vorlage wirklich löschen?")) return
    await deleteProjectRecordTemplateMutation({ id })
    await refetch()
  }

  if (!templates.length) {
    return <p className="text-sm text-gray-600">Noch keine Vorlagen vorhanden.</p>
  }

  return (
    <div className="not-prose overflow-hidden rounded-md border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Titel der Vorlage
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Projekte</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Aktion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {templates.map((template) => (
            <tr key={template.id}>
              <td className="px-4 py-3 text-sm text-gray-700">{template.templateTitle}</td>
              <td className="px-4 py-3 text-sm text-gray-700">
                <div className="flex flex-wrap gap-2">
                  {template.projects.length ? (
                    template.projects.map((project) => (
                      <span
                        key={project.id}
                        className="rounded-sm bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                      >
                        {project.slug}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">Kein Projekt</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right text-sm">
                <div className="flex justify-end gap-4">
                  <Link href={`/admin/project-record-templates/${template.id}/edit`}>
                    bearbeiten
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(template.id)}
                    className="cursor-pointer text-blue-600 hover:text-blue-800"
                  >
                    löschen
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
