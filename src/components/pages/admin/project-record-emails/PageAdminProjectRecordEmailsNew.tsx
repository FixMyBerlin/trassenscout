import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminNewProjectRecordEmailForm } from "@/src/components/admin/project-record-emails/new/AdminNewProjectRecordEmailForm"
import { Spinner } from "@/src/components/core/components/Spinner"

export function PageAdminProjectRecordEmailsNew() {
  return (
    <>
      <AdminPageHeader
        parent={{ title: "Protokoll-Emails", href: "/admin/project-record-emails" }}
        title="Neue Protokoll-E-Mail"
      />
      <Suspense fallback={<Spinner page />}>
        <AdminNewProjectRecordEmailForm />
      </Suspense>
    </>
  )
}
