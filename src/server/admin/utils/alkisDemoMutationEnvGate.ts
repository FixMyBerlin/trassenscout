/**
 * ALKIS demo seed/teardown: erlaubt nur Staging und lokale Entwicklung, nicht Produktion.
 */
export function assertAlkisDemoMutationAllowed(): void {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV
  if (appEnv === "production") {
    throw new Error(
      "ALKIS-Demo-Mutationen sind in Produktion nicht erlaubt (nur Staging oder Entwicklung).",
    )
  }
  if (appEnv === "staging" || appEnv === "development") {
    return
  }
  throw new Error(
    "ALKIS-Demo-Mutationen sind nur mit NEXT_PUBLIC_APP_ENV=staging oder development erlaubt.",
  )
}
