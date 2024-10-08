import { Metadata } from "next"
import "server-only"
import { Breadcrumb } from "../../_components/Breadcrumb"
import { HeaderWrapper } from "../../_components/HeaderWrapper"
import { AdminProjectsNewForm } from "./_components/AdminProjectsNewForm"

export const metadata: Metadata = { title: "Projekt hinzufügen" }

export default function AdminProjectNewPage() {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/projects", name: "Projekte" },
            { name: "Projekt hinzufügen" },
          ]}
        />
      </HeaderWrapper>

      <AdminProjectsNewForm />
    </>
  )
}
