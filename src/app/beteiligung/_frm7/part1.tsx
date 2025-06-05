import { IntroPart1 } from "@/src/app/beteiligung/_frm7/SurveyFRM7"
import { fieldValidationEnum } from "@/src/app/beteiligung/_shared/fieldvalidationEnum"
import { SurveyPart1and3 } from "@/src/app/beteiligung/_shared/types"

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
              { key: "1", label: "Zu Fuß (länger als 15 Minuten)" },
              { key: "2", label: "Rollstuhl" },
              { key: "3", label: "Fahrrad (ohne Motor)" },
              { key: "4", label: "Pedelec / E-Bike" },
              { key: "5", label: "E-Scooter" },
              { key: "6", label: "Bus & Bahn" },
              { key: "7", label: "Auto" },
              { key: "8", label: "Carsharing" },
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
              { key: "1", label: "Rollstuhl" },
              { key: "2", label: "Fahrrad (ohne Motor)" },
              { key: "3", label: "Pedelec / E-Bike" },
              { key: "4", label: "E-Scooter" },
              { key: "5", label: "Roller / Motorrad" },
              { key: "6", label: "Monatsticket Nahverkehr" },
              { key: "7", label: "Eigenes Auto" },
              { key: "8", label: "Carsharing" },
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
              { key: "1", label: "Ich fahre kein Fahrrad" },
              { key: "2", label: "Bis 10 Minuten" },
              { key: "3", label: "11 bis 20 Minuten" },
              { key: "4", label: "21 bis 30 Minuten" },
              { key: "5", label: "Mehr als 30 Minuten" },
              { key: "6", label: "Keine Angabe" },
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
              { key: "1", label: "Ich fahre Fahrrad, weil es mir Spaß macht." },
              { key: "2", label: "Mit dem Fahrrad bin ich zügiger und flexibler." },
              { key: "3", label: "Bei schlechtem Wetter fahre ich kein Fahrrad." },
              { key: "4", label: "Ich fühle mich sicher auf dem Fahrrad im Verkehr." },
              {
                key: "5",
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
                key: "1",
                label: "Ich kann nicht Fahrrad fahren (fehlende Fertigkeit)",
              },
              {
                key: "2",
                label: "Ich kann nicht Fahrrad fahren (körperliche Einschränkung)",
              },
              { key: "3", label: "Es gibt keine sichere Infrastruktur" },
              { key: "4", label: "Meine Strecken sind zu lang" },
              {
                key: "5",
                label: "Wenige Leute in meiner Umgebung fahren Fahrrad",
              },
              { key: "6", label: "Fahrradfahren ist zu anstrengend" },
              { key: "7", label: "Ich habe kein (gutes) Fahrrad" },
              { key: "8", label: "Ich kann keine Kinder mitnehmen" },
              { key: "9", label: "Andere Gründe" },
              {
                key: "10",
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
              { key: "1", label: "Ja" },
              { key: "2", label: "Nein" },
              {
                key: "3",
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
              { key: "1", label: "Täglich oder fast täglich" },
              { key: "2", label: "Mehrmals pro Woche" },
              { key: "3", label: "Mehrmals im Monat" },
              { key: "4", label: "Seltener oder Nie" },
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
              { key: "1", label: "Zur Arbeit oder Schule pendeln" },
              { key: "2", label: "Einkaufen und Besorgungen" },
              { key: "3", label: "Sport oder Freizeitaktivitäten" },
              { key: "4", label: "Ich nehme Kind(er) mit dem Rad mit" },
              { key: "5", label: "Ich begleite Kind(er) mit dem Rad" },
              { key: "6", label: "Anderes" },
              { key: "7", label: "Keine Angabe" },
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
              { key: "1", label: "Ja, auf jeden Fall" },
              { key: "2", label: "Ja, wahrscheinlich ab und zu" },
              {
                key: "3",
                label: "Nein, ich würde weiterhin mit dem Auto fahren",
              },
              {
                key: "4",
                label: "Nein, ich bin dort ohnehin nicht unterwegs",
              },
              {
                key: "5",
                label: "Ich fahre bereits selten / nie Auto",
              },
              { key: "6", label: "Keine Angabe" },
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
                key: "1",
                label:
                  "Ich fahre gern in ruhigen Wohnstraßen, auch wenn dort Autos unterwegs sind.",
              },
              {
                key: "2",
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
                key: "1",
                label: "Mit dem Rad nutzen.",
              },
              {
                key: "2",
                label: "Eher selten mit dem Rad nutzen.",
              },
              {
                key: "3",
                label: "Nie mit dem Rad nutzen.",
              },
              {
                key: "4",
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
                key: "1",
                label: "Mit dem Rad nutzen.",
              },
              {
                key: "2",
                label: "Eher selten mit dem Rad nutzen.",
              },
              {
                key: "3",
                label: "Nie mit dem Rad nutzen.",
              },
              {
                key: "4",
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
              { key: "1", label: "Ja" },
              { key: "2", label: "Nein" },
            ],
          },
        },
        {
          name: "18",
          component: "SurveyRadiobuttonGroup",
          componentType: "form",
          validation: fieldValidationEnum["requiredString"],
          defaultValue: "",
          props: {
            label: "Welches Geschlecht haben Sie?",
            options: [
              { key: "1", label: "Weiblich" },
              { key: "2", label: "Männlich" },
              { key: "3", label: "Divers (andere)" },
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
              { key: "1", label: "Hauptschulabschluss" },
              { key: "2", label: "Realschulabschluss" },
              { key: "3", label: "Abitur" },
              { key: "4", label: "(Noch) ohne Schulabschluss" },
              { key: "5", label: "Keine Angabe" },
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
                key: "1",
                label: "Lehre, Berufsfachschule, Handelsschule",
              },
              {
                key: "2",
                label: "Meister-/Technikerschule, Fachschule, Berufs-/Fachakademie",
              },
              {
                key: "3",
                label: "Hoch- oder Fachschulabschluss",
              },
              {
                key: "4",
                label: "(Noch) ohne Berufsausbildung",
              },
              {
                key: "5",
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
                key: "1",
                label: "Ja, durch Gehbehinderung",
              },
              {
                key: "2",
                label: "Ja, durch Sehbehinderung",
              },
              {
                key: "3",
                label: "Ja, durch andere Einschränkung(en)",
              },
              {
                key: "4",
                label: "Nein",
              },
              {
                key: "5",
                label: "Keine Angabe",
              },
            ],
          },
        },
      ],
    },
  ],
}
