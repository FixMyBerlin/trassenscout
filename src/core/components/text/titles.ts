export const shortTitle = (slug: string) => {
  return slug.toUpperCase()
}

export const longTitle = (slug: string) => {
  return slug
    .replace("rs", "Radschnellverbindung ") // Subsection
    .replace("pa", "Planungsabschnitt ") // Subsection
    .replace("rf", "Regelführung ") // Subsubsection
    .replace("sf", "Sonderführung ") // Subsubsection
    .replace("-", " ") // We allow "-", but longTitle shows it at space.
}

export const seoTitleSlug = (slug: string) => {
  return `${shortTitle(slug)} – ${longTitle(slug)} – Trassenscout`
}

export const seoEditTitleSlug = (slug: string) => {
  return `${shortTitle(slug)} bearbeiten – ${longTitle(slug)} – Trassenscout`
}

export const seoIndexTitle = (what: string, longWhat?: string | null) => {
  return [what, longWhat, "Trassenscout"].filter(Boolean).join(" – ")
}

export const seoEditTitle = (what: string, longWhat?: string | null) => {
  return [`${what} bearbeiten`, longWhat, "Trassenscout"].filter(Boolean).join(" – ")
}

export const seoNewTitle = (what: string) => {
  return `${what} hinzufügen – Trassenscout`
}
