import { part1Config } from "@/src/app/beteiligung/_rstest-1-2-3/part1"
import { part2Config } from "@/src/app/beteiligung/_rstest-1-2-3/part2"
import { part3Config } from "@/src/app/beteiligung/_rstest-1-2-3/part3"
import { FormConfig } from "@/src/app/beteiligung/_shared/types"

export const formConfig: FormConfig = {
  meta: {
    version: 1,
    title: "Beteiligung",
    logoUrl: "https://radschnellweg-frm7.de/logo.png",
    canonicalUrl: "https://radschnellweg-frm7.de/beteiligung/",
    maptilerUrl: "https://api.maptiler.com/maps/a9cd44e7-43f6-4277-8ae0-d910f8162524/style.json",
    primaryColor: "#D60F3D",
    darkColor: "#5F071B",
    lightColor: "#fecdd3",
  },
  part1: part1Config,
  part2: part2Config,
  part3: part3Config,
  end: {
    progressBarDefinition: 8,
    title: "Vielen Dank für Ihre Teilnahme!",
    description:
      "## Was passiert als Nächstes?\n\n\n\nNach Abschluss der Beteiligung (31.03.2024) werden Ihre Anregungen vom Planungsteam ausgewertet. Dabei wird geprüft, ob und inwieweit Ihre Hinweise in die weitere Planung einbezogen werden können. Bitte haben Sie Verständnis dafür, dass wir nicht jeden Hinweis kommentieren können. Nach der Auswertung werden wir zusammenfassend zu den genannten Themen Rückmeldung geben.\n\n ## Möchten Sie uns noch etwas mit auf den Weg geben?\n\nWenn Sie noch weiteres Feedback zur Online-Beteiligung haben, können Sie dies gerne an [info@radschnellverbindungen.info](info@radschnellverbindungen.info) senden.\n\n***Transparenzhinweis:** Die Befragung wurde um die Fragen („Sind Sie bzw. Ihre Eltern in Deutschland geboren“) gekürzt, da diese bei Teilnehmenden zu Irritationen geführt haben. Ziel der Fragen im Rahmen des Forschungsprojekts war die Ermittlung, welche Zielgruppen in zukünftigen Beteiligungen ggf. noch gezielter angesprochen werden müssen. Nach eingängiger Diskussion wurde entschieden, die beiden Fragen zu entfernen.*",
    mailjetWidgetUrl: "https://7p8q.mjt.lu/wgt/7p8q/xwjs/form?c=84250207",
    buttons: null,
    homeUrl: "https://radschnellweg-frm7.de/",
    buttonLink: {
      label: "Zurück zur Startseite",
      color: "white",
    },
  },
  backend: {
    status: [
      { value: "PENDING", label: "Ausstehend", color: "#FDEEBF", icon: "CLOCK" },
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
