import { Routes, useParam } from "@blitzjs/next"
import React from "react"
import { Tabs } from "src/core/components/Tabs/Tabs"
import { useSlugs } from "src/core/hooks"

export const SubsectionTabs: React.FC = () => {
  const { projectSlug, subsectionSlug } = useSlugs()

  if (!(projectSlug && subsectionSlug)) return null
  return (
    <Tabs
      className="mt-7"
      tabs={[
        {
          name: "Planungen",
          href: Routes.SubsectionDashboardPage({
            projectSlug,
            subsectionSlug,
          }),
        },
        {
          name: "TÖBs",
          href: Routes.SubsectionStakeholdersPage({
            projectSlug,
            subsectionSlug,
          }),
        },
      ]}
    />
  )
}
