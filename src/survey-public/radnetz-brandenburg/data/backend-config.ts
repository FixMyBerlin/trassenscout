// this file defines the configuration of the TS survey "backend" for radnetz-brandenburg
// see src/survey-public/README.md

import { TBackendConfig } from "../../utils/backend-config-defaults"

export const backendConfig: TBackendConfig = {
  status: [
    { value: "PENDING", label: "Ausstehend", colorClass: "bg-yellow-100", icon: "CLOCK" }, // DEFAULT
    {
      value: "ASSIGNED",
      label: "Zugeordnet (BLT)",
      colorClass: "bg-indigo-100",
      icon: "DOCUMENT",
    },
    {
      value: "IRRELEVANT",
      label: "Nicht relevant",
      colorClass: "bg-gray-100",
      icon: "XMARK",
    },
    {
      value: "HANDED_OVER",
      label: "Übergeben Planung",
      colorClass: "bg-indigo-100",
      icon: "DOCUMENT",
    },
    { value: "DONE_FAQ", label: "Erledigt (FAQ)", colorClass: "bg-green-100", icon: "CHECKMARK" },
    {
      value: "DONE_PLANING",
      label: "Erledigt (Planung)",
      colorClass: "bg-green-100",
      icon: "CHECKMARK",
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
    },
    {
      label: "Landkreis",
      id: 6,
      value: "landkreis",
    },
    {
      label: "Verbindung ID",
      id: 20,
      value: "verbindungId",
    },
    {
      label: "Verbindung (Von - Bis)",
      id: 30,
      value: "verbindungFromTo",
    },
  ],
}
