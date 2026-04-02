import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { Metadata } from "next"
import "server-only"
import { AlkisTestMap } from "./_components/AlkisTestMap"

export const metadata: Metadata = {
  robots: "noindex",
  title: "ALKIS Flurstücke (Berlin) – Test",
}

export default function AlkisBerlinTestMapPage() {
  return (
    <>
      <PageHeader
        title="ALKIS Flurstücke (Berlin)"
        subtitle="Testseite"
        description="Hardcoded WFS-GetFeature (BBOX) gegen das Geoportal Berlin. Nur zur Entwicklung, nicht für Produktion."
      />

      <section className="mt-12">
        <AlkisTestMap />
      </section>
    </>
  )
}

