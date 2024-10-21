import { Breadcrumb } from "@/src/app/admin/_components/Breadcrumb"
import { HeaderWrapper } from "@/src/app/admin/_components/HeaderWrapper"
import { Metadata } from "next"
import "server-only"
import { MultipleNewSubsectionsForm } from "./_components/MultipleNewSubsectionsForm"

export const metadata: Metadata = { title: "Planungsabschnitte im Bulk-Mode hinzufügen" }

export default function AdminProjectSubsectionMultipleNewPage() {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { name: "Projekte" },
            { name: "Planungsabschnitte" },
            { name: "Planungsabschnitte im Bulk-Mode hinzufügen" },
          ]}
        />
      </HeaderWrapper>

      <MultipleNewSubsectionsForm />
    </>
  )
}
