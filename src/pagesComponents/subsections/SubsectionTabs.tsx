import { Tabs } from "@/src/core/components/Tabs/Tabs"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import { Routes } from "@blitzjs/next"

export const SubsectionTabs = () => {
  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()

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
