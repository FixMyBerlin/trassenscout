import { IntroPart1 } from "@/src/app/beteiligung-neu/_frm7-neu/SurveyFRM7NEU"
import { fieldValidationEnum } from "@/src/app/beteiligung-neu/_shared/fieldvalidationEnum"
import { SurveyPart1and3 } from "@/src/app/beteiligung-neu/_shared/types"

export const part1Config: SurveyPart1and3 = {
  progressBarDefinition: 1,
  intro: {
    type: "custom",
    customComponent: <IntroPart1 />,
    buttons: [{ action: "next", label: "Weiter", position: "right" }],
  },
  buttonLabels: { next: "Weiter", back: "Zurück", submit: "Absenden" },
  pages: [
    {
      id: "2",
      fields: [
        {
          name: "titleTraffic",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Ein kurzer Einstieg" },
        },
        {
          name: "descriptionTraffic",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown: "Erzählen Sie uns zum Einstieg davon, welche Verkehrsmittel Sie nutzen.",
          },
        },
        {
          name: "1",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          props: {
            label: "Welche dieser Verkehrsmittel nutzen Sie täglich oder fast täglich?",
            options: [
              { key: "zu_fuss", label: "Zu Fuß (länger als 15 Minuten)" },
              { key: "rollstuhl", label: "Rollstuhl" },
              { key: "bike", label: "Fahrrad (ohne Motor)" },
              { key: "e_bike", label: "Pedelec / E-Bike" },
              { key: "e_scooter", label: "E-Scooter" },
              { key: "bus_bahn", label: "Bus & Bahn" },
              { key: "auto", label: "Auto" },
              { key: "car_sharing", label: "Carsharing" },
            ],
          },
        },
        {
          name: "2",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          props: {
            label: "Welche Verkehrsmittel besitzen Sie?",
            options: [
              { key: "rollstuhl", label: "Rollstuhl" },
              { key: "bike", label: "Fahrrad (ohne Motor)" },
              { key: "e_bike", label: "Pedelec / E-Bike" },
              { key: "e_scooter", label: "E-Scooter" },
              { key: "motorrad", label: "Roller / Motorrad" },
              { key: "bus_bahn", label: "Monatsticket Nahverkehr" },
              { key: "auto", label: "Eigenes Auto" },
              { key: "car_sharing", label: "Carsharing" },
            ],
          },
        },
        {
          name: "3",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Wie lange dauert Ihre häufigste Fahrradstrecke (ein Weg)?",
            options: [
              { key: "fahre_kein_fahrrad", label: "Ich fahre kein Fahrrad" },
              { key: "10", label: "Bis 10 Minuten" },
              { key: "11_20", label: "11 bis 20 Minuten" },
              { key: "21_30", label: "21 bis 30 Minuten" },
              { key: "mehr_30", label: "Mehr als 30 Minuten" },
              { key: "ka", label: "Keine Angabe" },
            ],
          },
        },
        {
          name: "4",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          props: {
            label: "Wählen Sie aus, welchen Aussagen Sie zustimmen.",
            options: [
              { key: "spass", label: "Ich fahre Fahrrad, weil es mir Spaß macht." },
              { key: "flexibler", label: "Mit dem Fahrrad bin ich zügiger und flexibler." },
              { key: "wetter", label: "Bei schlechtem Wetter fahre ich kein Fahrrad." },
              { key: "sicher", label: "Ich fühle mich sicher auf dem Fahrrad im Verkehr." },
              {
                key: "fahre_kein_fahrrad",
                label: "Keine der Antworten trifft auf mich zu, denn ich fahre kein Fahrrad.",
              },
            ],
          },
        },
        {
          name: "5",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          props: {
            label: "Warum können oder wollen Sie nicht öfter Fahrrad fahren?",
            options: [
              {
                key: "kann_nicht_fertigkeit",
                label: "Ich kann nicht Fahrrad fahren (fehlende Fertigkeit)",
              },
              {
                key: "kann_nicht_einschraenkung",
                label: "Ich kann nicht Fahrrad fahren (körperliche Einschränkung)",
              },
              { key: "keine_infra", label: "Es gibt keine sichere Infrastruktur" },
              { key: "zu_lang", label: "Meine Strecken sind zu lang" },
              {
                key: "wenige_leute_fahren_fahrrad",
                label: "Wenige Leute in meiner Umgebung fahren Fahrrad",
              },
              { key: "anstrengend", label: "Fahrradfahren ist zu anstrengend" },
              { key: "kein_fahrrad", label: "Ich habe kein (gutes) Fahrrad" },
              { key: "kinder", label: "Ich kann keine Kinder mitnehmen" },
              { key: "andere", label: "Andere Gründe" },
              {
                key: "fahre_kein_fahrrad",
                label: "Keine Antwort trifft auf mich zu, denn ich fahre Fahrrad",
              },
            ],
          },
        },
      ],
    },
    {
      id: "3",
      fields: [
        {
          name: "titleTraffic2",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Nutzung und Gestaltung FRM7" },
        },
        {
          name: "descriptionTraffic2",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown:
              "In diesem Teil geht es um den Radschnellweg. Wir möchten von Ihnen wissen, ob und wie Sie den Radweg nutzen würden und wie dieser gestaltet sein soll.",
          },
        },
        {
          name: "9",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Würden Sie den FRM7 nutzen?",
            options: [
              { key: "ja", label: "Ja" },
              { key: "nein", label: "Nein" },
              {
                key: "irrelevant",
                label: "Ich bin ohnehin nicht zwischen Frankfurt und Hanau unterwegs.",
              },
            ],
          },
        },
        {
          name: "10",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Wie oft würden Sie den FRM7 nutzen?",
            options: [
              { key: "jtaeglich", label: "Täglich oder fast täglich" },
              { key: "mehrmals_woche", label: "Mehrmals pro Woche" },
              { key: "mehrmals_monat", label: "Mehrmals im Monat" },
              { key: "nie", label: "Seltener oder Nie" },
            ],
          },
        },
        {
          name: "11",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          props: {
            label: "Für welche Fahrten würden Sie den FRM7 nutzen?",
            options: [
              { key: "arbeit_schule", label: "Zur Arbeit oder Schule pendeln" },
              { key: "einkaufen", label: "Einkaufen und Besorgungen" },
              { key: "freizeit", label: "Sport oder Freizeitaktivitäten" },
              { key: "bringe_kinder", label: "Ich nehme Kind(er) mit dem Rad mit" },
              { key: "begleite_kinder", label: "Ich begleite Kind(er) mit dem Rad" },
              { key: "anderes", label: "Anderes" },
              { key: "ka", label: "Keine Angabe" },
            ],
          },
        },
        {
          name: "12",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label:
              "Würden Sie zukünftig Fahrten, die Sie bisher mit dem Auto machen, stattdessen mit dem Fahrrad über den FRM7 machen?",
            options: [
              { key: "ja", label: "Ja, auf jeden Fall" },
              { key: "ja_wahrscheinlich", label: "Ja, wahrscheinlich ab und zu" },
              {
                key: "nein_weiterhin_auto",
                label: "Nein, ich würde weiterhin mit dem Auto fahren",
              },
              {
                key: "nein_dort_nicht_unterwegs",
                label: "Nein, ich bin dort ohnehin nicht unterwegs",
              },
              {
                key: "nein_fahre_bereits_selten_auto",
                label: "Ich fahre bereits selten / nie Auto",
              },
              { key: "ka", label: "Keine Angabe" },
            ],
          },
        },
        {
          name: "13",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Was ist Ihnen beim Radfahren besonders wichtig?",

            options: [
              {
                key: "sicherheit",
                label:
                  "Ich fahre gern in ruhigen Wohnstraßen, auch wenn dort Autos unterwegs sind.",
              },
              {
                key: "schnelligkeit",
                label:
                  "Ich fahre lieber auf sicheren Radwegen an großen Straßen, weil ich dann zügiger vorankomme.",
                description:
                  "Als sichere Radwege verstehen wir Radwege, die entweder baulich vom Autoverkehr getrennt oder farblich deutlich hervorgehoben sind.",
              },
            ],
          },
        },
        {
          name: "14",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label:
              "Ein Weg, auf dem auch Fußgänger und Fußgängerinnen unterwegs sind, würde ich...",
            options: [
              {
                key: "nicht",
                label: "Mit dem Rad nutzen.",
              },
              {
                key: "selten",
                label: "Eher selten mit dem Rad nutzen.",
              },
              {
                key: "nie",
                label: "Nie mit dem Rad nutzen.",
              },
              {
                key: "keine_angabe",
                label: "Keine Angabe",
              },
            ],
          },
        },
        {
          name: "15",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Eine Fahrradstraße, auf der auch Autos erlaubt sind, würde ich...",
            options: [
              {
                key: "nicht",
                label: "Mit dem Rad nutzen.",
              },
              {
                key: "selten",
                label: "Eher selten mit dem Rad nutzen.",
              },
              {
                key: "nie",
                label: "Nie mit dem Rad nutzen.",
              },
              {
                key: "keine_angabe",
                label: "Keine Angabe",
              },
            ],
          },
        },
      ],
    },
    {
      id: "4",
      fields: [
        {
          name: "ueberSieTitle",
          component: "SurveyPageTitle",
          componentType: "content",
          props: { title: "Über Sie" },
        },
        {
          name: "descriptionUeberSie",
          component: "SurveyMarkdown",
          componentType: "content",
          props: {
            markdown: "Erzählen Sie uns von sich. Ihre Antworten sind anonym, also geheim.",
          },
        },
        {
          name: "16",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Wie alt sind Sie?",
            options: [
              { key: "1", label: "Unter 14 Jahre" },
              {
                key: "2",
                label: "14 bis 18 Jahre",
              },
              {
                key: "3",
                label: "19 bis 24 Jahre",
              },
              { key: "4", label: "25 bis 29 Jahre" },
              {
                key: "5",
                label: "30 bis 39 Jahre",
              },
              {
                key: "6",
                label: "40 bis 49 Jahre",
              },
              {
                key: "7",
                label: "50 bis 64 Jahre",
              },
              { key: "8", label: "65 bis 74 Jahre" },
              {
                key: "9",
                label: "Über 74 Jahre",
              },
            ],
          },
        },
        {
          name: "17",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Haben Sie Kinder unter 12 Jahren?",
            options: [
              { key: "ja", label: "Ja" },
              { key: "nein", label: "Nein" },
            ],
          },
        },
        {
          name: "18",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          props: {
            label: "Welches Geschlecht haben Sie?",
            options: [
              { key: "m", label: "Weiblich" },
              { key: "w", label: "Männlich" },
              { key: "d", label: "Divers (andere)" },
            ],
          },
        },
        {
          name: "20",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Was ist Ihr höchster Bildungsabschluss?",
            options: [
              { key: "hauptschule", label: "Hauptschulabschluss" },
              { key: "real", label: "Realschulabschluss" },
              { key: "abi", label: "Abitur" },
              { key: "ohne", label: "(Noch) ohne Schulabschluss" },
              { key: "ka", label: "Keine Angabe" },
            ],
          },
        },
        {
          name: "21",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Was ist Ihr höchster Berufsabschluss?",
            options: [
              {
                key: "lehre",
                label: "Lehre, Berufsfachschule, Handelsschule",
              },
              {
                key: "fachschule",
                label: "Meister-/Technikerschule, Fachschule, Berufs-/Fachakademie",
              },
              {
                key: "hochschule",
                label: "Hoch- oder Fachschulabschluss",
              },
              {
                key: "keine",
                label: "(Noch) ohne Berufsausbildung",
              },
              {
                key: "ka",
                label: "Keine Angabe",
              },
            ],
          },
        },
        {
          name: "22",
          component: "SurveyCheckboxGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredArrayOfString"],
          defaultValue: [],
          props: {
            label:
              "Sind Sie aus gesundheitlichen Gründen in Ihrer Mobilität dauerhaft eingeschränkt?",
            options: [
              {
                key: "ja_gehen",
                label: "Ja, durch Gehbehinderung",
              },
              {
                key: "ja_sehen",
                label: "Ja, durch Sehbehinderung",
              },
              {
                key: "ja_andere",
                label: "Ja, durch andere Einschränkung(en)",
              },
              {
                key: "nein",
                label: "Nein",
              },
              {
                key: "keine_angabe",
                label: "Keine Angabe",
              },
            ],
          },
        },
      ],
    },
  ],
}
