import { Breadcrumb } from "@/src/app/(admin)/admin/_components/Breadcrumb"
import { HeaderWrapper } from "@/src/app/(admin)/admin/_components/HeaderWrapper"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links/Link"
import getEmailTemplates from "@/src/server/emailTemplates/queries/getEmailTemplates"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = { title: "E-Mail-Templates" }

export default async function AdminEmailTemplatesPage() {
  const templates = await invoke(getEmailTemplates, {})

  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/email-templates", name: "E-Mail-Templates" },
          ]}
        />
      </HeaderWrapper>

      <ul className="list-none pl-0 space-y-6">
        {templates.map((template, index) => (
          <li
            key={template.key}
            className={`rounded-lg border border-gray-200 p-4 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="mt-1 font-semibold">{template.name}</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  template.source === "db"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {template.source === "db" ? "DB-Override" : "Code-Default"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{template.description}</p>
            <p className="mt-1 text-sm text-gray-600">Key: {template.key}</p>
            <div className="mt-3">
              <Link button href={`/admin/email-templates/${template.key}/edit`}>
                Bearbeiten
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
