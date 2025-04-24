"use client"

// maybe
// not used atm

import { createContext, ReactNode, useContext } from "react"

export const SurveyConfigContext = createContext<any | undefined>(undefined)

export const useSurveyConfig = () => {
  const context = useContext(SurveyConfigContext)
  if (!context) {
    throw new Error("useSurveyConfig must be used within a SurveyConfigProvider")
  }
  return context
}

export function SurveyConfigProvider({ config, children }: { config: any; children: ReactNode }) {
  return <SurveyConfigContext.Provider value={config}>{children}</SurveyConfigContext.Provider>
}
