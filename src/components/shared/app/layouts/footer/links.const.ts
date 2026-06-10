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
