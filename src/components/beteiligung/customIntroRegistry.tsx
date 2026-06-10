import { IntroPart1 as FRM7IntroPart1 } from "@/src/components/beteiligung/surveys/frm7/SurveyFRM7"
import { IntroPart1 as RadnetzBrandenburgIntroPart1 } from "@/src/components/beteiligung/surveys/radnetz-brandenbrug/SurveyBB"
import { IntroPart1 as RSTest123IntroPart1 } from "@/src/components/beteiligung/surveys/rstest-1-2-3/SurveyRsTest123"

export const customIntroRegistry = {
  frm7Part1: FRM7IntroPart1,
  radnetzBrandenburgPart1: RadnetzBrandenburgIntroPart1,
  rsTest123Part1: RSTest123IntroPart1,
} as const

export type CustomIntroKey = keyof typeof customIntroRegistry
