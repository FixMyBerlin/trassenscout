import { TSurvey } from "src/survey-public/components/types"

export const surveyDefinition: TSurvey = {
  part: 1,
  version: 1,
  logoUrl: "https://develop--frm-7-landingpage.netlify.app/logo.png", // "https://radschnellweg-frm7.de/logo.png" // todo frm7
  canonicalUrl: "https://staging.radschnellweg-frm7.de/beteiligung/", // "https://radschnellweg-frm7.de/beteiligung/" // todo frm7
  primaryColor: "red",
  pages: [
    {
      id: 1,
      title: { de: "Ihre Meinung zählt!" },
      description: {
        de: "Frankfurt bekommt einen neuen **Radschnellweg** mit dem Namen FRM7, der ohne Umwege nach Maintal und Hanau führt. Radfahrende können auf Radschnellwegen sicher und komfortabel zum Ziel kommen.\n\nWir möchten, dass viele Menschen diesen neuen Radweg nutzen können – sei es auf dem Weg zur Schule, Arbeit, Sport oder beim Einkaufen und Familienausflug. Damit das Projekt zum Erfolg wird, sind Ihre Wünsche  und Hinweise von großer Bedeutung.\n\nSie haben bis zum **31.01.2024** Zeit, um sich zu beteiligen.\n\nDie Beteiligung besteht aus **zwei Teilen**. Im ersten Teil möchten wir in einer kleinen Umfrage von Ihnen wissen, wie Sie sich im Verkehr bewegen und ob und wie Sie den Radschnellweg nutzen würden. Im zweiten Teil können Sie Ihre konkreten Hinweise und Wünsche zum Radschnellweg an uns richten.\n\nEs dauert nur **5-10 Minuten**, um die Fragen zu beantworten.\n\nAlle Ihre Angaben und Hinweise bleiben anonym, also geheim.\n\nBei der Beteiligung geht es konkret um den neu betrachteten Abschnitt im **Bereich Frankfurt**. Falls Sie vorab noch mehr über die Route erfahren wollen, können Sie sich hier über das Projekt informieren: [www.radschnellweg-frm7.de](https://staging.radschnellweg-frm7.de/route).",
      },
      buttons: [
        {
          label: { de: "Beteiligung starten" },
          color: "red",
          onClick: { action: "nextPage" },
        },
      ],
    },
    {
      id: 2,
      title: { de: "Ein kurzer Einstieg" },
      description: {
        de: "Erzählen Sie uns zum Einstieg davon, welche Verkehrsmittel Sie nutzen.",
      },
      questions: [
        {
          id: 1,
          label: { de: "Welche dieser Verkehrsmittel nutzen Sie täglich oder fast täglich?" },
          component: "multipleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Zu Fuß (länger als 15 Minuten)" } },
              {
                id: 2,
                text: { de: "Rollstuhl" },
              },
              {
                id: 3,
                text: {
                  de: "Fahrrad (ohne Motor)",
                },
              },
              {
                id: 4,
                text: {
                  de: "Pedelec / E-Bike",
                },
              },
              { id: 5, text: { de: "E-Scooter" } },
              {
                id: 6,
                text: { de: "Bus & Bahn" },
              },
              {
                id: 7,
                text: {
                  de: "Auto",
                },
              },
              {
                id: 8,
                text: {
                  de: "Carsharing",
                },
              },
            ],
          },
        },
        {
          id: 2,
          label: { de: "Welche Verkehrsmittel besitzen Sie?" },
          component: "multipleResponse",
          props: {
            responses: [
              {
                id: 1,
                text: { de: "Rollstuhl" },
              },
              { id: 2, text: { de: "Fahrrad (ohne Motor)" } },
              { id: 3, text: { de: "Pedelec / E-Bike" } },
              { id: 4, text: { de: "Roller / Motorrad" } },
              { id: 5, text: { de: "E-Scooter" } },
              { id: 6, text: { de: "Monatsticket Nahverkehr" } },
              { id: 7, text: { de: "Eigenes Auto" } },
              { id: 8, text: { de: "Carsharing" } },
            ],
          },
        },
        {
          id: 3,
          label: { de: "Wie lange dauert Ihre häufigste Fahrradstrecke (ein Weg)?" },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ich fahre kein Fahrrad" } },
              { id: 2, text: { de: "Bis 10 Minuten" } },
              { id: 3, text: { de: "11 bis 20 Minuten" } },
              { id: 4, text: { de: "21 bis 30 Minuten" } },
              { id: 5, text: { de: "Mehr als 30 Minuten" } },
              { id: 6, text: { de: "Keine Angabe" } },
            ],
          },
        },
        {
          id: 4,
          label: { de: "Wählen Sie aus, welchen Aussagen Sie zustimmen." },
          component: "multipleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ich fahre Fahrrad, weil es mir Spaß macht." } },
              { id: 2, text: { de: "Mit dem Fahrrad bin ich zügiger und flexibler." } },
              { id: 3, text: { de: "Bei schlechtem Wetter fahre ich kein Fahrrad." } },
              { id: 4, text: { de: "Ich fühle mich sicher auf dem Fahrrad im Verkehr." } },
              {
                id: 5,
                text: {
                  de: "Keine der Antworten trifft auf mich zu, denn ich fahre kein Fahrrad.",
                },
              },
            ],
          },
        },
        {
          id: 5,
          label: {
            de: "Warum können oder wollen Sie nicht öfter Fahrrad fahren?",
          },
          component: "multipleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ich kann nicht Fahrrad fahren (fehlende Fertigkeit)" } },
              {
                id: 2,
                text: { de: "Ich kann nicht Fahrrad fahren (körperliche Einschränkung(en))" },
              },
              { id: 3, text: { de: "Es gibt keine sichere Infrastruktur" } },
              { id: 4, text: { de: "Meine Strecken sind zu lang" } },
              { id: 5, text: { de: "Wenige Leute in meiner Umgebung fahren Fahrrad" } },
              { id: 6, text: { de: "Fahrradfahren ist zu anstrengend" } },
              { id: 7, text: { de: "Ich habe kein (gutes) Fahrrad" } },
              { id: 8, text: { de: "Ich kann keine Kinder mitnehmen" } },
              { id: 9, text: { de: "Andere Gründe" } },
              {
                id: 10,
                text: { de: "Keine Antwort trifft auf mich zu, denn ich fahre gerne Fahrrad" },
              },
            ],
          },
        },
      ],
      buttons: [
        { label: { de: "Weiter" }, color: "red", onClick: { action: "nextPage" } },
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
    {
      id: 3,
      title: { de: "Nutzung und Gestaltung FRM7" },
      description: {
        de: "In diesem Teil geht es um den Radschnellweg. Wir möchten von Ihnen wissen, ob und wie Sie den Radweg nutzen würden und wie dieser gestaltet sein soll.",
      },
      questions: [
        {
          id: 9,
          label: {
            de: "Würden Sie den FRM7 nutzen?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ja" } },
              { id: 2, text: { de: "Nein" } },
              {
                id: 3,
                text: { de: "Ich bin ohnehin nicht zwischen Frankfurt und Hanau unterwegs." },
              },
            ],
          },
        },
        {
          id: 10,
          label: {
            de: "Wie oft würden Sie den FRM7 nutzen?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Täglich oder fast täglich" } },
              { id: 2, text: { de: "Mehrmals pro Woche" } },
              { id: 3, text: { de: "Mehrmals im Monat" } },
              { id: 4, text: { de: "Seltener oder Nie" } },
            ],
          },
        },
        {
          id: 11,
          label: {
            de: "Für welche Fahrten würden Sie den FRM7 nutzen?",
          },
          component: "multipleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Zur Arbeit oder Schule pendeln" } },
              { id: 2, text: { de: "Einkaufen und Besorgungen" } },
              { id: 3, text: { de: "Sport oder Freizeitaktivitäten" } },
              { id: 4, text: { de: "Ich nehme Kind(er) mit dem Rad mit" } },
              { id: 5, text: { de: "Ich begleite Kind(er) mit dem Rad" } },
              { id: 6, text: { de: "Anderes" } },
            ],
          },
        },
        {
          id: 12,
          label: {
            de: "Würden Sie zukünftig Fahrten, die Sie bisher mit dem Auto machen, stattdessen mit dem Fahrrad über den FRM7 machen?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ja, auf jeden Fall" } },
              { id: 2, text: { de: "Ja, wahrscheinlich ab und zu" } },
              { id: 3, text: { de: "Nein, ich würde weiterhin mit dem Auto fahren" } },
              { id: 4, text: { de: "Nein, ich bin dort ohnehin nicht unterwegs" } },
              { id: 5, text: { de: "Ich fahre bereits selten / nie Auto" } },
              { id: 6, text: { de: "Keine Angabe" } },
            ],
          },
        },
        {
          id: 13,
          label: {
            de: "Was ist Ihnen beim Radfahren besonders wichtig?",
          },
          component: "singleResponse",
          props: {
            responses: [
              {
                id: 1,
                text: {
                  de: "Ich fahre gern in ruhigen Wohnstraßen, auch wenn dort Autos unterwegs sind.",
                },
              },
              {
                id: 2,
                text: {
                  de: "Ich fahre lieber auf sicheren Radwegen an großen Straßen, weil ich dann zügiger vorankomme.",
                },
                help: {
                  de: "Als sichere Radwege verstehen wir Radwege, die entweder baulich vom Autoverkehr getrennt oder farblich deutlich hervorgehoben sind.",
                },
              },
            ],
          },
        },
        {
          id: 14,
          label: {
            de: "Ein Weg, auf dem auch Fußgänger und Fußgängerinnen unterwegs sind, würde ich..",
          },
          component: "singleResponse",
          props: {
            responses: [
              {
                id: 1,
                text: {
                  de: "Ohne Einschränkung mit dem Rad nutzen.",
                },
              },
              {
                id: 2,
                text: {
                  de: "Eher selten mit dem Rad nutzen.",
                },
              },
              {
                id: 3,
                text: {
                  de: "Nie mit dem Rad nutzen.",
                },
              },
              {
                id: 4,
                text: {
                  de: "Keine Angabe",
                },
              },
            ],
          },
        },
        {
          id: 15,
          label: {
            de: "Eine Fahrradstraße, auf der auch Autos erlaubt sind, würde ich...",
          },
          component: "singleResponse",
          props: {
            responses: [
              {
                id: 1,
                text: {
                  de: "Ohne Einschränkung mit dem Rad nutzen.",
                },
              },
              {
                id: 2,
                text: {
                  de: "Eher selten mit dem Rad nutzen.",
                },
              },
              {
                id: 3,
                text: {
                  de: "Nie mit dem Rad nutzen.",
                },
              },
              {
                id: 4,
                text: {
                  de: "Keine Angabe",
                },
              },
            ],
          },
        },
      ],
      buttons: [
        { label: { de: "Weiter" }, color: "red", onClick: { action: "nextPage" } },
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
    {
      id: 4,
      title: { de: "Über Sie" },
      description: {
        de: "Erzählen Sie uns von sich. Ihre Antworten sind anonym, also geheim.",
      },
      questions: [
        {
          id: 16,
          label: { de: "Wie alt sind Sie?" },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Unter 14 Jahre" } },
              {
                id: 2,
                text: { de: "14 bis 18 Jahre" },
              },
              {
                id: 3,
                text: {
                  de: "19 bis 24 Jahre",
                },
              },
              { id: 4, text: { de: "25 bis 29 Jahre" } },
              {
                id: 5,
                text: { de: "30 bis 39 Jahre" },
              },
              {
                id: 6,
                text: {
                  de: "40 bis 49 Jahre",
                },
              },
              {
                id: 7,
                text: {
                  de: "50 bis 64 Jahre",
                },
              },
              { id: 8, text: { de: "65 bis 74 Jahre" } },
              {
                id: 9,
                text: { de: "Über 74 Jahre" },
              },
            ],
          },
        },
        {
          id: 17,
          label: { de: "Haben Sie Kinder unter 12 Jahren?" },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ja" } },
              { id: 2, text: { de: "Nein" } },
            ],
          },
        },
        {
          id: 18,
          label: { de: "Welches Geschlecht haben Sie?" },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Weiblich" } },
              { id: 2, text: { de: "Männlich" } },
              { id: 3, text: { de: "Divers (andere)" } },
            ],
          },
        },
        {
          id: 19,
          label: { de: "Wie hoch ist das Nettoeinkommen Ihres Haushalts?" },
          help: {
            de: "Das Nettoeinkommen beschreibt das Geld, das nach Abzug aller Abgaben, Steuern und Beiträge übrig bleibt. Zum Einkommen zählen auch Leistungen wie Arbeitslosengeld oder Bürgergeld.",
          },

          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Weniger als 1.000 Euro" } },
              { id: 2, text: { de: "1.000 bis 3.000 Euro" } },
              { id: 3, text: { de: "3.001 bis 5.000 Euro" } },
              { id: 4, text: { de: "Mehr als 5.000 Euro" } },
              {
                id: 5,
                text: { de: "Keine Angabe" },
              },
            ],
          },
        },
        {
          id: 20,
          label: {
            de: "Was ist Ihr höchster Bildungsabschluss?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Hauptschulabschluss" } },
              { id: 2, text: { de: "Realschulabschluss" } },
              { id: 3, text: { de: "Abitur" } },
              { id: 4, text: { de: "(Noch) ohne Schulabschluss" } },
              { id: 5, text: { de: "Keine Angabe" } },
            ],
          },
        },
        {
          id: 21,
          label: {
            de: "Was ist Ihr höchster Berufsabschluss?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Lehre, Berufsfachschule, Handelsschule" } },
              { id: 2, text: { de: "Meister-/Technikerschule, Fachschule, Berufs-/Fachakademie" } },
              { id: 3, text: { de: "Hoch- oder Fachschulabschluss" } },
              { id: 4, text: { de: "(Noch) ohne Berufsausbildung" } },
              { id: 5, text: { de: "Keine Angabe" } },
            ],
          },
        },
        {
          id: 22,
          label: {
            de: "Sind Sie aus gesundheitlichen Gründen in Ihrer Mobilität dauerhaft eingeschränkt?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ja, durch Gehbehinderung" } },
              { id: 2, text: { de: "Ja, durch Sehbehinderung" } },
              { id: 3, text: { de: "Ja, durch andere Einschränkung(en)" } },
              { id: 4, text: { de: "Nein" } },
              { id: 5, text: { de: "Keine Angabe" } },
            ],
          },
        },
        {
          id: 23,
          label: {
            de: "Sind Sie in Deutschland geboren?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ja" } },
              { id: 2, text: { de: "Nein" } },
              { id: 3, text: { de: "Keine Angabe" } },
            ],
          },
        },
        {
          id: 24,
          label: {
            de: "Sind Ihre Eltern in Deutschland geboren?",
          },
          component: "singleResponse",
          props: {
            responses: [
              { id: 1, text: { de: "Ja" } },
              { id: 2, text: { de: "Nein" } },
              { id: 3, text: { de: "Nur ein Teil meiner Eltern" } },
              { id: 4, text: { de: "Keine Angabe" } },
            ],
          },
        },
      ],
      buttons: [
        { label: { de: "Absenden" }, color: "red", onClick: { action: "submit" } },
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
  ],
}
