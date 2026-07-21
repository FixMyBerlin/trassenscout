import { Suspense } from "react"
import { ContactsTable } from "@/src/components/contacts/ContactsTable"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"

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
      />
      <Suspense fallback={<Spinner page />}>
        <ContactsTable />
      </Suspense>
    </>
  )
}
