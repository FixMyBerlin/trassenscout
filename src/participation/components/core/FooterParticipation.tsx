import React from "react"
import { Link } from "src/core/components/links"
import { FooterLinkList } from "../../../core/layouts/Footer/FooterLinkList"
import { links } from "../../../core/layouts/Footer/links.const"

export const FooterParticipation: React.FC = () => {
  return (
    <footer className="z-0 bg-gray-100 px-6 py-8">
      <div className="pt-6">
        <div className="flex flex-row justify-between">
          <FooterLinkList linkList={links} className="ml-auto mr-4 flex-none sm:pr-[12vw]" />
          {/* TODO Update Link list for Beteiligung */}
        </div>
      </div>
    </footer>
  )
}
