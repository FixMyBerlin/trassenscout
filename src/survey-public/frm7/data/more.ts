import { TMore } from "src/survey-public/components/types"

export const moreDefinition: TMore = {
  title: { de: "Ihre Hinweise und Wünsche" },
  description: {
    de: "Teil 1 von 2 der Beteiligung ist abgeschlossen. Wenn Sie möchten, können Sie nun konkrete Hinweise zum Radschnellweg abgeben.\n\nDabei interessiert uns besonders, wenn sie Probleme an bestimmten Stellen des Radwegs sehen. Zum Beispiel: Gibt es Orte, die verbessert werden könnten? Oder gibt es Bereiche, die zu Problemen oder Konflikten, zum Beispiel mit zu Fußgehenden oder Autos führen könnten?\n\nIhre speziellen Hinweise, Kommentare oder Ideen sind für uns wichtig. Das hilft uns sehr weiter, den Radschnellweg noch besser zu planen.",
  },
  questionText: { de: "Möchten Sie einen konkreten Hinweis geben?" },
  buttons: [
    {
      label: { de: "Weiter zu den Hinweisen" },
      color: "red",
      onClick: { action: "nextPage" },
    },
    {
      label: { de: "Beteiligung beenden" },
      color: "white",
      onClick: { action: "submit" },
    },
  ],
}
