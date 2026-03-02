import { PageHeader } from "@/src/core/components/pages/PageHeader"
import type { Metadata } from "next"
import { SupportPageClient } from "./_components/SupportPageClient"

export const metadata: Metadata = {
  title: "Support & Dokumentation",
  robots: "noindex",
}

export default async function SupportPage() {
  return (
    <>
      <PageHeader
        title="Support & Dokumentation"
        className="mt-12"
        description="Hier finden Sie die aktuelle Dokumentation zum Trassenscout."
      />
      <SupportPageClient />
    </>
  )
}
