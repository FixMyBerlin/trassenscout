export const ASSIGNMENT_DIRECTIONS = ["all", "byMe", "toMe", "createdByMe"] as const

type AssignmentDirection = (typeof ASSIGNMENT_DIRECTIONS)[number]

/** "all" drops the involvement filter entirely; only project access still narrows the list. */
export const assignmentDirectionOptions: { value: AssignmentDirection; label: string }[] = [
  { value: "all", label: "Alle Protokolleinträge" },
  { value: "byMe", label: "Von mir zugewiesen" },
  { value: "toMe", label: "An mich zugewiesen" },
  { value: "createdByMe", label: "Erstellt von mir" },
]
