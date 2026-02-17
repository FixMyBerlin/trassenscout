import { SubsectionDashboardClient } from "../../_components/SubsectionDashboardClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Eintrag",
  robots: "noindex",
}

export default function SubsubsectionDashboardPage() {
  return <SubsectionDashboardClient />
}
