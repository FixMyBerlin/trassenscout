// Hybrid file maintained by scripts/alkis-wfs/update-config.ts.
//
// Auto-managed (overwritten by `bun scripts/alkis-wfs/update-config.ts`
// when the latest audit verifies a state):
//   wfs.* — url, parcelPropertyKey, alkisParcelIdPropertyKey, projection,
//           wfsOutputFormat, supports4326, bboxAxisOrder, wfsSupportsJson
//
// Manually maintained (edit directly here; the script reads them back
// and carries them forward unchanged on regeneration):
//   label, enabled, attribution, specialCaseNote, wms
//
// See ./README.md
//
// Last regen: 2026-04-29T13:44:33.480Z

import { StateKeyEnum } from "@prisma/client"
import type { AlkisStateConfigEntry } from "./alkisStateConfig.types"

export const alkisStateConfig: Record<StateKeyEnum, AlkisStateConfigEntry> = {
  BADEN_WUERTTEMBERG: {
    label: "Baden-Württemberg",
    enabled: true,
    attribution: {
      text: "© LGL, www.lgl-bw.de",
      url: "https://www.lgl-bw.de",
      license: "DL-DE BY 2.0",
    },
    specialCaseNote: "Uses custom nora namespace and flurstueckskennzeichen property naming.",
    wms: { url: false },
    wfs: {
      url: "https://owsproxy.lgl-bw.de/owsproxy/wfs/WFS_LGL-BW_ALKIS",
      parcelPropertyKey: "nora:v_al_flurstueck",
      alkisParcelIdPropertyKey: "flurstueckskennzeichen",
      projection: "EPSG:25832",
      wfsOutputFormat: "application/json",
      supports4326: true,
      bboxAxisOrder: "lonlat",
      wfsSupportsJson: true,
    },
  },
  // TODO: unverified in latest audit (Verify public WFS endpoint and typename manually.)
  BAYERN: {
    label: "Bayern",
    enabled: false,
    attribution: null,
    specialCaseNote: "No public ALKIS-WFS endpoint currently known.",
    wms: { url: false },
    wfs: { url: false },
  },
  BERLIN: {
    label: "Berlin",
    enabled: true,
    attribution: {
      text: "© GeoBasis-DE / Berlin",
      url: "https://gdi.berlin.de",
      license: "DL-DE Zero 2.0",
    },
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://gdi.berlin.de/services/wfs/alkis_flurstuecke",
      parcelPropertyKey: "alkis_flurstuecke:flurstuecke",
      alkisParcelIdPropertyKey: "fsko",
      projection: "EPSG:25833",
      wfsOutputFormat: "application/json",
      supports4326: true,
      bboxAxisOrder: "lonlat",
      wfsSupportsJson: true,
    },
  },
  BRANDENBURG: {
    label: "Brandenburg",
    enabled: true,
    attribution: {
      text: "© GeoBasis-DE/LGB",
      url: "https://geoportal.brandenburg.de",
      license: "DL-DE BY 2.0",
    },
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://isk.geobasis-bb.de/ows/alkis_vereinf_wfs",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25833",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  BREMEN: {
    label: "Bremen",
    enabled: false,
    attribution: null,
    specialCaseNote:
      "Configured WFS differs from spreadsheet direct URL. Bremen uses LGLN host with typename adv:AX_Flurstueck.",
    wms: { url: false },
    wfs: {
      url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/alkishb_wfs_sf",
      parcelPropertyKey: "adv:AX_Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  HAMBURG: {
    label: "Hamburg",
    enabled: false,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "lonlat",
      wfsSupportsJson: false,
    },
  },
  HESSEN: {
    label: "Hessen",
    enabled: true,
    attribution: {
      text: "© GeoBasis-DE / HVBG",
      url: "https://gds.hessen.de",
      license: "DL-DE BY 2.0",
    },
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://www.gds.hessen.de/wfs2/aaa-suite/cgi-bin/alkis/vereinf/wfs",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  // TODO: unverified in latest audit (GetFeature probe did not return usable features at test coordinate. | Route currently returns 501 for supports4326=false; 4326 reprojection not implemented yet.)
  MECKLENBURG_VORPOMMERN: {
    label: "Mecklenburg-Vorpommern",
    enabled: false,
    attribution: {
      text: "© GeoPortal MV / ALKIS",
      url: "https://www.geoportal-mv.de",
      license: "DL-DE BY 2.0",
    },
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://www.geodaten-mv.de/dienste/alkis_wfs_einfach",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25833",
      wfsOutputFormat: null,
      supports4326: false,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  NIEDERSACHSEN: {
    label: "Niedersachsen",
    enabled: false,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  NORDRHEIN_WESTFALEN: {
    label: "Nordrhein-Westfalen",
    enabled: true,
    attribution: {
      text: "© GeoBasis-DE / NRW",
      url: "https://www.geoportal.nrw",
      license: "DL-DE Zero 2.0",
    },
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  RHEINLAND_PFALZ: {
    label: "Rheinland-Pfalz",
    enabled: false,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://www.geoportal.rlp.de/registry/wfs/519",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "application/json; subtype=geojson",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: true,
    },
  },
  // TODO: unverified in latest audit (GetFeature probe did not return usable features at test coordinate.)
  SAARLAND: {
    label: "Saarland",
    enabled: false,
    attribution: null,
    specialCaseNote:
      "Configured endpoint has intermittent 5xx. Spreadsheet points to INSPIRE endpoint with different schema.",
    wms: { url: false },
    wfs: {
      url: "https://geoportal.saarland.de/registry/wfs/414",
      parcelPropertyKey: "ALKIS_ALKIS_WFS_ohne_Eig:Flurstueck",
      alkisParcelIdPropertyKey: "nationalCadastralReference",
      projection: "EPSG:25832",
      wfsOutputFormat: null,
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  // TODO: unverified in latest audit (GetFeature probe did not return usable features at test coordinate. | Route currently returns 501 for supports4326=false; 4326 reprojection not implemented yet.)
  SACHSEN: {
    label: "Sachsen",
    enabled: false,
    attribution: null,
    specialCaseNote:
      "Spreadsheet direct lookup often uses StoredQuery (kennzeichen); this audit uses BBOX GetFeature probes.",
    wms: { url: false },
    wfs: {
      url: "https://geodienste.sachsen.de/aaa/public_alkis/vereinf/wfs",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25833",
      wfsOutputFormat: null,
      supports4326: false,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  SACHSEN_ANHALT: {
    label: "Sachsen-Anhalt",
    enabled: false,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://www.geodatenportal.sachsen-anhalt.de/wss/service/ST_LVermGeo_ALKIS_WFS_OpenData/guest",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  SCHLESWIG_HOLSTEIN: {
    label: "Schleswig-Holstein",
    enabled: false,
    attribution: null,
    specialCaseNote: "INSPIRE schema is used (cp:CadastralParcel / nationalCadastralReference).",
    wms: { url: false },
    wfs: {
      url: "https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS",
      parcelPropertyKey: "cp:CadastralParcel",
      alkisParcelIdPropertyKey: "nationalCadastralReference",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  // TODO: unverified in latest audit (GetFeature probe did not return usable features at test coordinate. | Route currently returns 501 for supports4326=false; 4326 reprojection not implemented yet.)
  THUERINGEN: {
    label: "Thüringen",
    enabled: false,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://www.geoproxy.geoportal-th.de/geoproxy/services/adv_alkis_wfs",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: null,
      supports4326: false,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  DISABLED: {
    label: "Keine Auswahl",
    enabled: false,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: { url: false },
  },
}
