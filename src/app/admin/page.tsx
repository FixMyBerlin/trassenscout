import { Link } from "@/src/core/components/links/Link"
import { Metadata } from "next"
import "server-only"
import { Breadcrumb } from "./_components/Breadcrumb"
import { HeaderWrapper } from "./_components/HeaderWrapper"

export const metadata: Metadata = { title: "Dashboard" }

export default function AdminDashboardPage() {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb pages={[{ href: "/admin", name: "Dashboard" }]} />
      </HeaderWrapper>

      <ul>
        <li>
          <Link href="/admin/projects/new">Neues Projekte</Link>
        </li>
        <li>
          <Link href="/admin/subsections">Planungsabschnitte (Subsections)</Link>
        </li>
        <li>
          <Link href="/admin/memberships">Memberships</Link>
        </li>
        <li>
          <Link href="/admin/surveys">Beteiligungen & Antworten</Link> |{" "}
          <Link href="/admin/surveys/new">Neue Beteiligung</Link>
        </li>
        <li>
          <Link href="/admin/logEntries">LogEntires</Link>
        </li>
      </ul>
    </>
  )
}
