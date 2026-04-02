# ALKIS WMS GetCapabilities audit

Generated: 2026-04-02T10:24:06.198Z

Request: `SERVICE=WMS&REQUEST=GetCapabilities` with **VERSION=1.3.0**, then **1.1.1** fallback per candidate URL.

Only rows marked **OK** used successful HTTP responses and parsed WMS Capabilities XML. **CRS/SRS** are taken from `<CRS>` (1.3.0) / `<SRS>` (1.1.1) across the document.

**MapLibre:** raster basemaps use a Web Mercator tile grid. A WMS is suitable only if capabilities advertise **EPSG:3857** (or legacy **EPSG:900913**). Services that list only **EPSG:25832** / **EPSG:25833** are flagged as not Web-Mercator-compatible for this use case.

## Summary

| Bundesland | WMS URL (source) | HTTP | OK | Version | 3857 | CRS note | layerName |
|---|---|---:|:---:|---|:---:|---|---|
| Baden-Württemberg | - | 404 | no | - | - | - | - |
| Berlin | `https://gdi.berlin.de/services/wms/alkis_flurstuecke` (configured) | 200 | yes | 1.3.0 | yes | yes (EPSG:3857) | flurstuecke |
| Brandenburg | - | 404 | no | - | - | - | - |
| Bremen | - | 400 | no | - | - | - | - |
| Hamburg | - | 404 | no | - | - | - | - |
| Hessen | - | 404 | no | - | - | - | - |
| Mecklenburg-Vorpommern | - | 404 | no | - | - | - | - |
| Niedersachsen | - | 400 | no | - | - | - | - |
| Nordrhein-Westfalen | - | 404 | no | - | - | - | - |
| Rheinland-Pfalz | - | 404 | no | - | - | - | - |
| Saarland | - | 503 | no | - | - | - | - |
| Sachsen | - | 404 | no | - | - | - | - |
| Sachsen-Anhalt | - | 403 | no | - | - | - | - |
| Schleswig-Holstein | - | - | no | - | - | - | - |
| Thüringen | - | 200 | no | - | - | - | - |

*EPSG:3857: Web Mercator for MapLibre tile grid; `yes (900913)` means capabilities list EPSG:900913 (equivalent projection).*

## WMS URL not found via WFS/config

- **Baden-Württemberg** (`BADEN_WUERTTEMBERG`): HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> </body></html>
- **Brandenburg** (`BRANDENBURG`): HTTP 404: <!DOCTYPE html> <html> <head> <meta charset="utf-8"> <title>Landesvermessung und Geobasisinformation Brandenburg</title> <meta name="viewport" content="width=device-width, initial-scale=1"> <style> html, body, .container...
- **Bremen** (`BREMEN`): HTTP 400: <?xml version="1.0" encoding="UTF-8" standalone="yes"?> <ServiceExceptionReport> <ServiceException>zu &lt;http://opendata.lgln.niedersachsen.de:443/doorman/noauth/alkishb_wms_sf&gt; wurde keine interne URL gefunden.</Ser...
- **Hamburg** (`HAMBURG`): HTTP 404: <!DOCTYPE html> <html lang="en"> <head> <link rel="stylesheet" href="/dataport-errorpages/style.css"> </head> <body> <div class="error"> <div class="title"> HTTP 404 - Not Found </div> <div class="message"> Die von Ihnen...
- **Hessen** (`HESSEN`): HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> </body></html>
- **Mecklenburg-Vorpommern** (`MECKLENBURG_VORPOMMERN`): HTTP 404: <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p>...
- **Niedersachsen** (`NIEDERSACHSEN`): HTTP 400: <?xml version="1.0" encoding="UTF-8" standalone="yes"?> <ServiceExceptionReport> <ServiceException>zu &lt;http://opendata.lgln.niedersachsen.de:443/doorman/noauth/alkis_wms_einfach&gt; wurde keine interne URL gefunden.</...
- **Nordrhein-Westfalen** (`NORDRHEIN_WESTFALEN`): HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> <hr> <address>Apache Server at www.wfs....
- **Rheinland-Pfalz** (`RHEINLAND_PFALZ`): HTTP 404: <!DOCTYPE html> <input type="hidden" name="csrfmiddlewaretoken" value="xNdMJD8IOEuotrHzOjsprQb2P37q0taxWSRXRetEmCRu95OQ4qTQhm5joabPSIU5"> <html lang="de"> <head> <meta name="viewport" content="width=device-width, initial...
- **Saarland** (`SAARLAND`): HTTP 503: <h1>Aktuelle St&ouml;rung</h1><p><b>Aufgrund einer St&ouml;rung im Rechenzentrum des Saarlandes sind derzeit die Onlinedienste des LVGL nicht erreichbar.</b><br>Aktuell ist noch nicht absehbar, wann diese Systeme wieder ...
- **Sachsen** (`SACHSEN`): HTTP 404: <!DOCTYPE html> <html lang="de" class="mod-no-js styleless"> <!-- SeitenID: 4169, ProjectGUID: 8FD93077575045C7AC987BAD40AAC756, LastUpdated: 2026-03-13 13:03:30 --> <head> <meta charset="utf-8" /> <meta http-equiv="X-UA...
- **Sachsen-Anhalt** (`SACHSEN_ANHALT`): HTTP 403: 
- **Schleswig-Holstein** (`SCHLESWIG_HOLSTEIN`): no WMS candidate URL differs from WFS URL after derivation rules (nothing to try)
- **Thüringen** (`THUERINGEN`): Root element is not WMS Capabilities

## Not verified / failures

- **Baden-Württemberg** (`BADEN_WUERTTEMBERG`): HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> </body></html>
- **Brandenburg** (`BRANDENBURG`): HTTP 404: <!DOCTYPE html> <html> <head> <meta charset="utf-8"> <title>Landesvermessung und Geobasisinformation Brandenburg</title> <meta name="viewport" content="width=device-width, initial-scale=1"> <style> html, body, .container...
- **Bremen** (`BREMEN`): HTTP 400: <?xml version="1.0" encoding="UTF-8" standalone="yes"?> <ServiceExceptionReport> <ServiceException>zu &lt;http://opendata.lgln.niedersachsen.de:443/doorman/noauth/alkishb_wms_sf&gt; wurde keine interne URL gefunden.</Ser...
- **Hamburg** (`HAMBURG`): HTTP 404: <!DOCTYPE html> <html lang="en"> <head> <link rel="stylesheet" href="/dataport-errorpages/style.css"> </head> <body> <div class="error"> <div class="title"> HTTP 404 - Not Found </div> <div class="message"> Die von Ihnen...
- **Hessen** (`HESSEN`): HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> </body></html>
- **Mecklenburg-Vorpommern** (`MECKLENBURG_VORPOMMERN`): HTTP 404: <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p>...
- **Niedersachsen** (`NIEDERSACHSEN`): HTTP 400: <?xml version="1.0" encoding="UTF-8" standalone="yes"?> <ServiceExceptionReport> <ServiceException>zu &lt;http://opendata.lgln.niedersachsen.de:443/doorman/noauth/alkis_wms_einfach&gt; wurde keine interne URL gefunden.</...
- **Nordrhein-Westfalen** (`NORDRHEIN_WESTFALEN`): HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> <hr> <address>Apache Server at www.wfs....
- **Rheinland-Pfalz** (`RHEINLAND_PFALZ`): HTTP 404: <!DOCTYPE html> <input type="hidden" name="csrfmiddlewaretoken" value="xNdMJD8IOEuotrHzOjsprQb2P37q0taxWSRXRetEmCRu95OQ4qTQhm5joabPSIU5"> <html lang="de"> <head> <meta name="viewport" content="width=device-width, initial...
- **Saarland** (`SAARLAND`): HTTP 503: <h1>Aktuelle St&ouml;rung</h1><p><b>Aufgrund einer St&ouml;rung im Rechenzentrum des Saarlandes sind derzeit die Onlinedienste des LVGL nicht erreichbar.</b><br>Aktuell ist noch nicht absehbar, wann diese Systeme wieder ...
- **Sachsen** (`SACHSEN`): HTTP 404: <!DOCTYPE html> <html lang="de" class="mod-no-js styleless"> <!-- SeitenID: 4169, ProjectGUID: 8FD93077575045C7AC987BAD40AAC756, LastUpdated: 2026-03-13 13:03:30 --> <head> <meta charset="utf-8" /> <meta http-equiv="X-UA...
- **Sachsen-Anhalt** (`SACHSEN_ANHALT`): HTTP 403: 
- **Schleswig-Holstein** (`SCHLESWIG_HOLSTEIN`): no WMS candidate URL differs from WFS URL after derivation rules (nothing to try)
- **Thüringen** (`THUERINGEN`): Root element is not WMS Capabilities

## Details

### Baden-Württemberg (`BADEN_WUERTTEMBERG`)

- **WFS URL:** https://owsproxy.lgl-bw.de/owsproxy/wfs/WFS_LGL-BW_ALKIS
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
  - `https://owsproxy.lgl-bw.de/owsproxy/wms/WMS_LGL-BW_ALKIS` -> VERSION=1.3.0 HTTP 404 - HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> <p>Additionally, a 404 Not Found error ...
  - `https://owsproxy.lgl-bw.de/owsproxy/wms/WFS_LGL-BW_ALKIS` -> VERSION=1.3.0 HTTP 404 - HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> <p>Additionally, a 404 Not Found error ...
  - `https://owsproxy.lgl-bw.de/owsproxy/wfs/WMS_LGL-BW_ALKIS` -> VERSION=1.3.0 HTTP 404 - HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> </body></html>
- **Outcome error:** HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> </body></html>
- **Verified WMS base URL:** -
- **HTTP:** 404
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -

### Berlin (`BERLIN`)

- **WFS URL:** https://gdi.berlin.de/services/wfs/alkis_flurstuecke
- **Configured wmsUrl (before audit):** https://gdi.berlin.de/services/wms/alkis_flurstuecke
- **Candidate attempts:**
  - `https://gdi.berlin.de/services/wms/alkis_flurstuecke` -> VERSION=1.3.0 HTTP 200
- **Verified WMS base URL:** https://gdi.berlin.de/services/wms/alkis_flurstuecke
- **HTTP:** 200
- **EPSG:3857 / Web Mercator:** yes
- **CRS list (sample, parsed):** EPSG:25833, EPSG:4326, EPSG:25832, EPSG:3857, EPSG:4258, CRS:84
- **Layers (first 15):** flurstuecke (ALKIS Berlin Flurstücke)
- **Chosen layerName:** flurstuecke

### Brandenburg (`BRANDENBURG`)

- **WFS URL:** https://isk.geobasis-bb.de/ows/alkis_vereinf_wfs
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
  - `https://isk.geobasis-bb.de/ows/alkis_vereinf_wms` -> VERSION=1.3.0 HTTP 404 - HTTP 404: <!DOCTYPE html> <html> <head> <meta charset="utf-8"> <title>Landesvermessung und Geobasisinformation Brandenburg</title> <meta name="viewport" content="width=device-width, initial-scale=1"> <style> html, body, .container...
- **Outcome error:** HTTP 404: <!DOCTYPE html> <html> <head> <meta charset="utf-8"> <title>Landesvermessung und Geobasisinformation Brandenburg</title> <meta name="viewport" content="width=device-width, initial-scale=1"> <style> html, body, .container...
- **Verified WMS base URL:** -
- **HTTP:** 404
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -

### Bremen (`BREMEN`)

- **WFS URL:** https://opendata.lgln.niedersachsen.de/doorman/noauth/alkishb_wfs_sf
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
  - `https://opendata.lgln.niedersachsen.de/doorman/noauth/alkishb_wms_sf` -> VERSION=1.3.0 HTTP 400 - HTTP 400: <?xml version="1.0" encoding="UTF-8" standalone="yes"?> <ServiceExceptionReport> <ServiceException>zu &lt;http://opendata.lgln.niedersachsen.de:443/doorman/noauth/alkishb_wms_sf&gt; wurde keine interne URL gefunden.</Ser...
- **Outcome error:** HTTP 400: <?xml version="1.0" encoding="UTF-8" standalone="yes"?> <ServiceExceptionReport> <ServiceException>zu &lt;http://opendata.lgln.niedersachsen.de:443/doorman/noauth/alkishb_wms_sf&gt; wurde keine interne URL gefunden.</Ser...
- **Verified WMS base URL:** -
- **HTTP:** 400
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -

### Hamburg (`HAMBURG`)

- **WFS URL:** https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
  - `https://geodienste.hamburg.de/WMS_HH_ALKIS_vereinfacht` -> VERSION=1.3.0 HTTP 404 - HTTP 404: <!DOCTYPE html> <html lang="en"> <head> <link rel="stylesheet" href="/dataport-errorpages/style.css"> </head> <body> <div class="error"> <div class="title"> HTTP 404 - Not Found </div> <div class="message"> Die von Ihnen...
- **Outcome error:** HTTP 404: <!DOCTYPE html> <html lang="en"> <head> <link rel="stylesheet" href="/dataport-errorpages/style.css"> </head> <body> <div class="error"> <div class="title"> HTTP 404 - Not Found </div> <div class="message"> Die von Ihnen...
- **Verified WMS base URL:** -
- **HTTP:** 404
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -

### Hessen (`HESSEN`)

- **WFS URL:** https://www.gds.hessen.de/wfs2/aaa-suite/cgi-bin/alkis/vereinf/wfs
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
  - `https://www.gds.hessen.de/wms/aaa-suite/cgi-bin/alkis/vereinf/wms` -> VERSION=1.3.0 HTTP 404 - HTTP 404: non-text body (binary image or similar)
  - `https://www.gds.hessen.de/wms/aaa-suite/cgi-bin/alkis/vereinf/wfs` -> VERSION=1.3.0 HTTP 404 - HTTP 404: non-text body (binary image or similar)
  - `https://www.gds.hessen.de/wfs2/aaa-suite/cgi-bin/alkis/vereinf/wms` -> VERSION=1.3.0 HTTP 404 - HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> </body></html>
- **Outcome error:** HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> </body></html>
- **Verified WMS base URL:** -
- **HTTP:** 404
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -

### Mecklenburg-Vorpommern (`MECKLENBURG_VORPOMMERN`)

- **WFS URL:** https://www.geodaten-mv.de/dienste/alkis_wfs_einfach
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
  - `https://www.geodaten-mv.de/dienste/alkis_wms_einfach` -> VERSION=1.3.0 HTTP 404 - HTTP 404: <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p>...
- **Outcome error:** HTTP 404: <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p>...
- **Verified WMS base URL:** -
- **HTTP:** 404
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -

### Niedersachsen (`NIEDERSACHSEN`)

- **WFS URL:** https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
  - `https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wms_einfach` -> VERSION=1.3.0 HTTP 400 - HTTP 400: <?xml version="1.0" encoding="UTF-8" standalone="yes"?> <ServiceExceptionReport> <ServiceException>zu &lt;http://opendata.lgln.niedersachsen.de:443/doorman/noauth/alkis_wms_einfach&gt; wurde keine interne URL gefunden.</...
- **Outcome error:** HTTP 400: <?xml version="1.0" encoding="UTF-8" standalone="yes"?> <ServiceExceptionReport> <ServiceException>zu &lt;http://opendata.lgln.niedersachsen.de:443/doorman/noauth/alkis_wms_einfach&gt; wurde keine interne URL gefunden.</...
- **Verified WMS base URL:** -
- **HTTP:** 400
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -

### Nordrhein-Westfalen (`NORDRHEIN_WESTFALEN`)

- **WFS URL:** https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
  - `https://www.wms.nrw.de/geobasis/wms_nw_alkis_vereinfacht` -> VERSION=1.3.0 HTTP 404 - HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> <hr> <address>Apache Server at www.wms....
  - `https://www.wms.nrw.de/geobasis/wfs_nw_alkis_vereinfacht` -> VERSION=1.3.0 HTTP 404 - HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> <hr> <address>Apache Server at www.wms....
  - `https://www.wfs.nrw.de/geobasis/wms_nw/alkis_vereinfacht` -> VERSION=1.3.0 HTTP 404 - HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> <hr> <address>Apache Server at www.wfs....
  - `https://www.wfs.nrw.de/geobasis/wms_nw_alkis` -> VERSION=1.3.0 HTTP 404 - HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> <hr> <address>Apache Server at www.wfs....
- **Outcome error:** HTTP 404: <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> <title>404 Not Found</title> </head><body> <h1>Not Found</h1> <p>The requested URL was not found on this server.</p> <hr> <address>Apache Server at www.wfs....
- **Verified WMS base URL:** -
- **HTTP:** 404
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -

### Rheinland-Pfalz (`RHEINLAND_PFALZ`)

- **WFS URL:** https://www.geoportal.rlp.de/registry/wfs/519
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
  - `https://www.geoportal.rlp.de/registry/wms/519` -> VERSION=1.3.0 HTTP 404 - HTTP 404: <!DOCTYPE html> <input type="hidden" name="csrfmiddlewaretoken" value="xNdMJD8IOEuotrHzOjsprQb2P37q0taxWSRXRetEmCRu95OQ4qTQhm5joabPSIU5"> <html lang="de"> <head> <meta name="viewport" content="width=device-width, initial...
- **Outcome error:** HTTP 404: <!DOCTYPE html> <input type="hidden" name="csrfmiddlewaretoken" value="xNdMJD8IOEuotrHzOjsprQb2P37q0taxWSRXRetEmCRu95OQ4qTQhm5joabPSIU5"> <html lang="de"> <head> <meta name="viewport" content="width=device-width, initial...
- **Verified WMS base URL:** -
- **HTTP:** 404
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -

### Saarland (`SAARLAND`)

- **WFS URL:** https://geoportal.saarland.de/registry/wfs/414
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
  - `https://geoportal.saarland.de/registry/wms/414` -> VERSION=1.3.0 HTTP 503 - HTTP 503: <h1>Aktuelle St&ouml;rung</h1><p><b>Aufgrund einer St&ouml;rung im Rechenzentrum des Saarlandes sind derzeit die Onlinedienste des LVGL nicht erreichbar.</b><br>Aktuell ist noch nicht absehbar, wann diese Systeme wieder ...
- **Outcome error:** HTTP 503: <h1>Aktuelle St&ouml;rung</h1><p><b>Aufgrund einer St&ouml;rung im Rechenzentrum des Saarlandes sind derzeit die Onlinedienste des LVGL nicht erreichbar.</b><br>Aktuell ist noch nicht absehbar, wann diese Systeme wieder ...
- **Verified WMS base URL:** -
- **HTTP:** 503
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -

### Sachsen (`SACHSEN`)

- **WFS URL:** https://geodienste.sachsen.de/aaa/public_alkis/vereinf/wfs
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
  - `https://geodienste.sachsen.de/aaa/public_alkis/vereinf/wms` -> VERSION=1.3.0 HTTP 404 - HTTP 404: <!DOCTYPE html> <html lang="de" class="mod-no-js styleless"> <!-- SeitenID: 4169, ProjectGUID: 8FD93077575045C7AC987BAD40AAC756, LastUpdated: 2026-03-13 13:03:30 --> <head> <meta charset="utf-8" /> <meta http-equiv="X-UA...
- **Outcome error:** HTTP 404: <!DOCTYPE html> <html lang="de" class="mod-no-js styleless"> <!-- SeitenID: 4169, ProjectGUID: 8FD93077575045C7AC987BAD40AAC756, LastUpdated: 2026-03-13 13:03:30 --> <head> <meta charset="utf-8" /> <meta http-equiv="X-UA...
- **Verified WMS base URL:** -
- **HTTP:** 404
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -

### Sachsen-Anhalt (`SACHSEN_ANHALT`)

- **WFS URL:** https://www.geodatenportal.sachsen-anhalt.de/wss/service/ST_LVermGeo_ALKIS_WFS_OpenData/guest
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
  - `https://www.geodatenportal.sachsen-anhalt.de/wss/service/ST_LVermGeo_ALKIS_wms_OpenData/guest` -> VERSION=1.3.0 HTTP 403 - HTTP 403: 
  - `https://www.geodatenportal.sachsen-anhalt.de/wss/service/ST_LVermGeo_ALKIS_WMS_OpenData/guest` -> VERSION=1.3.0 HTTP 403 - HTTP 403: 
- **Outcome error:** HTTP 403: 
- **Verified WMS base URL:** -
- **HTTP:** 403
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -

### Schleswig-Holstein (`SCHLESWIG_HOLSTEIN`)

- **WFS URL:** https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
- **Outcome error:** no WMS candidate URL differs from WFS URL after derivation rules (nothing to try)
- **Verified WMS base URL:** -
- **HTTP:** -
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -

### Thüringen (`THUERINGEN`)

- **WFS URL:** https://www.geoproxy.geoportal-th.de/geoproxy/services/adv_alkis_wfs
- **Configured wmsUrl (before audit):** -
- **Candidate attempts:**
  - `https://www.geoproxy.geoportal-th.de/geoproxy/services/adv_alkis_wms` -> VERSION=1.3.0 HTTP 200 - Root element is not WMS Capabilities
- **Outcome error:** Root element is not WMS Capabilities
- **Verified WMS base URL:** -
- **HTTP:** 200
- **EPSG:3857 / Web Mercator:** -
- **CRS list (sample, parsed):** -
- **Layers (first 15):** -
- **Chosen layerName:** -
