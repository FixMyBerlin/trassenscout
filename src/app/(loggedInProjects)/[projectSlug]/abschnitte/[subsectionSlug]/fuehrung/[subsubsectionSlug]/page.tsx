import { Metadata } from "next"
import { SubsectionDashboardClient } from "../../_components/SubsectionDashboardClient"

export const metadata: Metadata = {
  title: "Eintrag",
  robots: "noindex",
}

export default function SubsubsectionDashboardPage() {
  return <SubsectionDashboardClient />
}
