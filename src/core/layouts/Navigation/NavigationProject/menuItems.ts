import { Routes } from "@blitzjs/next"

export const menuItemsMobile = [
  { name: "Dashboard", href: Routes.Rs8Index() },
  { name: "Teilstrecke 1", href: Routes.Rs8Teilstrecke1() },
  { name: "Teilstrecke 2", href: Routes.Rs8Teilstrecke2() },
  { name: "Teilstrecke 3", href: Routes.Rs8Teilstrecke3() },
  { name: "Teilstrecke 4", href: Routes.Rs8Teilstrecke4() },
  { name: "Kontakte", href: Routes.ContactsPage({ projectSlug: "rs3000" }) }, // TODO dynamisieren
  { name: "Termine", href: Routes.CalendarEntriesPage({ projectSlug: "rs3000" }) }, // TODO dynamisieren
  { name: "Impressum", href: Routes.Kontakt() },
]

export const menuItemsDesktop = [
  { name: "Dashboard", href: Routes.Rs8Index() },
  {
    name: "Teilstrecken",
    href: Routes.Rs8Teilstrecke1(),

    children: [
      { name: "Teilstrecke 1", href: Routes.Rs8Teilstrecke1() },
      { name: "Teilstrecke 2", href: Routes.Rs8Teilstrecke2() },
      { name: "Teilstrecke 3", href: Routes.Rs8Teilstrecke3() },
      { name: "Teilstrecke 4", href: Routes.Rs8Teilstrecke4() },
    ],
  },

  { name: "Kontakte", href: Routes.ContactsPage({ projectSlug: "rs3000" }) }, // TODO dynamisieren
  { name: "Termine", href: Routes.CalendarEntriesPage({ projectSlug: "rs3000" }) }, // TODO dynamisieren
  { name: "Impressum", href: Routes.Kontakt() },
]
