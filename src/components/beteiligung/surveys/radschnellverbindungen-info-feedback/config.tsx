import { FormConfig } from "@/src/components/beteiligung/shared/types"
import { part2Config } from "@/src/components/beteiligung/surveys/radschnellverbindungen-info-feedback/part2"

export const formConfig: FormConfig = {
  meta: {
    version: 1,
    title: "Hinweise zu Radschnellverbindungen",
    logoUrl: "https://radschnellverbindungen.info/favicon.svg",
    canonicalUrl: "https://trassenscout.de/beteiligung/radschnellverbindungen-info-feedback",
    maptilerUrl: "https://api.maptiler.com/maps/a9cd44e7-43f6-4277-8ae0-d910f8162524/style.json",
    primaryColor: "#059669",
    darkColor: "#047857",
    lightColor: "#d1fae5",
  },
  part1: null,
  part2: part2Config,
  part3: null,
  end: {
    progressBarDefinition: 3,
    title: "Vielen Dank!",
    description: `Danke für die Hinweise, wir melden uns bei Rückfragen und werden zeitnah ein Update veröffentlichen. Rückfragen gerne an [trassenscout@fixmycity.de](mailto:trassenscout@fixmycity.de).`,
    mailjetWidgetUrl: null,
    buttons: [
      {
        action: "part2",
        label: "Weiteren Hinweis abgeben",
        position: "left",
        color: "primaryColor",
      },
    ],
    homeUrl: "https://radschnellverbindungen.info/steckbriefe/",
    buttonLink: {
      label: "Zu den Steckbriefen",
      color: "white",
    },
  },
  backend: {
    status: [
      { value: "PENDING", label: "Ausstehend", color: "#FDEEBF", icon: "CLOCK" },
      { value: "ASSIGNED", label: "Zugeordnet", color: "#e0e7ff", icon: "DOCUMENT" },
      { value: "IRRELEVANT", label: "Nicht relevant", color: "#f3f4f6", icon: "XMARK" },
      {
        value: "HANDED_OVER",
        label: "Übergeben Planung",
        color: "#e0e7ff",
        icon: "DOCUMENT",
      },
      { value: "DONE_FAQ", label: "Erledigt (FAQ)", color: "#D1FAE5", icon: "CHECKMARK" },
      {
        value: "DONE_PLANING",
        label: "Erledigt (Planung)",
        color: "#D1FAE5",
        icon: "CHECKMARK",
      },
    ],
  },
  email: null,
} satisfies FormConfig
