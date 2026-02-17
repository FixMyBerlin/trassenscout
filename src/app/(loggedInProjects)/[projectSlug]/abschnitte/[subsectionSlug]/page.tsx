import { SubsectionDashboardClient } from "./_components/SubsectionDashboardClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Planungsabschnitt",
  robots: "noindex",
}

export default function SubsectionDashboardPage() {
  return <SubsectionDashboardClient />
}
