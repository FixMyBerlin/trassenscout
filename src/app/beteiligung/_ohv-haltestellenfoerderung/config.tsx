import { part2Config } from "@/src/app/beteiligung/_ohv-haltestellenfoerderung/part2"
import { FormConfig } from "@/src/app/beteiligung/_shared/types"

export const formConfig: FormConfig = {
  meta: {
    version: 1,
    logoUrl: "https://www.oberhavel.de/media/custom/2244_71430_1_g.PNG?1606723864",
    canonicalUrl: "https://www.oberhavel.de/",
    maptilerUrl: "https://api.maptiler.com/maps/b09268b1-91d0-42e2-9518-321a1a94738f/style.json",
    primaryColor: "#006ab2",
    darkColor: "#00375D",
    lightColor: "#B8D5E9",
    // todo point
    geometryCategoryType: "line",
  },
  part1: null,
  part2: part2Config,
  part3: null,
  end: {
    progressBarDefinition: 7,
    title: "Vielen Dank für Ihre Teilnahme!",
    description:
      "Ihre Angaben wurden gespeichert. Die Auswertung werden wir nach Ende der Beteiligungsphase auf der Projektwebseite veröffentlichen.",
    mailjetWidgetUrl: null,
    homeUrl: "https://www.oberhavel.de/",
    button: {
      label: "Zurück zur Startseite",
      color: "primaryColor",
    },
  },
  backend: {
    additionalFilters: [
      {
        label: "Kommune",
        id: "commune",
        value: "commune",
        surveyPart: "part2",
      },
    ],
    status: [
      { value: "PENDING", label: "Ausstehend", color: "#FDEEBF", icon: "CLOCK" },
      { value: "REJECTED", label: "Abgelehnt", color: "#FEE2E2", icon: "XMARK" },
      { value: "ACCEPTED", label: "Angenommen", color: "#D1FAE5", icon: "CHECKMARK" },
      { value: "PUBLISHED", label: "Veröffentlicht", color: "#BBF7D0", icon: "DOCUMENT" },
    ],
  },
}
