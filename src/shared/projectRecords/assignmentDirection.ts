export const ASSIGNMENT_DIRECTIONS = ["all", "byMe", "toMe", "createdByMe"] as const

type AssignmentDirection = (typeof ASSIGNMENT_DIRECTIONS)[number]

/** Protokoll: "all" drops the involvement filter; only project access narrows the list. */
export const assignmentDirectionOptions: { value: AssignmentDirection; label: string }[] = [
  { value: "all", label: "Alle Protokolleinträge" },
  { value: "byMe", label: "Von mir zugewiesen" },
  { value: "toMe", label: "An mich zugewiesen" },
  { value: "createdByMe", label: "Erstellt von mir" },
]

/** Aufgaben: every option only covers records that have an assignee. */
export const taskDirectionOptions = assignmentDirectionOptions.map((option) =>
  option.value === "all" ? { ...option, label: "Alle Aufgaben" } : option,
)
