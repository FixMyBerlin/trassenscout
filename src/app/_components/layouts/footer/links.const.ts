import type { Route } from "next"

export type FooterLink<T extends string> = {
  name: string
  href: Route<T>
  blank: boolean
}

export const links: FooterLink<string>[] = [
  { name: "Kontakt & Impressum", href: "/kontakt", blank: false },
  { name: "Datenschutz", href: "/datenschutz", blank: false },
]
