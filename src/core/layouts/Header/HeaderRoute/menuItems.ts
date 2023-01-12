import { Routes as PageRoutes } from "@blitzjs/next"

export const menuItemsMobile = [
  { name: "Dashboard", href: PageRoutes.Rs8Index() },
  { name: "Teilstrecke 1", href: PageRoutes.Rs8Teilstrecke1() },
  { name: "Teilstrecke 2", href: PageRoutes.Rs8Teilstrecke2() },
  { name: "Teilstrecke 3", href: PageRoutes.Rs8Teilstrecke3() },
  { name: "Teilstrecke 4", href: PageRoutes.Rs8Teilstrecke4() },
  { name: "Kontakte", href: PageRoutes.ContactsPage() },
  { name: "Termine", href: PageRoutes.CalendarEntriesPage() },
  { name: "Impressum", href: PageRoutes.Kontakt() },
]

export const menuItemsDesktop = [
  { name: "Dashboard", href: PageRoutes.Rs8Index() },
  {
    name: "Teilstrecken",
    href: PageRoutes.Rs8Teilstrecke1(),

    children: [
      { name: "Teilstrecke 1", href: PageRoutes.Rs8Teilstrecke1() },
      { name: "Teilstrecke 2", href: PageRoutes.Rs8Teilstrecke2() },
      { name: "Teilstrecke 3", href: PageRoutes.Rs8Teilstrecke3() },
      { name: "Teilstrecke 4", href: PageRoutes.Rs8Teilstrecke4() },
    ],
  },

  { name: "Kontakte", href: PageRoutes.ContactsPage() },
  { name: "Termine", href: PageRoutes.CalendarEntriesPage() },
  { name: "Impressum", href: PageRoutes.Kontakt() },
]
