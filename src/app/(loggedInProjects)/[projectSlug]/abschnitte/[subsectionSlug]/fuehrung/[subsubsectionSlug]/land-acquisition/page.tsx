import { Metadata } from "next"
import { SubsubsectionDashboardClient } from "../../../_components/SubsubsectionDashboardClient"

export const metadata: Metadata = {
  title: "Grunderwerb",
  robots: "noindex",
}

export default function SubsubsectionLandAcquisitionPage() {
  return <SubsubsectionDashboardClient activeTab="land-acquisition" />
}
