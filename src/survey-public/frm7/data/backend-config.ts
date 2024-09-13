// this file describes the configuration the Trassenscout survey "backend"

import { TBackendConfig } from "src/survey-public/rs8/data/backend-config"

export const backendConfig: TBackendConfig = {
  status: [
    { value: "PENDING", label: "Ausstehend", colorClass: "bg-yellow-100", icon: "CLOCK" }, // DEFAULT
    { value: "ASSIGNED", label: "Zugeordnet (BLT)", colorClass: "bg-indigo-100", icon: "DOCUMENT" },
    { value: "IRRELEVANT", label: "Nicht relevant", colorClass: "bg-gray-100", icon: "XMARK" },
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
}
