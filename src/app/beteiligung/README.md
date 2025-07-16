## Main Structure

Public Survey
│
├── part1 (f.k.a. survey) – optional
│ ├── Intro - standard or custom component
│ └── Pages n (min. 1)
│ | └── Fields n (min. 1)
│ | | ├── Form Fields (checkbox, text input, etc.)
│ | | └── Content Fields (heading, etc.)
│
├── part2 (f.k.a. feedback) – optional, repeatable
│ ├── Intro - standard or custom component
│ └── Pages n (min. 1)
│ | └── Fields n (min. 1)
│ | | ├── Content Fields (heading, etc.)
│ | | └── Form Fields (checkbox, text input, etc.)
│ | | | ├── category
│ | | | ├── geoCategory (optional)
│ | | | └── location
│
├── part3 (new) – optional
│ ├── Intro - standard or custom component
│ └── Pages n (min. 1)
│ | └── Fields n (min. 1)
│ | | ├── Form Fields (checkbox, text input, etc.)
│ | | └── Content Fields (heading, etc.)
│
└── end

Types for Form Config `src/app/beteiligung/_shared/types.ts`

## Set up new survey

- create folder `_ohv-haltestellenfoerderung` in `src/app/beteiligung`
- copy and define `config.tsx`
- copy and update `SurveyOhv-haltestellenfoerderung` component
- import SurveyOhv-haltestellenfoerderung in `src/app/beteiligung/[surveySlug]/page.tsx`
- add slug in `src/app/beteiligung/_shared/utils/allowedSurveySlugs.ts`
- import config in `src/app/beteiligung/_shared/utils/getConfigBySurveySlug.ts`
- create survey via UI `/admin/surveys/new` with slug

## Geo data Integration

To integrate geodata/maps into surveys:

#### 1. Prepare Geodata

- Upload geo data to Drive project folder as GeoJSON

#### 2. Static Data TILDA

- Data becomes visible in TILDA as static data (on staging) TBD
- GitHub repository:
  https://github.com/FixMyBerlin/tilda-static-data/tree/main/geojson/trassenscout-umfragen

The `trassenscout-umfragen` region is used for survey-specific static data. If a TILDA region already exists for the project, that can be used instead.

Example URLs:

- `https://staging.tilda-geo.de/api/uploads/ohv-busverbindungen`
- `https://staging.tilda-geo.de/api/uploads/ohv-haltestellen`

PMTiles URLs can be found by:

- Opening the Inspector's Network tab
- Filtering for "/api/uploads/"
- Toggling layers on/off

Note: These are PMTiles format and require the `pmtiles://https://staging...` prefix in the URL.

The PMTiles URLs are referenced in a mapData file that is imoportet in the config for the respective map component (- so far we only use this for GeoCategoryMap, but in eventually we want to see the geo data also in the location Map component in case both are combined in a survey)

#### 3. Styling

- Styles are defined (location for style specifications is TBD)
- defined in a mapData file that is imoportet in the config
- Styles may also be integrated into TILDA

## Referencing survey questions / evaluationRefs

Legacy surveys (rs8, frm7, radnetz-bb) - have arbitrary keys for location, category etc. in the data object. So we have a response-config.ts file in the legacy folders and get the question ids with `getQuestionIdBySurveySlug()`.

New surveys: "category", "geoCategory", "enableLocation", "location", "feedbackText" are the keys in the data object.

## Configurable TS-"Backend"

`config.tsx`- backend holds the configuration object for the internal TS UI `trassenscout.de/surveys/[surveyId]/responses`

It defines:

- the status enum,
- the labels of note, status, operator, topics, category, location,
- additional filters for survey specific fields which are stored in the survey result itself (not in the DB); filters can only be defined for questions of type text for now

In `src/app/beteiligung/_shared/backend-types.ts` defines the defaults for the backend config. It can be used as a copy template. If no labels are set in the config file, the survey will take them from this file.

The configuration of status must not be changed later to be sure that status in the DB always matches the status configuration.
