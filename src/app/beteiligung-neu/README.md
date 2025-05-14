## Referencing survey questions / evaluationRefs

todo

## Configurable TS-"Backend"

todo update after backend refactoring

`src/todo.ts` holds the configuration object for the internal TS UI `trassenscout.de/surveys/[surveyId]/responses`

It defines:

- the status enum,
- the labels of note, status, operator, topics, category, location,
- additional filters for survey specific fields which are stored in the survey result itself (not in the DB); filters can only be defined for questions of type text for now

In `src/todo.ts` defines the defaults for the `todo.ts` files. It can be used as a copy template. If no labels are set in the config file, the survey will take them from this file.

The configuration of status must not be changed to be sure that status in the DB always matches the status configuration.
