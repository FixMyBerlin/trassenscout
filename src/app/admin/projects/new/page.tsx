import { Link } from "@/src/core/components/links"
import { Metadata } from "next"
import { Breadcrumb } from "../../_components/Breadcrumb"
import { HeaderWrapper } from "../../_components/HeaderWrapper"
import { ProjectForm } from "./_components/ProjectForm"

export const metadata: Metadata = { title: "Trasse hinzufügen" }

export default function AdminProjectsNewPage() {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { name: "Trassen" },
            { href: "/admin/projects/new", name: "Trasse hinzufügen" },
          ]}
        />
      </HeaderWrapper>

      <ProjectForm />

      <hr className="my-5" />
      <p>
        <Link href="/dashboard">Startseite</Link>
      </p>
    </>
  )
}
