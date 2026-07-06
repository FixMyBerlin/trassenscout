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
  { name: "Über den Trassenscout", href: "https://fixmycity.de/trassenscout/", blank: true },
  {
    name: "Trassenscout in der Praxis",
    href: "https://fixmycity.de/referenzen-trassenscout/",
    blank: true,
  },
  {
    name: "TILDA - Offenes Verplanungs-Web-GIS",
    href: "https://tilda-geo.de",
    blank: true,
  },
  { name: "Dienstleistungen", href: "https://fixmycity.de/dienstleistungen/", blank: true },
  {
    name: "Demo-Termin vereinbaren",
    href: "https://fixmycity.de/termin-vereinbaren/",
    blank: true,
  },
  { name: "Newsletter abonnieren", href: "https://fixmycity.de/kontakt/", blank: true },
]
