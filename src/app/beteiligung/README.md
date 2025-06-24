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

- create folder `_rsx` in `src/app/beteiligung`
- copy and define `config.tsx`
- copy and update `SurveyRsX` component
- import SurveyRsX in `src/app/beteiligung/[surveySlug]/page.tsx`
- add slug in `src/app/beteiligung/_shared/utils/allowedSurveySlugs.ts`
- create survey via UI `/admin/surveys/new` with slug

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
