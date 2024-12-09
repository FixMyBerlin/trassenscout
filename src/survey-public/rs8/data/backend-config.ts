// this file defines the configuration of the TS survey "backend" for rs8
// see src/survey-public/README.md

import { TBackendConfig } from "../../utils/backend-config-defaults"

export const backendConfig: TBackendConfig = {
  status: [
    { value: "PENDING", label: "Ausstehend", color: "#FDEEBF", icon: "CLOCK" }, // DEFAULT
    { value: "ASSIGNED", label: "Zugeordnet (BLT)", color: "#e0e7ff", icon: "DOCUMENT" },
    { value: "IRRELEVANT", label: "Nicht relevant", color: "#f3f4f6", icon: "XMARK" },
    {
      value: "HANDED_OVER",
      label: "Übergeben Planung",
      color: "#e0e7ff",
      icon: "DOCUMENT",
    },
    { value: "DONE_FAQ", label: "Erledigt (FAQ)", color: "#D1FAE5", icon: "CHECKMARK" },
    {
      value: "DONE_PLANING",
      label: "Erledigt (Planung)",
      color: "#D1FAE5",
      icon: "CHECKMARK",
    },
  ],
}
