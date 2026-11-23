// Dummy copy of rs8 for marketing screenshots (staging project rs-bb).
import { backendConfig } from "@/src/components/beteiligung/shared/backend-types"
import { FormConfig } from "@/src/components/beteiligung/shared/types"
import { part1Config } from "@/src/components/beteiligung/surveys/rs-musterland/part1"
import { part2Config } from "@/src/components/beteiligung/surveys/rs-musterland/part2"

export const formConfig: FormConfig = {
  meta: {
    version: 1,
    title: "Beteiligung",
    logoUrl: "https://trassenscout.de/favicon.svg",
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
    buttons: null,
    homeUrl: "https://radschnellweg8-lb-wn.de/beteiligung/",
    buttonLink: {
      label: "Zurück zur Startseite",
      color: "white",
    },
  },
  backend: backendConfig,
  email: null,
} satisfies FormConfig
