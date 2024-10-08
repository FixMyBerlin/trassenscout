import { FooterBuildByLine } from "./FooterBuildByLine"
import { FooterLinkList } from "./FooterLinkList"
import { links } from "./links.const"

export const FooterGeneral = () => {
  return (
    <footer className="z-0 bg-gray-800 px-6 py-8">
      <div className="pt-6">
        <div className="flex flex-row justify-between">
          <FooterLinkList linkList={links} className="ml-auto mr-4 flex-none sm:pr-[12vw]" />
        </div>
      </div>
      <FooterBuildByLine />
    </footer>
  )
}
