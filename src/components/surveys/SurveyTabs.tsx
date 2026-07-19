import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"

type Props = {
  tabs: Array<{ name: string; to: string }>
  embedded?: boolean
}

export function SurveyTabs({ tabs, embedded }: Props) {
  return <TabsApp tabs={tabs} embedded={embedded} />
}
