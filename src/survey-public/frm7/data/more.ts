import { TMore } from "src/survey-public/components/types"

export const moreDefinition: TMore = {
  title: { de: "Danke, Ihre Daten wurden gesendet." },
  description: {
    de: "Wenn Sie möchten, können Sie uns sagen, was Sie besonders interessiert oder wenn Sie Probleme an bestimmten Stellen sehen. Zum Beispiel: Gibt es Orte, die verbessert werden könnten? Oder gibt es Bereiche, die zu Problemen führen könnten?\n\nIhre speziellen Hinweise, Kommentare oder Ideen sind für uns wichtig. Wenn Sie etwas Bestimmtes bemerkt haben, können Sie es uns mitteilen. Das hilft uns sehr weiter, den Radschnellweg noch besser zu planen.",
  },
  questionText: { de: "Möchten Sie einen konkreten Hinweis geben?" },
  buttons: [
    {
      label: { de: "Ja, ich habe noch Hinweise" },
      color: "red",
      onClick: { action: "nextPage" },
    },
    {
      label: { de: "Nein, ich möchte die Umfrage beenden" },
      color: "white",
      onClick: { action: "submit" },
    },
  ],
}
