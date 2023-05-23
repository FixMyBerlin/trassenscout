export const shortTitle = (slug: string) => {
  return slug.toUpperCase()
}

export const longTitle = (slug: string) => {
  return slug
    .replace("rs", "Radschnellverbindung ") // Project
    .replace("ts", "Teilstrecke ") // Section
    .replace("pa", "Planungsabschnitt ") // Subsection
    .replace("rf", "Regelführung ") // Subsubsection
    .replace("sf", "Sonderführung ") // Subsubsection
    .replace("-", " ") // We allow "-", but longTitle shows it at space.
}

export const seoTitle = (slug: string) => {
  return `${shortTitle(slug)} – ${longTitle(slug)} – Trassenscout`
}

export const seoEditTitle = (slug: string) => {
  return `${shortTitle(slug)} bearbeiten – ${longTitle(slug)} – Trassenscout`
}

export const seoNewTitle = (kind: string) => {
  return `${kind} hinzufügen – Trassenscout`
}
