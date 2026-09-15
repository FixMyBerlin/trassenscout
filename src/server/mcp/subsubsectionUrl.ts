export function buildSubsubsectionUrl(
  origin: string,
  projectSlug: string,
  subsectionSlug: string,
  subsubsectionSlug: string,
) {
  return new URL(
    `/${projectSlug}/abschnitte/${subsectionSlug}/fuehrung/${subsubsectionSlug}`,
    origin,
  ).href
}
