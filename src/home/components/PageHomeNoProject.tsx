import Image from "next/image"
import { LinkMail } from "src/core/components/links"
import { H1 } from "src/core/components/text/Headings"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import Logo from "./../../core/layouts/Navigation/assets/trassenscout-logo-without-text.svg"

const ITEMS_PER_PAGE = 100

const PageHomeNoProject = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title="" />

      <div className="set-bg-gray-100-on-body">
        <div className="flex h-full w-full">
          <div className="mx-auto flex max-w-xl flex-col items-center py-24">
            <Image src={Logo} alt="Trassenscout" height={60} />

            <H1 className="mt-12 text-center">Noch keiner Trasse zugeordnet</H1>
            <div className="rounded-lg bg-white px-8 py-4 text-sm shadow-md">
              <p>
                Ein Admin wurde unterrichtet. Sobald Sie einer Trasse zugeordnet wurden, bekommen
                Sie eine Nachricht.
              </p>
              <p>
                Kam es zu einem Fehler?{" "}
                <LinkMail mailto="hello@trassenscout.de">Admin kontaktieren</LinkMail>
              </p>
            </div>
          </div>
        </div>
      </div>
    </LayoutArticle>
  )
}

export default PageHomeNoProject
