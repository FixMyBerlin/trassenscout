export const getM2MInitialValues = (rows: unknown) =>
  Array.isArray(rows)
    ? rows
        .map((row) =>
          row && typeof row === "object" && "id" in row ? String((row as { id: number }).id) : "",
        )
        .filter(Boolean)
    : []
