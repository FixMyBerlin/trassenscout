import { Routes } from "@blitzjs/next"
import React from "react"
import { SurveyFooterLinkList } from "./SurveyFooterLinkList"

export const SurveyFooter: React.FC = () => {
  return (
    <footer className="z-0 bg-gray-100 px-6 py-8">
      <div className="pt-6">
        <div className="flex flex-row justify-between">
          <SurveyFooterLinkList
            linkList={[
              { name: "Kontakt & Impressum", href: Routes.Kontakt(), blank: true },
              { name: "Datenschutz", href: Routes.Datenschutz(), blank: true },
            ]}
            className="ml-auto mr-4 flex-none sm:pr-[12vw]"
          />
        </div>
      </div>
    </footer>
  )
}
