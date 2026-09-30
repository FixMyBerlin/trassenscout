# Neues Eingaben-Formular anlegen

Für Agents, die im Auftrag von Nicht-Devs ein Eingaben-Formular anlegen (im Code „Survey“). Ergebnis: PR gegen `develop`, nie direkt pushen.

## Vorher klären

Erst fragen, dann schreiben. Zum Schluss zusammenfassen und bestätigen lassen.

- Slug (muss im Admin unter `/admin/projects/<projekt>/surveys/new` existieren)
- Teile: `part1`/`part3` = Fragebogen, `part2` = Hinweise (mehrfach, oft mit Karte)
- Pro Seite Titel, Text, Fragen. Pro Frage: Feldtyp, Pflicht/optional, Optionen, Bedingung, Hilfetext
- Texte: Intros, Buttons, Danke-Seite, Startseiten-Link
- Meta: Titel, Logo-URL, `primaryColor`/`darkColor`/`lightColor`, `canonicalUrl`
- Karte (Gebiet, Pflicht?), E-Mails (Teilnehmende/Team), Mailjet-Widget (sonst `null`)

## Umsetzen

1. Ordner `surveys/<slug>/` mit `config.tsx` und nur den benötigten `partN.ts`. Keine `Survey<Name>.tsx`.
   Vorlagen: `rstest-1` (part1), `rstest-2-3` (part2 + part3), `rstest-1-2-3` (alle).
2. `backend: backendConfig` (aus `shared/backend-types.ts`), außer es werden eigene Status gewünscht.
3. Registrieren: Slug in `shared/utils/allowedSurveySlugs.ts`, Zeile in `surveyConfigs` in `shared/utils/getConfigBySurveySlug.ts`.
4. Nichts anderes ändern (Prisma, `src/server`, `src/routes`, `shared/`, andere Eingaben-Formulare). Was nur so ginge → im PR unter „Offen für Dev“.

Feldtypen und Props: `shared/types.ts` (`FieldConfig`), Validierungen: `shared/fieldvalidationEnum.ts`.

- `name` = ID in der DB: eindeutig pro Teil, camelCase, stabil. Options-`key`s ebenso.
- Bedingte Pflichtfelder: `condition` + `conditionalRequiredString` (Beispiel: `rstest-2-3/part2.ts`).
- `progressBarDefinition` über Teile und `end` aufsteigend.
- `part2` nutzt feste Namen, die der Admin auswertet: `feedbackText` (Pflicht), `category`, `enableLocation`, `location`.

## Karten = Dummy

Aus Vorlage kopieren, nur `bounds`/Default-Punkt aufs Projektgebiet setzen, `meta.maptilerUrl` übernehmen.
Im PR vermerken: „Karte = Dummy, Dev muss nacharbeiten“.

| Typ                                          | Vorlage                                                      |
| -------------------------------------------- | ------------------------------------------------------------ |
| `SurveySimpleMapWithLegend` (Pin, Standard)  | `rstest-2-3/part2.ts`, Feld `location`                       |
| `SurveyGeoCategoryMapWithLegend` (Abschnitt) | `radschnellverbindungen-info-feedback` + `mapData.const.tsx` |
| `SwitchableMap` (Pin oder Linie)             | `ohv-haltestellenfoerderung` + `mapData.const.tsx`           |

## PR

`bun run check` wenn möglich (inkl. `surveyConfigs.test.ts`). Branch `survey/<slug>`.
Beschreibung: Slug, `https://staging.trassenscout.de/beteiligung/<slug>`, Teile/Fragen/Karte, „Offen für Dev“.
