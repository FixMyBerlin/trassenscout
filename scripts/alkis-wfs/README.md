# ALKIS WFS audit scripts

_This is still WIP._

This folder contains a reproducible pipeline for collecting and updating ALKIS-WFS state config data.

## Scripts

- `bun scripts/alkis-wfs/audit.ts` (`npm run alkis:audit`)
  - Runs `GetCapabilities` for each configured state WFS endpoint (shared XML parsing in `shared/wfsCapabilities.ts`).
  - Runs a small `GetFeature` probe (axis-order + format + property detection); up to four states at a time.
  - Writes:
    - `scripts/alkis-wfs/results/audit-results.json` (machine-readable, generated)
    - `scripts/alkis-wfs/results/audit-results.md` (human report)
- `bun scripts/alkis-wfs/update-config.ts`
  - Reads `audit-results.json`.
  - Updates `src/app/api/(auth)/[projectSlug]/alkis-wfs-parcels/_utils/alkisStateConfig.ts`.
  - Keeps manual fields (`label`, `enabled`, `wmsUrl`, `layerName`, `attribution`, `specialCaseNote`) unchanged.
  - Writes `// TODO: unverified` comments for states that were not verified.

## Data flow

1. Run audit. `npm run alkis:audit`
2. Review markdown report and open TODO/unverified states.
3. Run config update. `alkis:update-config`
4. Commit changed config and report.

## Special-case notes

Endpoint quirks and audit caveats live on each state as `specialCaseNote` in `alkisStateConfig.ts`. Edit that field in the config file; it is not overwritten from the audit JSON.

## Limitations

- Probe coordinates live in `src/shared/alkisStateTestCoordinates.ts` (`STATE_TEST_COORDINATES`); they are representative and can still hit empty areas.
- Network/server instability can temporarily mark a state as unverified.
- Only projections `EPSG:25832` and `EPSG:25833` are auto-reprojected for native probes.
