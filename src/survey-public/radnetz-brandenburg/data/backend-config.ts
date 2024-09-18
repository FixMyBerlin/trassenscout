// this file defines the configuration of the TS survey "backend" for radnetz-brandenburg
// see src/survey-public/README.md

import { TBackendConfig } from "../../utils/backend-config-defaults"

export const backendConfig: TBackendConfig = {
  status: [
    { value: "PENDING", label: "AusstehendTEST", colorClass: "bg-yellow-100", icon: "CLOCK" }, // DEFAULT
    {
      value: "ASSIGNED",
      label: "ZugeordnetTEST (BLT)",
      colorClass: "bg-indigo-100",
      icon: "DOCUMENT",
    },
    {
      value: "IRRELEVANT",
      label: "NichtTEST relevant",
      colorClass: "bg-gray-100",
      icon: "XMARK",
    },
    {
      value: "HANDED_OVER",
      label: "ÜTESTbergeben Planung",
      colorClass: "bg-indigo-100",
      icon: "DOCUMENT",
    },
    { value: "DONE_FAQ", label: "Erledigt (FAQ)", colorClass: "bg-green-100", icon: "CHECKMARK" },
    {
      value: "DONE_PLANING",
      label: "ErTESTledigt (Planung)",
      colorClass: "bg-green-100",
      icon: "CHECKMARK",
    },
  ],
  labels: {
    note: {
      sg: "NotiTESTz",
      help: "BiTESTtte starten Sie immer mit ihrem Namen oder Kürzel.",
    },
    status: { sg: "StaTESTtus" },
    operator: { sg: "BaTESTulastträger" },
    topics: { sg: "TaTESTg", pl: "TaTESTgs" },
    category: { sg: "KategTESTorie" },
    location: { sg: "OrtsaTESTngabe" },
  },
}
