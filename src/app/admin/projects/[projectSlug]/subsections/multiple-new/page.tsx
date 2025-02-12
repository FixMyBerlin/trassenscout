import { Breadcrumb } from "@/src/app/admin/_components/Breadcrumb"
import { HeaderWrapper } from "@/src/app/admin/_components/HeaderWrapper"
import { Metadata } from "next"
import "server-only"
import { MultipleNewSubsectionsForm } from "./_components/MultipleNewSubsectionsForm"

export const metadata: Metadata = { title: "Planungsabschnitte im Bulk-Mode hinzufügen" }
export default async function AdminProjectSubsectionMultipleNewPage({
  params: { projectSlug },
}: {
  params: { projectSlug: string }
}) {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/projects", name: "Projekte" },
            {
              href: `/admin/projects/${projectSlug}/subsections`,
              name: `Projekt ${projectSlug}: Planungsabschnitte`,
            },
            { name: "Planungsabschnitte im Bulk-Mode hinzufügen" },
          ]}
        />
      </HeaderWrapper>

      <MultipleNewSubsectionsForm />
    </>
  )
}
