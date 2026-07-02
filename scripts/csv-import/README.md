# CSV Import Scripts

Import scripts for **Subsections** (Planungsabschnitte) and **Subsubsections** from Google Sheets CSV exports.

## Usage

```bash
bun scripts/csv-import/subsections/index.ts <config-name> <env>
bun scripts/csv-import/subsubsections/index.ts <config-name> <env>
```

## Example

```bash
bun scripts/csv-import/subsections/index.ts config-1 staging
bun scripts/csv-import/subsubsections/index.ts config-1 staging
```

## Arguments

- `config-name`: Name of the config file (without `.ts` extension) in the script's `configs/` folder
- `env`: Environment (`dev`, `staging`, or `production`)

Column names must match **exactly** (case-sensitive). Unknown columns are ignored and reported in the script summary.

---

## Subsections

### Required columns

| Column    | Description                                    |
| --------- | ---------------------------------------------- |
| `project` | Project slug (lookup only, not sent as data)   |
| `slug`    | Subsection slug (identifier for create/update) |

### Optional columns

| Column                          | Notes                                           |
| ------------------------------- | ----------------------------------------------- |
| `order`                         | Number                                          |
| `description`                   | String; empty → `null`                          |
| `geometry`                      | GeoJSON geometry or Feature JSON; infers `type` |
| `labelPos`                      | Enum; defaults to `top` if omitted              |
| `lengthM`                       | Number (comma/dot normalized)                   |
| `managerId`                     | Numeric ID                                      |
| `operatorId`                    | Numeric ID                                      |
| `networkHierarchyId`            | Numeric ID                                      |
| `subsectionStatusId`            | Numeric ID                                      |
| `estimatedCompletionDateString` | Format `YYYY-MM`                                |

### Ignored columns

| Column | Notes                                 |
| ------ | ------------------------------------- |
| `type` | Do not use — inferred from `geometry` |

**Minimum CSV headers:** `project`, `slug`

---

## Subsubsections

### Required columns

| Column    | Description                                       |
| --------- | ------------------------------------------------- |
| `project` | Project slug (lookup only)                        |
| `pa-slug` | Parent subsection (Planungsabschnitt) slug        |
| `slug`    | Subsubsection slug (identifier for create/update) |

### Optional columns — slug lookups

Use these instead of the corresponding numeric ID columns.

| Column                    | Maps to        |
| ------------------------- | -------------- |
| `qualityLevelSlug`        | Quality level  |
| `subsubsectionStatusSlug` | Status         |
| `subsubsectionInfraSlug`  | Infrastructure |
| `subsubsectionTaskSlug`   | Task           |

### Optional columns — numeric ID lookups

| Column                              |
| ----------------------------------- |
| `qualityLevelId`                    |
| `subsubsectionStatusId`             |
| `subsubsectionInfraId`              |
| `subsubsectionTaskId`               |
| `subsubsectionInfrastructureTypeId` |
| `managerId`                         |

### Optional columns — geometry & core fields

| Column                            | Notes                                                 |
| --------------------------------- | ----------------------------------------------------- |
| `geometry`                        | GeoJSON; infers `type` (`POINT` / `LINE` / `POLYGON`) |
| `subTitle`                        |                                                       |
| `description`                     |                                                       |
| `location`                        | Enum, uppercased; empty → `null`                      |
| `labelPos`                        | Defaults to `top`                                     |
| `lengthM`                         | Defaults to `0`                                       |
| `width`                           |                                                       |
| `widthExisting`                   |                                                       |
| `costEstimate`                    |                                                       |
| `mapillaryKey`                    |                                                       |
| `isExistingInfra`                 | `true` / `1` / `yes` / `ja`; defaults to `false`      |
| `maxSpeed`                        |                                                       |
| `trafficLoad`                     |                                                       |
| `trafficLoadDate`                 | Date                                                  |
| `planningPeriod`                  |                                                       |
| `constructionPeriod`              |                                                       |
| `estimatedCompletionDate`         | Date                                                  |
| `estimatedConstructionDateString` | Format `YYYY`                                         |

### Optional columns — cost / finance

| Column                          |
| ------------------------------- |
| `planningCosts`                 |
| `deliveryCosts`                 |
| `constructionCosts`             |
| `landAcquisitionCosts`          |
| `expensesOfficialOrders`        |
| `expensesTechnicalVerification` |
| `nonEligibleExpenses`           |
| `revenuesEconomicIncome`        |
| `contributionsThirdParties`     |
| `grantsOtherFunding`            |
| `ownFunds`                      |

### Optional columns — many-to-many

| Column                               |
| ------------------------------------ |
| `subsubsectionInfrastructureTypeIds` |
| `specialFeatures`                    |

### Ignored columns

| Column | Notes                                 |
| ------ | ------------------------------------- |
| `type` | Do not use — inferred from `geometry` |

**Minimum CSV headers:** `project`, `pa-slug`, `slug`

---

## Notes

- `geometry` is optional for both scripts. If omitted, the API preserves existing geometry or applies a fallback.
- For subsubsections, prefer slug columns (`qualityLevelSlug`, etc.) over numeric IDs when importing from spreadsheets.
