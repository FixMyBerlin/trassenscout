import { Metadata } from "next"
import { SubsubsectionDashboardClient } from "../../_components/SubsubsectionDashboardClient"

export const metadata: Metadata = {
  title: "Eintrag",
  robots: "noindex",
}

export default function SubsubsectionDashboardPage() {
  return <SubsubsectionDashboardClient activeTab="general" />
}
