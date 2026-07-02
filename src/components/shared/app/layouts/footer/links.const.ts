export type FooterLink<T extends string = string> = {
  name: string
  href: string | T
  blank: boolean
}

export const publicLinks: FooterLink[] = [
  { name: "Kontakt & Impressum", href: "/kontakt", blank: false },
  { name: "Datenschutz", href: "/datenschutz", blank: false },
]

export const authLinks: FooterLink[] = [
  { name: "Support & Dokumentation", href: "/support", blank: false },
]

export const fixmyCityLinks: FooterLink[] = [
  { name: "Zum Newsletter anmelden", href: "https://fixmycity.de/kontakt/", blank: true },
  {
    name: "Demo Termin vereinbaren",
    href: "https://fixmycity.de/termin-vereinbaren/",
    blank: true,
  },
  { name: "TILDA - Unser Verkehrsplanungs Web-GIS", href: "https://tilda-geo.de", blank: true },
  { name: "Weitere Dienstleistungen", href: "https://fixmycity.de/dienstleistungen/", blank: true },
]
