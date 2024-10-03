import { Metadata } from "next"
import { Breadcrumb } from "../../_components/Breadcrumb"
import { HeaderWrapper } from "../../_components/HeaderWrapper"
import { AdminProjectsNewForm } from "./_components/AdminProjectsNewForm"

export const metadata: Metadata = { title: "Trasse hinzufügen" }

export default function AdminProjectsNewPage() {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { name: "Trassen" },
            { name: "Trasse hinzufügen" },
          ]}
        />
      </HeaderWrapper>

      <AdminProjectsNewForm />
    </>
  )
}
