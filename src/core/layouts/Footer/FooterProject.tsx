import { useParam } from "@blitzjs/next"
import { Project } from "@prisma/client"
import { RouteUrlObject } from "blitz"

import React from "react"
import { FooterBuildByLine } from "./FooterBuildByLine"
import { FooterLinkList } from "./FooterLinkList"
import { FooterLogos } from "./FooterLogos"
import { links } from "./links.const"

export type FooterMenuItemLogo = {
  name: string
  href: RouteUrlObject | string
  blank: boolean
  img?: string
}

const getLogos = (projectSlug: Project["slug"] | undefined) => {
  if (!projectSlug) return []

  return [
    {
      name: "RS8",
      img: "",
      href: "https://www.landkreis-ludwigsburg.de/de/verkehr-sicherheit-ordnung/radverkehr/radschnellwege/",
      blank: true,
    },
  ]
} // TODO: dynamisieren

export const FooterProject: React.FC = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <footer className="z-0 bg-gray-800 px-6 py-8">
      <div className="pt-6">
        <div className="flex flex-row justify-between">
          <FooterLogos logos={getLogos(projectSlug)} className="" />
          <FooterLinkList linkList={links} className="ml-auto mr-4 flex-none sm:pr-[12vw]" />
        </div>
      </div>
      <FooterBuildByLine />
    </footer>
  )
}
