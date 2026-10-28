import { backendConfig } from "@/src/components/beteiligung/shared/backend-types"
import type { FormConfig } from "@/src/components/beteiligung/shared/types"
import { part1Config } from "@/src/components/beteiligung/surveys/wbr-mieterbefragung/part1"

export const formConfig: FormConfig = {
  meta: {
    version: 1,
    title: "Mieter:innenbefragung im Projekt WohnBauRad",
    logoUrl: "https://trassenscout.de/favicon.svg",
    canonicalUrl: "https://staging.trassenscout.de/beteiligung/wbr-mieterbefragung",
    // Same base style as kmp-messwerte; project-specific layers are Dev follow-up.
    maptilerUrl: "https://api.maptiler.com/maps/positron/style.json",
    primaryColor: "#059669",
    darkColor: "#047857",
    lightColor: "#d1fae5",
  },
  part1: part1Config,
  part2: null,
  part3: null,
  end: {
    progressBarDefinition: 4,
    title: "Vielen Dank für Ihre Teilnahme!",
    description:
      "Ihre Antworten wurden übermittelt. Sie helfen dabei, die Bedürfnisse der Mieter:innen im Projekt WohnBauRad besser zu verstehen. Die Ergebnisse werden im Anschluss ausgewertet und allen Mieter:innen zeitnah zugänglich gemacht.\n\nDie Ergebnisse werden für weitere Abstimmungen mit der Münchner Wohnen genutzt. Ob, wo und in welcher Form neue Abstellmöglichkeiten entstehen können, ist damit noch nicht entschieden.",
    buttons: null,
    homeUrl: "https://fixmycity.de/wohnbaurad/",
    buttonLink: { label: "Mehr über WohnBauRad erfahren", color: "white" },
  },
  backend: backendConfig,
  email: null,
  adminEmail: null,
}
