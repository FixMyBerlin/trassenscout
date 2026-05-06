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
import { AlkisAttributionLicense, type AlkisStateConfigEntry } from "./alkisStateConfig.types"

export const alkisStateConfig: Record<StateKeyEnum, AlkisStateConfigEntry> = {
  BADEN_WUERTTEMBERG: {
    label: "Baden-Württemberg",
    enabled: true,
    attribution: {
      text: "© LGL BW", // ISO 19139 record gmd:organisationName (shortened, © prepended): 'LGL Baden-Württemberg'
      url: "https://www.lgl-bw.de", // ISO 19139 record gmd:URL: 'http://www.lgl-bw.de'
      license: AlkisAttributionLicense.DlDeBy20, // WFS AccessConstraints: 'dl-de/by-2-0'
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
      text: "© GeoBasis-DE/Berlin", // manually crafted (license is Zero — no text required); WFS ProviderName: 'Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin'
      url: "https://www.berlin.de/sen/sbw/stadtdaten/geoportal/liegenschaftskataster/", // ISO 19139 record CI_OnlineResource [information / mehr zum Liegenschaftskataster]
      license: AlkisAttributionLicense.DlDeZero20, // WFS Fees: 'https://www.govdata.de/dl-de/zero-2-0'
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
      text: "© GeoBasis-DE/LGB", // WFS AccessConstraints (extracted, © prepended): 'Namensnennung: "GeoBasis-DE/LGB"'
      url: "https://geoportal.brandenburg.de", // provider website
      license: AlkisAttributionLicense.DlDeBy20, // WFS AccessConstraints: 'Datenlizenz Deutschland - Namensnennung - Version 2.0'
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
    attribution: {
      text: "© LGLN", // WFS ProviderName (© prepended): 'LGLN'
      url: "https://opendata.lgln.niedersachsen.de", // derived from WFS endpoint URL
      license: AlkisAttributionLicense.CcBy40, // WFS AccessConstraints: 'cc-by/4.0'
    },
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
    attribution: {
      text: "© LGV Hamburg", // WFS Providername (© prepended) (Note: Fees Quellenvermerk too long for map display: 'Freie und Hansestadt Hamburg, Landesbetrieb Geoinformation und Vermessung (LGV)')
      url: "https://api.hamburg.de/datasets/v1/alkis_vereinfacht", // ISO 19139 record CI_OnlineResource [unspecificurl / OGC API - Features (OAF) Landing Page]
      license: AlkisAttributionLicense.DlDeBy20, // ISO 19139 record licenseId: 'dl-by-de/2.0'
    },
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
      text: "© GeoBasis-DE/HVBG", // manually crafted (license is Zero — no text required); WFS ProviderName: 'Hessisches Landesamt für Bodenmanagement und Geoinformation'
      url: "https://gds.hessen.de", // provider website
      license: AlkisAttributionLicense.DlDeZero20, // WFS AccessConstraints: 'Jede Nutzung ... ohne Einschränkung oder Bedingung erlaubt' (§ 18 HVGG); confirmed at provider website (gds.hessen.de): 'kosten- und lizenzfreien Download'
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
      text: "© GeoBasis-DE/M-V", // WFS AccessConstraints (year placeholder omitted): '© GeoBasis-DE/M-V <Jahr der letzten Datenlieferung>'
      url: "https://www.laiv-mv.de/Geoinformation/", // ISO 19139 record gmd:URL: 'https://www.laiv-mv.de/Geoinformation/'
      license: AlkisAttributionLicense.CcBy40, // laiv-mv.de/Geoinformation/Open_Data_Angebot/ (provider website): 'Creative Commons Namensnennung – 4.0 International (CC BY 4.0)'
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
    attribution: {
      text: "© LGLN", // WFS ProviderName (© prepended): 'LGLN'
      url: "https://opendata.lgln.niedersachsen.de", // derived from WFS endpoint URL
      license: AlkisAttributionLicense.CcBy40, // WFS AccessConstraints: 'cc-by/4.0'
    },
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
      text: "© Geobasis-DE/NRW", // WFS ProviderName (© prepended, normalized): 'Geobasis NRW'
      url: "https://www.geoportal.nrw", // provider website
      license: AlkisAttributionLicense.DlDeZero20, // WFS Fees: 'https://www.govdata.de/dl-de/zero-2-0'
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
    attribution: {
      text: "© GeoBasis-DE/LVermGeoRP", // WFS Fees (year placeholder omitted, spacing normalized): '©GeoBasis-DE / LVermGeoRP (Jahr des Datenbezugs)'
      url: "https://www.lvermgeo.rlp.de/geodaten-geoshop/open-data", // WFS Fees (attribution example URL): 'http://www.lvermgeo.rlp.de' (open-data subpage)
      license: AlkisAttributionLicense.DlDeBy20, // WFS Fees: 'https://www.govdata.de/dl-de/by-2-0'
    },
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
    attribution: {
      text: "© GeoSN", // WFS Fees (short form, © prepended): 'GeoSN'
      url: "https://www.landesvermessung.sachsen.de/liegenschaftskataster-3978.html", // ISO 19139 record CI_OnlineResource (URL path match on 'liegenschaftskataster')
      license: AlkisAttributionLicense.DlDeBy20, // landesvermessung.sachsen.de/allgemeine-nutzungsbedingungen-8954.html (provider website): 'dl-de/by-2-0'
    },
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
    attribution: {
      text: "© GeoBasis-DE/LVermGeo ST", // Nutzungsbedingungen PDF (spacing normalized): '© GeoBasis-DE / LVermGeo ST'
      url: "https://www.lvermgeo.sachsen-anhalt.de/de/gdp-open-data.html", // WFS ServiceContact/OnlineResource: 'http://www.lvermgeo.sachsen-anhalt.de' (open-data subpage)
      license: AlkisAttributionLicense.DlDeBy20, // lvermgeo.sachsen-anhalt.de/de/gdp-open-data.html (provider website): 'Datenlizenz Deutschland – Namensnennung – Version 2.0'
    },
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
    attribution: {
      text: "© GeoBasis-DE/LVermGeo SH", // ISO 19139 record sourceHint: '© GeoBasis-DE/LVermGeo SH/CC BY 4.0'
      url: "https://www.gdi-sh.de", // WFS ServiceContact/OnlineResource: 'https://www.gdi-sh.de/gdish/DE/Organisation/Kst_GDISH' (path stripped)
      license: AlkisAttributionLicense.CcBy40, // ISO 19139 record licenseId: 'cc-by/4.0'
    },
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
    attribution: {
      text: "© GDI-Th", // ISO 19139 record sourceHint: '© GDI-Th'
      url: "https://geoportal.thueringen.de/gdi-th/download-offene-geodaten/download-liegschaftskataster", // ISO 19139 record CI_OnlineResource [download / Download Liegenschaftskataster (ohne Eigentümerangaben)]
      license: AlkisAttributionLicense.DlDeBy20, // ISO 19139 record licenseId: 'dl-by-de/2.0'
    },
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
