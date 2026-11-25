const NO_VALUE = "keine Angabe"

// From tilda-geo app/src/data/generated/topicDocs/inspectorTranslations.gen.ts
const categoryLabels: Record<string, string> = {
  bicycleRoad: "Fahrradstraße",
  bicycleRoad_vehicleDestination: "Fahrradstraße mit Anlieger/Kfz frei",
  crossing: "Straßenquerung",
  cycleway_adjoining: "Radweg (straßenbegleitend)",
  cycleway_adjoiningOrIsolated:
    "Radweg (Straßenbegleitend oder selbstständig geführt; Kategorisierung unklar)",
  cycleway_isolated: "Radweg, selbstständig geführt",
  cyclewayLink: "Radweg-Verbindungsstück",
  cyclewayOnHighway_advisory: "Schutzstreifen",
  cyclewayOnHighway_advisoryOrExclusive:
    "Radfahrstreifen oder Schutzstreifen (Kategorisierung unklar)",
  cyclewayOnHighway_exclusive: "Radfahrstreifen",
  cyclewayOnHighwayBetweenLanes: "Radfahrstreifen in Mittellage (Fahrradweiche)",
  cyclewayOnHighwayProtected: "Geschützter Radfahrstreifen (PBL)",
  footAndCyclewaySegregated_adjoining: "Getrennter Rad- und Gehweg, straßenbegleitend",
  footAndCyclewaySegregated_adjoiningOrIsolated:
    "Getrennter Rad- und Gehweg (Straßenbegleitend oder selbstständig geführt; Kategorisierung unklar)",
  footAndCyclewaySegregated_isolated: "Getrennter Rad- und Gehweg, selbstständig geführt",
  footAndCyclewayShared_adjoining: "Gemeinsamer Geh- und Radweg, straßenbegleitend",
  footAndCyclewayShared_adjoiningOrIsolated:
    "Gemeinsamer Geh- und Radweg (Straßenbegleitend oder selbstständig geführt; Kategorisierung unklar)",
  footAndCyclewayShared_isolated: "Gemeinsamer Geh- und Radweg, selbstständig geführt",
  footwayBicycleYes_adjoining: "Gehweg mit Radfahrer frei, straßenbegleitend",
  footwayBicycleYes_adjoiningOrIsolated:
    "Gehweg mit Radfahrer frei (Straßenbegleitend oder selbstständig geführt; Kategorisierung unklar)",
  footwayBicycleYes_isolated: "Gehweg mit Radfahrer frei, selbstständig geführt",
  needsClarification: "Führungsform unklar",
  pedestrianAreaBicycleYes: "Fußgängerzone, Fahrrad frei",
  sharedBusLaneBikeWithBus: "Radfahrstreifen mit Freigabe Busverkehr",
  sharedBusLaneBusWithBike: "Bussonderfahrstreifen mit Fahrrad frei",
  sharedMotorVehicleLane: "Anteilig genutzter Fahrstreifen (Sharrows)",
}

const surfaceLabels: Record<string, string> = {
  asphalt: "Asphalt",
  bricks: "Ziegel",
  compacted: "Verdichteter Untergrund",
  concrete: "Beton",
  "concrete:lanes": "Betonstreifen / -bahnen",
  "concrete:plates": "Betonplatten",
  fine_gravel: "Splitt",
  grass: "Gras",
  grass_paver: "Rasengitter / Grasgitter",
  gravel: "Schotter",
  ground: "Erde/Boden",
  large_sett: "Großpflaster",
  metal: "Metall",
  metal_grid: "Metallgitter",
  mosaic_sett: "Mosaikpflaster",
  paved: "Befestigt (unspezifisch)",
  paving_stones: "Verbundpflastersteine",
  "paving_stones:lanes": "Pflastersteinbahnen",
  pebblestone: "Kieselsteine",
  plastic: "Kunststoff",
  rubber: "Gummi",
  sand: "Sand",
  sett: "Behauenes Pflaster / Natursteinpflaster",
  small_sett: "Kleinpflaster",
  stone: "Stein",
  unpaved: "Unbefestigt",
  wood: "Holz",
  woodchips: "Hackschnitzel",
}

const widthFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 })

const labelFor = (labels: Record<string, string>, value: unknown) => {
  if (typeof value !== "string" || value === "") return NO_VALUE
  return Object.hasOwn(labels, value) ? labels[value]! : value
}

export type TildaInfraHoverContent = { category: string; width: string; surface: string }

export const getTildaInfraHoverContent = (
  properties: Record<string, unknown> | null | undefined,
): TildaInfraHoverContent => {
  const width = Number(properties?.width)
  return {
    category: labelFor(categoryLabels, properties?.category),
    width: Number.isFinite(width) && width > 0 ? `${widthFormat.format(width)} m` : NO_VALUE,
    surface: labelFor(surfaceLabels, properties?.surface),
  }
}
