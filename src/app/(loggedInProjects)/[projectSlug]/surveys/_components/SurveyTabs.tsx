"use client"

import { TabsApp } from "@/src/core/components/Tabs/TabsApp"
import { Route } from "next"

type Props = {
  tabs: Array<{ name: string; href: Route }>
}

export function SurveyTabs({ tabs }: Props) {
  return <TabsApp tabs={tabs} className="mt-7" />
}
