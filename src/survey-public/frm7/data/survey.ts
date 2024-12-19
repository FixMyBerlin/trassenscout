import { TSurvey } from "@/src/survey-public/components/types"

export const surveyDefinition: TSurvey = {
  part: 1,
  version: 1,
  logoUrl: "https://radschnellweg-frm7.de/logo.png",
  canonicalUrl: "https://radschnellweg-frm7.de/beteiligung/",
  maptilerUrl: "https://api.maptiler.com/maps/a9cd44e7-43f6-4277-8ae0-d910f8162524/style.json",
  primaryColor: "#D60F3D",
  darkColor: "#5F071B",
  lightColor: "#fecdd3",

  pages: [
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
                text: { de: "Ich kann nicht Fahrrad fahren (körperliche Einschränkung)" },
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
                text: { de: "Keine Antwort trifft auf mich zu, denn ich fahre Fahrrad" },
              },
            ],
          },
        },
      ],
      buttons: [
        { label: { de: "Weiter" }, color: "primaryColor", onClick: { action: "nextPage" } },
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
              { id: 7, text: { de: "Keine Angabe" } },
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
            de: "Ein Weg, auf dem auch Fußgänger und Fußgängerinnen unterwegs sind, würde ich...",
          },
          component: "singleResponse",
          props: {
            responses: [
              {
                id: 1,
                text: {
                  de: "Mit dem Rad nutzen.",
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
                  de: "Mit dem Rad nutzen.",
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
        { label: { de: "Weiter" }, color: "primaryColor", onClick: { action: "nextPage" } },
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
          component: "multipleResponse",
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
      ],
      buttons: [
        { label: { de: "Absenden" }, color: "primaryColor", onClick: { action: "submit" } },
        { label: { de: "Zurück" }, color: "white", onClick: { action: "previousPage" } },
      ],
    },
  ],
  // we had to delete these qustions while survey was active
  // we keep the array of deleted question objects to be able to show these questions in the analysis
  deletedQuestions: [
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
  geometryFallback: [
    [
      [8.72640073, 50.12778261],
      [8.72678835, 50.12760816],
      [8.72718891, 50.12745408],
      [8.727723, 50.12736278],
      [8.72847073, 50.12731713],
      [8.72931637, 50.12745408],
      [8.73080291, 50.12780218],
      [8.73724758, 50.12928586],
      [8.73959756, 50.12947987],
      [8.73928316, 50.13146639],
    ],
    [
      [8.77663714, 50.13794447],
      [8.77618316, 50.13816127],
      [8.77264391, 50.13681415],
      [8.77077107, 50.13609591],
      [8.76907979, 50.13573075],
      [8.7673351, 50.13579922],
      [8.76423739, 50.13583916],
      [8.76322429, 50.13561379],
    ],
    [
      [8.76534284, 50.13461958],
      [8.76394244, 50.13577354],
    ],
    [
      [8.75754515, 50.13474653],
      [8.75787693, 50.13366846],
      [8.75807723, 50.13301761],
    ],
    [
      [8.76396589, 50.13378796],
      [8.7638652, 50.13413031],
      [8.76323031, 50.13561534],
    ],
    [
      [8.70827107, 50.11360366],
      [8.70863619, 50.11364632],
      [8.71108393, 50.11459688],
      [8.71655859, 50.11760985],
      [8.71700797, 50.1180703],
      [8.71758096, 50.11908539],
      [8.71802708, 50.12016766],
      [8.71857897, 50.12054435],
      [8.7187748, 50.12101236],
      [8.7187748, 50.12154885],
      [8.71955813, 50.12311261],
      [8.71962934, 50.12374039],
      [8.72048231, 50.12628046],
      [8.72098796, 50.12636233],
      [8.72378343, 50.12710688],
      [8.72428173, 50.12713951],
      [8.72574595, 50.1275435],
      [8.72684412, 50.12794452],
      [8.7280114, 50.12849765],
      [8.72910185, 50.12932343],
      [8.73017685, 50.13012543],
      [8.73094602, 50.1305195],
      [8.7315804, 50.13073503],
      [8.7321137, 50.13088188],
      [8.7327637, 50.13100904],
      [8.73342117, 50.13108548],
      [8.73569393, 50.13113336],
      [8.736494, 50.13117891],
      [8.73820844, 50.13131752],
      [8.74016691, 50.13158881],
      [8.74130369, 50.13172742],
      [8.74453796, 50.13199276],
      [8.74991295, 50.13235117],
      [8.75309006, 50.13262344],
      [8.75576057, 50.13283878],
      [8.75795304, 50.13301451],
      [8.75992927, 50.13309248],
      [8.7614074, 50.13316674],
      [8.76265268, 50.13335497],
      [8.76366324, 50.13365673],
      [8.76396589, 50.13378796],
      [8.76438797, 50.13366981],
      [8.76559734, 50.13420443],
      [8.76521738, 50.13455193],
      [8.76534284, 50.13461958],
      [8.76754404, 50.13279231],
      [8.76979636, 50.13403902],
      [8.77057968, 50.13425583],
      [8.77276554, 50.13574942],
      [8.77456309, 50.13651241],
      [8.77691308, 50.13719706],
      [8.77663714, 50.13794447],
      [8.77694666, 50.13786568],
      [8.77712642, 50.13785127],
      [8.77898248, 50.13819117],
      [8.7803779, 50.13847633],
    ],
    [
      [8.76322429, 50.13561379],
      [8.75754515, 50.13474653],
      [8.75364631, 50.13398196],
      [8.75126071, 50.13369667],
      [8.74930239, 50.13357114],
      [8.7495137, 50.13232455],
    ],
  ],
}
