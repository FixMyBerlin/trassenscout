import { Tabs } from "@/src/core/components/Tabs/Tabs"
import { useProjectSlug, useSlugs } from "@/src/core/hooks"
import { Routes } from "@blitzjs/next"

export const SubsectionTabs: React.FC = () => {
  const { subsectionSlug } = useSlugs()
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
