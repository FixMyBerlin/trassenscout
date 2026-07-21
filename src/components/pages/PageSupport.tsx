import { Suspense } from "react"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"
import { SupportPageClient } from "@/src/components/support/SupportPageClient"

export function PageSupport() {
  return (
    <>
      <PageHeader
        title="Support & Dokumentation"
        info="Hier finden Sie Anleitungen, Hintergrundinformationen und Erklärungen zu allen Funktionen des Trassenscouts."
      />
      <Suspense fallback={<Spinner page />}>
        <SupportPageClient />
      </Suspense>
    </>
  )
}
