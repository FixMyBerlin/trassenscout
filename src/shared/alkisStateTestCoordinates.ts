import { StateKeyEnum } from "@prisma/client"

/**
 * Representative lon/lat per Bundesland for ALKIS WFS audit probes and seed demo map centers.
 * Hand-picked (capital-area style); not from an external geocoder.
 */
export const STATE_TEST_COORDINATES: Record<StateKeyEnum, { lon: number; lat: number } | null> = {
  BADEN_WUERTTEMBERG: { lon: 9.1829, lat: 48.7758 },
  BAYERN: { lon: 11.5761, lat: 48.1374 },
  BERLIN: { lon: 13.405, lat: 52.52 },
  BRANDENBURG: { lon: 13.0645, lat: 52.4009 },
  BREMEN: { lon: 8.8017, lat: 53.0793 },
  HAMBURG: { lon: 9.9937, lat: 53.5511 },
  HESSEN: { lon: 8.2417, lat: 50.0782 },
  MECKLENBURG_VORPOMMERN: { lon: 11.4148, lat: 53.6294 },
  NIEDERSACHSEN: { lon: 9.732, lat: 52.3759 },
  NORDRHEIN_WESTFALEN: { lon: 6.7735, lat: 51.2277 },
  RHEINLAND_PFALZ: { lon: 8.2473, lat: 49.9929 },
  SAARLAND: { lon: 6.9969, lat: 49.2354 },
  SACHSEN: { lon: 13.7373, lat: 51.0504 },
  SACHSEN_ANHALT: { lon: 11.6276, lat: 52.1205 },
  SCHLESWIG_HOLSTEIN: { lon: 10.1228, lat: 54.3233 },
  THUERINGEN: { lon: 11.0299, lat: 50.9848 },
  DISABLED: null,
}

export function requireStateTestCoordinate(stateKey: StateKeyEnum): { lon: number; lat: number } {
  const c = STATE_TEST_COORDINATES[stateKey]
  if (!c) {
    throw new Error(`No STATE_TEST_COORDINATES entry for ${stateKey}`)
  }
  return c
}
