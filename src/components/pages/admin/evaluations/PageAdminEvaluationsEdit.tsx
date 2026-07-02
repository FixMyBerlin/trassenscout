import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminEvaluationsPageEditForm } from "@/src/components/admin/evaluations/edit/AdminEvaluationsPageEditForm"
import { Spinner } from "@/src/components/core/components/Spinner"

export function PageAdminEvaluationsEdit() {
  return (
    <>
      <AdminPageHeader title="Auswertungen-Seite bearbeiten" />
      <Suspense fallback={<Spinner page />}>
        <AdminEvaluationsPageEditForm />
      </Suspense>
    </>
  )
}
