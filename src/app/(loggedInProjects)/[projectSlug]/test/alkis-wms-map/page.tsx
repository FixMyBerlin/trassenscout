import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { Metadata } from "next"
import "server-only"
import { AlkisWmsMapProjectClient } from "./_components/AlkisWmsMapProjectClient"

export const metadata: Metadata = {
  robots: "noindex",
  title: "ALKIS WMS Flurstücke (Berlin) – Test",
}

export default function AlkisWmsBerlinTestMapPage() {
  return (
    <>
      <PageHeader
        title="ALKIS WMS Flurstücke (Berlin)"
        subtitle="Testseite"
        description="Hardcoded WMS-GetMap (Raster-Tiles) gegen das Geoportal Berlin. Nur zur Entwicklung, nicht für Produktion."
      />

      <AlkisWmsMapProjectClient />
    </>
  )
}
