import { Routes } from "@blitzjs/next"
import { RouteUrlObject } from "blitz"

export type FooterLink = {
  name: string
  href: RouteUrlObject | string
  blank: boolean
}

export const links: FooterLink[] = [
  { name: "Kontakt & Impressum", href: Routes.Kontakt(), blank: false }, // TODO: Kontakt und Impressum einheitlich benennen
  { name: "Datenschutz", href: Routes.Home(), blank: false }, // TODO update Link
]
