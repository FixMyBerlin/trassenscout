import { Route } from "next"
import { BackLink } from "./BackLink"

type Props = {
  /** The `from` search param value from URL, if present */
  fromPath?: string
  text?: string
}

/**
 * Returns human-readable back link text based on the originating path.
 * Check fuehrung first since /fuehrung paths also contain /abschnitte/
 */
const getBackLinkText = (fromPath: string): string => {
  if (fromPath.includes("/land-acquisition/acquisition-areas/")) {
    return "Zurück zum Formular der Dealfläche"
  }
  if (fromPath.includes("/fuehrung")) {
    return "Zurück zum Formular des Eintrags"
  }
  if (fromPath.includes("/abschnitte/")) {
    return "Zurück zum Formular des Planungsabschnitts"
  }
  return "Zurück zum Formular"
}

/**
 * Renders a BackLink only when `fromPath` is provided (i.e., user navigated from a form).
 * Used on management pages (e.g., quality-levels, operators) to provide navigation
 * back to the originating form. The link text is automatically derived from the path
 * unless explicitly provided.
 */
export const ConditionalBackLink = ({ fromPath, text }: Props) => {
  if (!fromPath) {
    return null
  }

  return <BackLink href={fromPath as Route} text={text ?? getBackLinkText(fromPath)} />
}
