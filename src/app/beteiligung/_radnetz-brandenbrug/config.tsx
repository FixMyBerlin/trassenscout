import { part1Config } from "@/src/app/beteiligung/_radnetz-brandenbrug/part1"
import { part2Config } from "@/src/app/beteiligung/_radnetz-brandenbrug/part2"
import { FormConfig } from "@/src/app/beteiligung/_shared/types"

export const formConfig = {
  meta: {
    version: 1,
    logoUrl: "https://trassenscout.de/radnetz-brandenburg/bb-logo.png",
    canonicalUrl:
      "https://mil.brandenburg.de/mil/de/themen/mobilitaet-verkehr/radverkehr/radnetz-brandenburg/",
    maptilerUrl: "https://api.maptiler.com/maps/1628cd25-069f-45bc-9e1e-9768388fe544/style.json",
    atlasUrl:
      "https://radverkehrsatlas.de/regionen/bb-sg?map=MAPPARAM&config=z9tzbb.172uzo.i&data=bb-trassenscout-beteiligung,bb-ramboll-netzentwurf-2,bb-land-klassifiertes-strassennetz&v=2",
    primaryColor: "#C73C35",
    darkColor: "#651E1B",
    lightColor: "#DF8A86",
    geometryCategoryType: "line",
  },
  part1: part1Config,
  part2: part2Config,
  part3: null,
  end: {
    progressBarDefinition: 7,
    title: "Vielen Dank für Ihre Teilnahme!",
    description: `Vielen Dank für Ihre Teilnahme. Ihre Hinweise sind bei uns eingegangen und wurden gespeichert. Sie haben für jeden Ihrer Hinweise zur Bestätigung eine E-Mail erhalten.

## Wie geht es weiter?

Die Beteiligung läuft noch **bis zum 8. November 2024**. Bis dahin können Sie auf dem gleichen Wege noch weitere Hinweise einreichen. Nach Abschluss der Beteiligung werden alle Hinweise fachlich geprüft und vom Planungsbüro bearbeitet. Alle Hinweise fließen in die Abwägung zur Überarbeitung des Zielnetzentwurfs mit ein. Nach Abschluss der Auswertung werden die Hinweise und Rückmeldungen für alle Beteiligten im Radverkehrsatlas veröffentlicht.

## Noch Fragen?

Bei Rückfragen zur Beteiligung oder technischen Schwierigkeiten können Sie sich gerne an die beim durchführenden Unternehmen FixMyCity zuständige Mitarbeiterin, Frau Noemi Kuß, wenden.

Mail: [radnetz-brandenburg@fixmycity.de](mailto:radnetz-brandenburg@fixmycity.de),
Tel.: 030-62939269

Weiterführende Informationen zum Radnetz Brandenburg finden Sie außerdem auf der Website des Ministeriums für Infrastruktur und Landesplanung.

`,
    mailjetWidgetUrl: null,
    homeUrl:
      "https://mil.brandenburg.de/mil/de/themen/mobilitaet-verkehr/radverkehr/radnetz-brandenburg/",
    button: {
      label: "Zur Radnetz Brandenburg Website",
      color: "white",
    },
  },
  backend: {
    status: [
      { value: "PENDING", label: "Zu prüfen", color: "#FDEEBF", icon: "CLOCK" }, // DEFAULT
      {
        value: "PRE-CHECKMARK-ADAPTION",
        label: "Prüfung (Anpassung des Netzentwurfs)",
        color: "#D1FAE5",
        icon: "CLOCK",
      },
      {
        value: "PRE-CHECKMARK-NO-ADAPTION",
        label: "Prüfung (keine Anpassung des Netzentwurfs)",
        color: "#FFB3DC",
        icon: "CLOCK",
      },
      {
        value: "ADAPTION-1",
        label: "Erledigt (Anpassung - Neue Route wird ergänzt)",
        color: "#A7F3D0",
        icon: "CHECKMARK",
      },
      {
        value: "ADAPTION-2",
        label: "Erledigt (Anpassung - Relation wird durch alternative Route ersetzt)",
        color: "#A7F3D0",
        icon: "CHECKMARK",
      },
      {
        value: "ADAPTION-3",
        label: "Erledigt (Anpassung - Zwei alternative Routen im finalen Konzept)",
        color: "#A7F3D0",
        icon: "CHECKMARK",
      },
      {
        value: "ADAPTION-4",
        label: "Erledigt (Anpassung - Lückenschluss)",
        color: "#A7F3D0",
        icon: "CHECKMARK",
      },
      {
        value: "ADAPTION-5",
        label: "Erledigt (Anpassung - Sonstiges (Freitext))",
        color: "#A7F3D0",
        icon: "CHECKMARK",
      },
      {
        value: "NO-ADAPTION-1",
        label: "Erledigt (Keine Anpassung - Hinweis zu bestehenden Mängeln)",
        color: "#FF80C5",
        icon: "XMARK",
      },
      {
        value: "NO-ADAPTION-2",
        label: "Erledigt (Keine Anpassung - Vorschlag zu umwegig)",
        color: "#FF80C5",
        icon: "XMARK",
      },
      {
        value: "NO-ADAPTION-3",
        label: "Erledigt (Keine Anpassung - Zu hoher Bauaufwand)",
        color: "#FF80C5",
        icon: "XMARK",
      },
      {
        value: "NO-ADAPTION-4",
        label: "Erledigt (Keine Anpassung - Detailplanung erforderlich)",
        color: "#FF80C5",
        icon: "XMARK",
      },
      {
        value: "NO-ADAPTION-5",
        label: "Erledigt (Keine Anpassung - Fehlender Bezug zum Radnetz bzw. nicht relevant)",
        color: "#FF80C5",
        icon: "XMARK",
      },
      {
        value: "NO-ADAPTION-6",
        label: "Erledigt (Keine Anpassung - Parallele Bahnverbindung)",
        color: "#FF80C5",
        icon: "XMARK",
      },
      {
        value: "NO-ADAPTION-7",
        label: "Erledigt (Keine Anpassung - Strecke zu lang)",
        color: "#FF80C5",
        icon: "XMARK",
      },
      {
        value: "NO-ADAPTION-8",
        label: "Erledigt (Keine Anpassung - Parallele Verbindung vorhanden)",
        color: "#FF80C5",
        icon: "XMARK",
      },
      {
        value: "NO-ADAPTION-9",
        label: "Erledigt (Keine Anpassung - Keine Verbindung für landesweites Konzept)",
        color: "#FF80C5",
        icon: "XMARK",
      },
      {
        value: "NO-ADAPTION-10",
        label: "Erledigt (Keine Anpassung - Sonstiges (Freitext))",
        color: "#FF80C5",
        icon: "XMARK",
      },
    ],
    labels: {
      note: {
        sg: "Rückmeldung an Beteiligte",
        help: "Bitte geben Sie hier die Rückmeldung ein, die Sie an die Beteiligten (Verfasser:in des Hinweises) senden möchten.",
      },
      status: { sg: "Status (Ramboll)" },
      operator: { sg: "Baulastträger" },
      topics: { sg: "Tag", pl: "Tags" },
      category: { sg: "Kategorie" },
      location: { sg: "Ortsangabe" },
    },
    additionalFilters: [
      {
        label: "Landkreis",
        id: 6,
        value: "landkreis",
        surveyPart: "survey",
      },
      {
        label: "Institution",
        id: 5,
        value: "institution",
        surveyPart: "survey",
      },
      {
        label: "Verbindung (von - bis)",
        id: 30,
        value: "verbindungFromTo",
        surveyPart: "feedback",
      },
      {
        label: "Verbindung (ID)",
        id: 20,
        value: "verbindungId",
        surveyPart: "feedback",
      },
    ],
    disableExternalSurveyResponseForm: true,
  },
} satisfies FormConfig
