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
            <h2 className="font-semibold mt-1">{template.name}</h2>
            <p className="mt-1 text-sm text-gray-600">{template.description}</p>
            <p className="mt-2 text-sm">
              Quelle: {template.source === "db" ? "DB-Override" : "Code-Default"}
            </p>
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
