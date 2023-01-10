import React from "react"
import { PageHeader } from "src/core/components/PageHeader"
import { contacts } from "src/fakeServer/rs8/contacts.const"
import { ContactTable } from "./ContactTable"

export const PageKontakte: React.FC = () => {
  return (
    <>
      <PageHeader
        title="Kontakte"
        description="Dieser Bereich hilft Ihnen dabei wichtige Kontakte zu verwalten und
        anzuschreiben."
      />

      <ContactTable contacts={contacts} />
    </>
  )
}
