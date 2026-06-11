import { FooterBuildByLineAndFeedback } from "./FooterBuildByLineAndFeedback"
import { FooterLinkList } from "./FooterLinkList"
import { fixmyCityLinks, publicLinks } from "./links.const"

export const FooterGeneral = () => {
  return (
    <footer className="z-0 bg-gray-800 px-6 py-8">
      <div className="pt-6">
        <div className="flex flex-row justify-between">
          <FooterLinkList title="FixMyCity" linkList={fixmyCityLinks} className="mr-4 flex-none" />
          <FooterLinkList
            title="Rechtliches"
            linkList={publicLinks}
            className="mr-4 ml-auto flex-none sm:pr-[12vw]"
          />
        </div>
      </div>
      <FooterBuildByLineAndFeedback />
    </footer>
  )
}
