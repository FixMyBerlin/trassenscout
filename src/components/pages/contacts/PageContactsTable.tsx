import { Suspense } from "react"
import { ContactsTable } from "@/src/components/contacts/ContactsTable"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { Spinner } from "@/src/components/core/components/Spinner"

export function PageContactsTable() {
  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Externe Kontakte"
            sectionTo="/$projectSlug/contacts"
            current="Tabelle"
          />
        }
        info="Tipp: Kontakte können per Kopieren & Einfügen aus Excel übernommen werden."
        title="Externe Kontakte"
      />
      <Suspense fallback={<Spinner page />}>
        <ContactsTable />
      </Suspense>
    </>
  )
}
