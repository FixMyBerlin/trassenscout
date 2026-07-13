import { FooterBuildByLineAndFeedback } from "./FooterBuildByLineAndFeedback"
import { FooterLinkList } from "./FooterLinkList"
import { FooterLogos } from "./FooterLogos"
import { authLinks, publicLinks } from "./links.const"

export const FooterProject = () => {
  const allLinks = [...publicLinks, ...authLinks]
  return (
    <footer className="z-0">
      <FooterLogos />
      <div className="bg-gray-800 px-6 py-8">
        <div className="pt-6">
          <div className="flex flex-row justify-between">
            <FooterLinkList
              title="Rechtliches"
              linkList={allLinks}
              className="mr-4 ml-auto flex-none sm:pr-[12vw]"
            />
          </div>
        </div>
        <FooterBuildByLineAndFeedback />
      </div>
    </footer>
  )
}
