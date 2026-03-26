import { part1Config } from "@/src/app/beteiligung/_rs8/part1"
import { part2Config } from "@/src/app/beteiligung/_rs8/part2"
import { FormConfig } from "@/src/app/beteiligung/_shared/types"

export const formConfig: FormConfig = {
  meta: {
    version: 1,
    title: "Beteiligung",
    logoUrl: "https://radschnellweg8-lb-wn.de/_astro/image.BNSTrDGZ_Z1ksyyY.webp",
    canonicalUrl: "https://radschnellweg8-lb-wn.de/beteiligung/",
    maptilerUrl: "https://api.maptiler.com/maps/b09268b1-91d0-42e2-9518-321a1a94738f/style.json",
    primaryColor: "#e5007d",
    darkColor: "#1e293b",
    lightColor: "#ffcce8",
  },
  part1: part1Config,
  part2: part2Config,
  part3: null,
  end: {
    progressBarDefinition: 7,
    title: "Vielen Dank für Ihre Teilnahme!",
    description:
      "## Was passiert jetzt?\n\nNach Abschluss der Beteiligung (20.08.2023) werden Ihre Anregungen vom Planungsteam ausgewertet und geprüft, ob und inwieweit sie in die weitere Entwurfsplanung einfließen können. Wir bitten im Vorhinein um Verständnis, dass wir nicht jeden Hinweis kommentieren können. Nach der Auswertung werden wir gebündelt Rückmeldung zu den angesprochenen Themen geben.",
    mailjetWidgetUrl: "https://7p8q.mjt.lu/wgt/7p8q/t5g/form?c=f8dcc5f9",
    buttons: null,
    homeUrl: "https://radschnellweg8-lb-wn.de/beteiligung/",
    buttonLink: {
      label: "Zurück zur Startseite",
      color: "white",
    },
  },
  backend: {
    status: [
      { value: "PENDING", label: "Ausstehend", color: "#FDEEBF", icon: "CLOCK" }, // DEFAULT
      { value: "ASSIGNED", label: "Zugeordnet (BLT)", color: "#e0e7ff", icon: "DOCUMENT" },
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
