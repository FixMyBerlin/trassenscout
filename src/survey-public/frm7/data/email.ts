import { TEmail } from "src/survey-public/components/types"

export const emailDefinition: TEmail = {
  title: { de: "Vielen Dank für Ihre Teilnahme!" },
  questionText: { de: "Was passiert als Nächstes?" },
  description: {
    de: "Nach Abschluss der Beteiligung (31.03.2024) werden Ihre Anregungen vom Planungsteam ausgewertet. Dabei wird geprüft, ob und inwieweit Ihre Hinweise in die weitere Planung einbezogen werden können. Bitte haben Sie Verständnis dafür, dass wir nicht jeden Hinweis kommentieren können. Nach der Auswertung werden wir zusammenfassend zu den genannten Themen Rückmeldung geben.",
  },
  mailjetWidgetUrl: "https://7p8q.mjt.lu/wgt/7p8q/xwjs/form?c=84250207",
  homeUrl: "https://radschnellweg-frm7.de/",
  button: {
    label: { de: "Zurück zur Startseite" },
    color: "white",
  },
}
