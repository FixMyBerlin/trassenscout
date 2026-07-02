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

export const fixmyCityLinks: FooterLink<string>[] = [
  {
    name: "Zum Newsletter anmelden",
    href: "https://fixmycity.de/kontakt/" as Route<string>,
    blank: true,
  },
  {
    name: "Demo Termin vereinbaren",
    href: "https://fixmycity.de/termin-vereinbaren/" as Route<string>,
    blank: true,
  },
  {
    name: "TILDA - Unser Verkehrsplanungs Web-GIS",
    href: "https://tilda-geo.de" as Route<string>,
    blank: true,
  },
  {
    name: "Weitere Dienstleistungen",
    href: "https://fixmycity.de/dienstleistungen/" as Route<string>,
    blank: true,
  },
]

// Legacy export for backwards compatibility
export const links = publicLinks
