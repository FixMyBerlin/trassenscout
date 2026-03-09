import type { Route } from "next"

export type FooterLink<T extends string> = {
  name: string
  href: Route<T>
  blank: boolean
}

export const publicLinks: FooterLink<string>[] = [
  { name: "Kontakt & Impressum", href: "/kontakt", blank: false },
  { name: "Datenschutz", href: "/datenschutz", blank: false },
]

export const authLinks: FooterLink<string>[] = [
  { name: "Support & Dokumentation", href: "/support", blank: false },
]

// Legacy export for backwards compatibility
export const links = publicLinks
