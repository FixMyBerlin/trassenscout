import { Metadata } from "next"
import { SubsectionDashboardClient } from "./_components/SubsectionDashboardClient"

export const metadata: Metadata = {
  title: "Planungsabschnitt",
  robots: "noindex",
}

export default function SubsectionDashboardPage() {
  return <SubsectionDashboardClient />
}
