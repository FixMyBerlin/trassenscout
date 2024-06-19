import { TMore } from "src/survey-public/components/types"

export const moreDefinition: TMore = {
  title: { de: "Ihre Anmerkungen" },
  description: {
    de: `Sie können im Folgenden konkrete Hinweise zum Zielnetzentwurf abgeben. Dabei interessieren uns zum einen wichtige anzubindende **Ziele**, die bei der Umlegung noch nicht ausreichend berücksichtigt wurden, wie bspw. Schulen oder Freizeiteinrichtungen. Zum anderen bitten wir um Vorschläge für **alternative Führungen**, z.B. wenn ein noch nicht berücksichtigter Weg besonders gut für den Radverkehr geeignet ist oder wenn bei der Umsetzung besondere **Hürden** zu erwarten sind, wie bspw. beim Grunderwerb. Wir bitten Sie, Ihre Hinweise auf Ihre jeweilige Gebietskörperschaft zu begrenzen.

## So geht's:
1. Wählen Sie auf der Karte eine Verbindung aus dem Netzentwurf aus.
2. Wählen Sie eine Kategorie aus, zu der Ihr Hinweis passt.
3. Optional können Sie über das Setzen eines zusätzlichen Pins Ihre Rückmeldung   noch konkreter verorten.
4. Schreiben Sie Ihren Hinweis in das Textfeld.
5. Nach dem Speichern Ihres Hinweises können Sie einen weiteren Hinweis   formulieren oder die Beteiligung beenden. Sie können beliebig viele Hinweise zu   verschiedenen Verbindungen geben.
    `,
  },
  questionText: { de: "Möchten Sie einen konkreten Hinweis geben?" },
  buttons: [
    {
      label: { de: "Weiter zur Abgabe von Hinweisen" },
      color: "primaryColor",
      onClick: { action: "nextPage" },
    },
    {
      label: { de: "Ich möchte keinen Hinweis abgeben" },
      color: "white",
      onClick: { action: "submit" },
    },
  ],
}
