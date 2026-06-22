import { Metadata } from "next"
import { SubsubsectionDashboardClient } from "../../_components/SubsubsectionDashboardClient"

export const metadata: Metadata = {
  title: "Maßnahme ",
  robots: "noindex",
}

export default function SubsubsectionDashboardPage() {
  return <SubsubsectionDashboardClient activeTab="general" />
}
