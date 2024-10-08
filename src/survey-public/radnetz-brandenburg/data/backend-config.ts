// this file defines the configuration of the TS survey "backend" for radnetz-brandenburg
// see src/survey-public/README.md

import { TBackendConfig } from "../../utils/backend-config-defaults"

export const backendConfig: TBackendConfig = {
  status: [
    { value: "PENDING", label: "Zu prüfen", colorClass: "bg-yellow-100", icon: "CLOCK" }, // DEFAULT
    {
      value: "PRE-CHECKMARK-ADAPTION",
      label: "Prüfung (Anpassung des Netzentwurfs)",
      colorClass: "bg-green-100",
      icon: "CLOCK",
    },
    {
      value: "PRE-CHECKMARK-NO-ADAPTION",
      label: "Prüfung (keine Anpassung des Netzentwurfs)",
      colorClass: "bg-pink-100",
      icon: "CLOCK",
    },
    {
      value: "ADAPTION-1",
      label: "Erledigt (Anpassung - Neue Route wird ergänzt)",
      colorClass: "bg-green-200",
      icon: "CHECKMARK",
    },
    {
      value: "ADAPTION-2",
      label: "Erledigt (Anpassung - Relation wird durch alternative Route ersetzt)",
      colorClass: "bg-green-200",
      icon: "CHECKMARK",
    },
    {
      value: "ADAPTION-3",
      label: "Erledigt (Anpassung - Zwei alternative Routen im finalen Konzept)",
      colorClass: "bg-green-200",
      icon: "CHECKMARK",
    },
    {
      value: "ADAPTION-4",
      label: "Erledigt (Anpassung - Lückenschluss)",
      colorClass: "bg-green-200",
      icon: "CHECKMARK",
    },
    {
      value: "ADAPTION-5",
      label: "Erledigt (Anpassung - Sonstiges (Freitext))",
      colorClass: "bg-green-200",
      icon: "CHECKMARK",
    },
    {
      value: "NO-ADAPTION-1",
      label: "Erledigt (Keine Anpassung - Hinweis zu bestehenden Mängeln)",
      colorClass: "bg-pink-200",
      icon: "XMARK",
    },
    {
      value: "NO-ADAPTION-2",
      label: "Erledigt (Keine Anpassung - Vorschlag zu umwegig)",
      colorClass: "bg-pink-200",
      icon: "XMARK",
    },
    {
      value: "NO-ADAPTION-3",
      label: "Erledigt (Keine Anpassung - Zu hoher Bauaufwand)",
      colorClass: "bg-pink-200",
      icon: "XMARK",
    },
    {
      value: "NO-ADAPTION-4",
      label: "Erledigt (Keine Anpassung - Detailplanung erforderlich)",
      colorClass: "bg-pink-200",
      icon: "XMARK",
    },
    {
      value: "NO-ADAPTION-5",
      label: "Erledigt (Keine Anpassung - Fehlender Bezug zum Radnetz bzw. nicht relevant)",
      colorClass: "bg-pink-200",
      icon: "XMARK",
    },
    {
      value: "NO-ADAPTION-6",
      label: "Erledigt (Keine Anpassung - Parallele Bahnverbindung)",
      colorClass: "bg-pink-200",
      icon: "XMARK",
    },
    {
      value: "NO-ADAPTION-7",
      label: "Erledigt (Keine Anpassung - Strecke zu lang)",
      colorClass: "bg-pink-200",
      icon: "XMARK",
    },
    {
      value: "NO-ADAPTION-8",
      label: "Erledigt (Keine Anpassung - Parallele Verbindung vorhanden)",
      colorClass: "bg-pink-200",
      icon: "XMARK",
    },
    {
      value: "NO-ADAPTION-9",
      label: "Erledigt (Keine Anpassung - Keine Verbindung für landesweites Konzept)",
      colorClass: "bg-pink-200",
      icon: "XMARK",
    },
    {
      value: "NO-ADAPTION-10",
      label: "Erledigt (Keine Anpassung - Sonstiges (Freitext))",
      colorClass: "bg-pink-200",
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
      label: "Institution",
      id: 5,
      value: "institution",
      surveyPart: "survey",
    },
    {
      label: "Landkreis",
      id: 6,
      value: "landkreis",
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
}
