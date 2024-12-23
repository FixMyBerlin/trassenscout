// this file defines the configuration of the TS survey "backend" for radnetz-brandenburg
// see src/survey-public/README.md

import { TBackendConfig } from "../../utils/backend-config-defaults"

export const backendConfig: TBackendConfig = {
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
}
