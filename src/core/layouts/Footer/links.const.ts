import { Routes } from "@blitzjs/next"
import { RouteUrlObject } from "blitz"

export type FooterLink = {
  name: string
  href: RouteUrlObject | string
  blank: boolean
}

export const links: FooterLink[] = [
  { name: "Kontakt & Impressum", href: Routes.Kontakt(), blank: false },
  { name: "Datenschutz", href: Routes.Datenschutz(), blank: false },
]
