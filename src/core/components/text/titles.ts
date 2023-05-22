export const longTitle = (slug: string) => {
  return slug
    .replace("RS", "Radschnellverbindung ") // Project
    .replace("TS", "Teilstrecke ") // Section
    .replace("PA", "Planungsabschnitt ") // Subsection
    .replace("RF", "Regelführung ") // Subsubsection
    .replace("SF", "Sonderführung ") // Subsubsection
}

export const seoTitle = (slug: string) => {
  return `${slug} – ${longTitle(slug)} – Trassenscout`
}

export const seoEditTitle = (slug: string) => {
  return `${slug} bearbeiten – ${longTitle(slug)} – Trassenscout`
}

export const seoNewTitle = (kind: string) => {
  return `${kind} hinzufügen – Trassenscout`
}
