import { Routes } from "@blitzjs/next"
import { RouteUrlObject } from "blitz"
import React from "react"
import { FooterLinkList } from "./FooterLinkList"

export type FooterMenuItem = {
  name: string
  href: RouteUrlObject | string
  blank: boolean
}

const pages: FooterMenuItem[] = [{ name: "Start", href: Routes.Home(), blank: false }]

const legal: FooterMenuItem[] = [{ name: "Startseite", href: Routes.Home(), blank: false }]

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-gray z-0 pb-16 pt-14" aria-labelledby="footer-heading">
      <div className="pl-4 sm:pl-[3vw]">
        <div className="flex flex-row">
          <FooterLinkList linkList={pages} className="flex-grow sm:px-[3vw]" />
          <FooterLinkList linkList={legal} className="ml-auto mr-4 flex-none sm:pr-[12vw]" />
        </div>
      </div>
    </footer>
  )
}
