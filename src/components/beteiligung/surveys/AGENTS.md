# Neues Eingaben-Formular anlegen

Für Agents, die im Auftrag von Nicht-Devs ein Eingaben-Formular anlegen (im Code „Survey“). Ergebnis: PR aus einem Fork gegen `FixMyBerlin/trassenscout:develop`.

## Vorher klären

Erst fragen, dann schreiben. Zum Schluss zusammenfassen und bestätigen lassen.

- Slug (muss im Admin unter `/admin/projects/<projekt>/surveys/new` existieren)
- Teile: `part1` / `part3` = Fragebogen, `part2` = Hinweise (mehrfach, oft mit Karte)
- Pro Seite: Titel, Text, Fragen; pro Frage: Feldtyp, Pflicht/optional, Optionen, Bedingung, Hilfetext
- Texte: Intros, Buttons, Danke-Seite, Startseiten-Link
- Meta: Titel, Logo-URL, `primaryColor` / `darkColor` / `lightColor`, `canonicalUrl`
- Karte: Gebiet, Pflicht? (siehe „Karten = Dummy“)
- E-Mails: Inhalte für Teilnehmende und Team (siehe „E-Mails“)
- Vorgangs-ID: ja oder nein? (siehe „Vorgangs-ID“)

## Umsetzen

1. Ordner `surveys/<slug>/` mit `config.tsx` und nur den benötigten `partN.ts`. Keine `Survey<Name>.tsx`.
   Vorlagen: `rstest-1` (part1), `rstest-2-3` (part2 + part3), `rstest-1-2-3` (alle).
2. `backend: backendConfig` (aus `shared/backend-types.ts`), außer es werden eigene Status gewünscht.
3. Registrieren: Slug in `shared/utils/allowedSurveySlugs.ts`, Zeile in `surveyConfigs` in `shared/utils/getConfigBySurveySlug.ts`.
4. Nichts anderes ändern (Prisma, `src/server`, `src/routes`, `shared/`, andere Eingaben-Formulare). Was nur so ginge → im PR unter „Offen für Dev“.

Feldtypen und Props: `shared/types.ts` (`FieldConfig`). Validierungen: `shared/fieldvalidationEnum.ts`.

- `name` = ID in der DB: eindeutig pro Teil, camelCase, stabil; Options-`key`s ebenso
- Bedingte Pflichtfelder: `condition` + `conditionalRequiredString` (Beispiel: `rstest-2-3/part2.ts`)
- `progressBarDefinition` über Teile und `end` aufsteigend
- `part2` nutzt feste Namen für den Admin: `feedbackText` (Pflicht), `category`, `enableLocation`, `location`

### enableLocation und location

- In vielen Vorlagen ist `enableLocation` ja/nein (Pin optional). Beim Absenden entfernt die App `location`, wenn `enableLocation` nein ist (`SurveyMainPage`).
- Andere Optionstexte oder -keys (z. B. netzübergreifend ohne Karte) sind möglich → dann „Offen für Dev“: Server/App müssen ggf. `location` bei anderen Werten leeren; Admin-Anzeige anpassen.
- Wenn unsicher: ja/nein für `enableLocation` und inhaltliche Unterscheidung über ein zusätzliches Radio-Feld — nicht die Semantik von `enableLocation` umbiegen.

### Vorgangs-ID (referenceId)

Aktenzeichen für die Verwaltung im Backend (Zuordnung, E-Mails, Bearbeitung). Vor dem Schreiben klären, ob eine Vorgangs-ID gewünscht ist.

| Formulartyp                                                                  | Vorgangs-ID                                               |
| ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| Öffentliche Bürgerbeteiligung (Hinweise, Feedback)                           | in der Regel nein — `{{referenceId}}` nicht in E-Mails    |
| Verwaltungsintern: TÖB-Anhörung, Maßnahmenmeldung, behördliche Stellungnahme | oft ja — Vorlage: `ohv-haltestellenfoerderung/config.tsx` |

Nur bei ja: `{{referenceId}}` in `email` und optional `adminEmail` (Markdown + `fields`). Die Vergabe passiert im Server (nicht Agent) → im PR unter „Offen für Dev“ vermerken.

### E-Mails (config.tsx)

Blöcke `email` und optional `adminEmail`. Inhalte erfragen und bestätigen lassen — nicht nur Texte aus einer anderen Umfrage kopieren.

- Teilnehmende (`email`): `subject`, `markdown` (Fließtext, Grußformel), welche Felder in der Zusammenfassung; pro Zeile `{{feldname}}` (nur Felder aus `part1`/`part2`/`part3`, plus `surveyUrl` vom System); `fields` muss zur Markdown-Liste passen (`surveyConfigs.test.ts`)
- Team (`adminEmail`): gewünscht? Betreff und Text analog; `recipients` im Agent-PR als Dummy (`…@dummy.de`) — echte Adressen → „Offen für Dev“
- Danke-Seite: `end.mailjetWidgetUrl` — URL oder `null`

Struktur-Vorlagen: `ohv-haltestellenfoerderung/config.tsx` oder kürzer `rstest-2-3/config.tsx`.

## Karten = Dummy

Agent-Phase: nur `bounds` (und ggf. Default-Punkt) aufs Projektgebiet, `meta.maptilerUrl` von einer passenden Vorlage. Kein `mapData.const.tsx` — das ist Dev-Nacharbeit.

Im PR vermerken: „Karte = Dummy, Dev muss nacharbeiten“.

### Karten-Komponente wählen

| Nutzer soll                                                        | Komponente                                                                 | Vorlage                                                                      |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Nur einen Pin setzen (ohne Netz zum Anklicken)                     | `SurveySimpleMapWithLegend`, Feld `location`                               | `rstest-2-3/part2.ts`                                                        |
| Strecke, Linie oder Planungsabschnitt auf dem Netz anklicken       | `SurveyGeoCategoryMapWithLegend`, Felder `geometryCategory` (+ Hidden-IDs) | `radschnellverbindungen-info-feedback` oder `rstest-2` + `mapData.const.tsx` |
| Bestandsobjekt auf der Karte oder freier Pin (optional ohne Karte) | `SwitchableMap`, Feld `location`                                           | `ohv-haltestellenfoerderung` + `mapData.const.tsx`                           |

Verlangt der Fragentext Trassenabschnitt und Punktsetzung, reicht ein einfacher Pin-Dummy nicht → „Offen für Dev“ (GeoCategory + Pin mit `mapData` oder getrennte Bedingungen).

Dev-Phase (Karte fertig):

1. Geodaten bereitstellen (Tilda GeoJSON/PMTiles wie OHV Haltestellen/BB, oder `/api/projects/<slug>.json` bei `Project.exportEnabled`)
2. `surveys/<slug>/mapData.const.tsx` anlegen, in `part2.ts` an `mapProps.mapData` hängen
3. Legende, `bounds`, Texte und Pflichtlogik an echte Layer anpassen
4. Geodaten-Workflow: `surveys/radnetz-brandenbrug/README.md` (Referenz)

Basemap: `config.tsx` → `meta.maptilerUrl` (MapLibre-Style).

## Offen für Dev (im PR auflisten)

- Karte: `mapData.const.tsx`, Geometrie, ggf. `geometryCategory`
- Vorgangs-ID: nur wenn vereinbart — Server-Vergabe beim Submit für den Slug (`publicSurveyResponses.server.ts`; Referenz-Slug `ohv-haltestellenfoerderung`)
- E-Mails: Texte/Rechtliches prüfen; `adminEmail.recipients` von Dummy auf echte Adressen
- Backend: eigene Status, Filter, Labels in `config.tsx` statt Default `backendConfig`
- enableLocation: abweichende Keys → Location-Cleanup und Admin-Auswertung

## PR

1. Fork von `FixMyBerlin/trassenscout` mit `develop` synchronisieren („Sync fork“).
2. Branch `survey/<slug>` von `develop`, committen, pushen.
3. PR gegen `FixMyBerlin/trassenscout:develop`. Geht das nicht: Link zum Branch — „Compare & pull request“.
4. Beschreibung: Slug, `https://staging.trassenscout.de/beteiligung/<slug>`, Teile/Fragen/Karte, „Offen für Dev“.
5. CI prüft u. a. `surveyConfigs.test.ts` — Fehler im selben Branch beheben.
