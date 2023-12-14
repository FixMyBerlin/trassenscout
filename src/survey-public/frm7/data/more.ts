import { TMore } from "src/survey-public/components/types"

export const moreDefinition: TMore = {
  title: { de: "Danke, Ihre Daten wurden gesendet." },
  description: {
    de: "Wenn Sie möchten, können Sie uns noch weiteres Feedback z. B. zu einem konkreten Thema oder einer bestimmten Stelle zukommen lassen. Drücken Sie dazu bitte auf “Weitere Hinweise geben”. Dort haben Sie auch die Möglichkeit, Hinweise mit Pin auf einer interaktiven Karte zu verorten.",
  },
  questionText: { de: "Haben Sie noch konkrete Hinweise zu Themen vor Ort?" },
  buttons: [
    {
      label: { de: "Ja, ich habe noch Hinweise" },
      color: "blue",
      onClick: { action: "nextPage" },
    },
    {
      label: { de: "Nein, ich möchte die Umfrage beenden" },
      color: "white",
      onClick: { action: "submit" },
    },
  ],
}
