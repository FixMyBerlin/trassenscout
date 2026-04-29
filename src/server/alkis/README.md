# ALKIS state configuration

Central config for ALKIS WMS/WFS per German state (`StateKeyEnum`). Types live in **`alkisStateConfig.types.ts`**. The dataset lives in **`alkisStateConfig.data.ts`**: that file is a hybrid module produced by **`bun run alkis:update-config`**, but you still **edit it by hand** for policy fields — especially **`enabled`** and **`attribution`** (plus `label`, `specialCaseNote`, and `wms` as needed). Each update run **copies those forward** from the previous file and only **merges `wfs`** when the audit marks a state verified. **`alkisStateConfig.ts`** re-exports types and data and defines helpers.

For now only these states have **`enabled: true`** (set manually when onboarding a state):

- Baden-Württemberg
- Berlin
- Brandenburg
- Hessen
- Nordrhein-Westfalen

## Workflow

1. **`bun run alkis:audit`** — probes WFS endpoints and writes `scripts/alkis-wfs/results/audit-results.json` (and `.md`). Details: [`scripts/alkis-wfs/README.md`](../../../scripts/alkis-wfs/README.md).

2. **`bun run alkis:update-config`** — reads the audit JSON and **only rewrites** `alkisStateConfig.data.ts`. Manual fields are copied from the previous file; **`wfs`** is merged from audit suggestions when that state is verified.

### Manual vs script

| Fields                                                      | Updated by script                                                    |
| ----------------------------------------------------------- | -------------------------------------------------------------------- |
| `label`, `enabled`, `attribution`, `specialCaseNote`, `wms` | No — carried forward from the existing generated module on each run. |

Operational `// TODO: unverified in latest audit (...)` lines are emitted by the script for states that did not verify.

When the audit marks a state **verified**, `wfs` fields including `bboxAxisOrder` may be replaced by probe-derived suggestions—compare against your intent before committing.

### Attribution

Attribution text and URLs come from **manual** dataset metadata (Geoportals / GDI-DE / CSW), not reliably from WFS GetCapabilities: the service describes technology; legal attribution is defined at dataset level.

- **DL-DE BY 2.0** — attribution is required (show provider/source).
- **DL-DE Zero 2.0** — attribution not required; showing source remains good practice in the UI.

### Notes per Land

Endpoint quirks and audit caveats can also be recorded per state in **`specialCaseNote`** (manual; preserved across update runs).
