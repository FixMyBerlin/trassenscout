/**
 * ALKIS demo seed/teardown: erlaubt nur Staging und lokale Entwicklung, nicht Produktion.
 */
export function assertAlkisDemoMutationAllowed() {
  const appEnv = process.env.VITE_APP_ENV
  if (appEnv === "production") {
    throw new Error(
      "ALKIS-Demo-Mutationen sind in Produktion nicht erlaubt (nur Staging oder Entwicklung).",
    )
  }
  if (appEnv === "staging" || appEnv === "development") {
    return
  }
  throw new Error(
    "ALKIS-Demo-Mutationen sind nur mit VITE_APP_ENV=staging oder development erlaubt.",
  )
}
