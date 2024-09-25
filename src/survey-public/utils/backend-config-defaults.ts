// this file defines the DEFAULT configuration of the TS survey "backend"; it can be used as copy template for the survey specific config files
// see src/survey-public/README.md

type StatusItem = {
  value: string
  label: string
  colorClass: string
  icon: "XMARK" | "CLOCK" | "CHECKMARK" | "DOCUMENT"
}

export type TBackendConfig = {
  // if no status property exists in the config object, the default status items will be used
  status: [StatusItem, ...StatusItem[]]
  // if no labels property exists in the config object, the default labels will be used
  labels?: {
    note?: { sg: string; help: string }
    status?: { sg: string }
    operator?: { sg: string }
    topics?: { sg: string; pl: string }
    category?: { sg: string }
    location?: { sg: string }
  }
}

export type TBackendConfigDefaults = {
  status: TBackendConfig["status"]
  labels: {
    note: NonNullable<NonNullable<TBackendConfig["labels"]>["note"]>
    status: NonNullable<NonNullable<TBackendConfig["labels"]>["status"]>
    operator: NonNullable<NonNullable<TBackendConfig["labels"]>["operator"]>
    topics: NonNullable<NonNullable<TBackendConfig["labels"]>["topics"]>
    category: NonNullable<NonNullable<TBackendConfig["labels"]>["category"]>
    location: NonNullable<NonNullable<TBackendConfig["labels"]>["location"]>
  }
}

export const backendConfig: TBackendConfigDefaults = {
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
  labels: {
    note: {
      sg: "Notiz",
      help: "Bitte starten Sie immer mit ihrem Namen oder Kürzel.",
    },
    status: { sg: "Status" },
    operator: { sg: "Baulastträger" },
    topics: { sg: "Tag", pl: "Tags" },
    category: { sg: "Kategorie" },
    location: { sg: "Ortsangabe" },
  },
}
