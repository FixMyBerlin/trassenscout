import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { AdminBadge } from "@/src/components/admin/AdminBadge"
import { adminTableEditButtonClassName } from "@/src/components/admin/adminListClasses"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { emailTemplatesQueryOptions } from "@/src/server/emailTemplates/emailTemplatesQueryOptions"

export function PageAdminEmailTemplates() {
  const { data: templates } = useSuspenseQuery(emailTemplatesQueryOptions())

  return (
    <>
      <AdminPageHeader title="E-Mail-Templates" />
      <ul className="list-none space-y-6 pl-0">
        {templates.map((template, index) => (
          <li
            key={template.key}
            className={`rounded-lg border border-gray-200 p-4 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="mt-1 font-semibold">{template.name}</h2>
              <AdminBadge variant={template.source === "db" ? "blue" : "gray"}>
                {template.source === "db" ? "DB-Override" : "Code-Default"}
              </AdminBadge>
            </div>
            <p className="mt-1 text-sm text-gray-600">{template.description}</p>
            <p className="mt-1 text-sm text-gray-600">Key: {template.key}</p>
            <div className="mt-3">
              <Link
                className={adminTableEditButtonClassName}
                to="/admin/email-templates/$templateKey/edit"
                params={{ templateKey: template.key }}
              >
                Bearbeiten
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
