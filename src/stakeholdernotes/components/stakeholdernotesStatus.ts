export const stakeholderNotesStatus = {
  IRRELEVANT: "Nicht erforderlich",
  PENDING: "Ausstehend",
  IN_PROGRESS: "In Arbeit",
  DONE: "Erledigt",
}

export const stakeholderNoteLabel = (key: string | string[] | undefined | null) => {
  if (!key) return undefined
  return (stakeholderNotesStatus as Record<string, string>)[String(key)]
}
