import { Route } from "next"
import { FooterBuildByLineAndFeedback } from "./FooterBuildByLineAndFeedback"
import { FooterLinkList } from "./FooterLinkList"
import { FooterLogos } from "./FooterLogos"
import { links } from "./links.const"

export type FooterMenuItemLogo = {
  name: string
  href: Route | string
  blank: boolean
  img?: string
}

export const FooterProject = () => {
  return (
    <footer className="z-0">
      <FooterLogos />
      <div className="bg-gray-800 px-6 py-8">
        <div className="pt-6">
          <div className="flex flex-row justify-between">
            <FooterLinkList linkList={links} className="mr-4 ml-auto flex-none sm:pr-[12vw]" />
          </div>
        </div>
        <FooterBuildByLineAndFeedback />
      </div>
    </footer>
  )
}
