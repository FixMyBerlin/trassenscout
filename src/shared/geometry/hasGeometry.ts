/** Narrows out Maßnahmen without geometry (type and geometry both null), e.g. before maps. */
export const hasGeometry = <T extends { type: unknown }>(
  entry: T,
): entry is Exclude<T, { type: null }> => entry.type !== null
