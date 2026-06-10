import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"

type Props = {
  tabs: Array<{ name: string; to: string }>
}

export function SurveyTabs({ tabs }: Props) {
  return <TabsApp tabs={tabs} className="mt-7" />
}
