// this file defines the DEFAULT configuration of the TS survey "backend"; it can be used as copy template for the survey specific config files
// see src/survey-public/README.md

type StatusItem = {
  value: string
  label: string
  color: `#${string}`
  icon: "XMARK" | "CLOCK" | "CHECKMARK" | "DOCUMENT"
}

type TAdditionalFiltersItem = {
  label: string
  value: string
  id: number
  surveyPart: "survey" | "feedback"
  // todo: in the future, we might want to add more filter options here, like single or multi select
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
  // additional filters can only be defined for questions of type text for now
  additionalFilters?: [TAdditionalFiltersItem, ...TAdditionalFiltersItem[]]
  disableExternalSurveyResponseForm?: boolean
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
