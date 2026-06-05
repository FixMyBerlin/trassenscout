# Route migration: Next.js App Router → TanStack Start

Analysis date: 2026-06-04
Reference: [`tilda-geo/app`](../../tilda-geo/app) (`src/routes/`)
Source: Trassenscout `src/app/` (Next.js 14 + Blitz)

Docs:

- [TanStack Router — file-based routing](https://tanstack.com/router/latest/docs/routing/file-based-routing)
- [TanStack Start — routing](https://tanstack.com/start/latest/docs/framework/react/guide/routing)

---

## Summary

|                  | Trassenscout (today)                   | Target (TILDA pattern)                                 |
| ---------------- | -------------------------------------- | ------------------------------------------------------ |
| Router           | Next.js App Router                     | TanStack Router (file routes under `src/routes/`)      |
| Framework        | Blitz / Next                           | TanStack Start + Vite + Nitro                          |
| Layout groups    | `(marketing)`, `(loggedInProjects)`, … | Pathless layouts: `_marketing`, `_loggedInProjects`, … |
| Dynamic segments | `[projectSlug]`                        | `$projectSlug`                                         |
| API              | `src/app/api/**/route.ts`              | `src/routes/api/**/*.ts` with `server.handlers`        |
| RPC              | `src/pages/api/rpc/[[...blitz]].ts`    | `createServerFn` + TanStack Query (no HTTP route)      |

**Public URLs stay the same** wherever possible. Only file names and internal route IDs change.

---

## TILDA routing patterns (reference)

Observed in `tilda-geo/app/src/routes/` (72 route files).

### File naming

| Pattern                        | Example file                                                | URL path                                      | `createFileRoute` id                           |
| ------------------------------ | ----------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| Root                           | `__root.tsx`                                                | (shell)                                       | `/` (root)                                     |
| Pathless layout                | `_home.tsx`, `_pages.tsx`                                   | omitted from URL                              | `/_home`, `/_pages`                            |
| Pathless index                 | `_home/index.tsx`                                           | `/`                                           | `/_home/`                                      |
| Layout + outlet                | `admin.tsx`, `regionen.tsx`                                 | `/admin`, `/regionen`                         | `/admin`, `/regionen`                          |
| Section layout + index         | `admin/memberships.tsx` + `admin/memberships/index.tsx`     | `/admin/memberships` (list)                   | `/admin/memberships/`                          |
| Leaf (flat dot sibling)        | `admin/memberships.new.tsx`                                 | `/admin/memberships/new`                      | `/admin/memberships/new`                       |
| Leaf (flat dot sibling)        | `admin/regions.$regionSlug.edit.tsx`                        | `/admin/regions/:slug/edit`                   | `/admin/regions/$regionSlug/edit`              |
| All in one folder (TILDA alt.) | `admin/static-dataset-categories/index.tsx` + `.../new.tsx` | `/admin/static-dataset-categories`, `.../new` | `/admin/static-dataset-categories/`, `.../new` |
| Dynamic                        | `regionen/$regionSlug.tsx`                                  | `/regionen/:slug`                             | `/regionen/$regionSlug`                        |
| API leaf                       | `api/stats.ts`                                              | `/api/stats`                                  | `/api/stats`                                   |
| API nested                     | `api/export.$regionSlug.$tableName.ts`                      | `/api/export/:region/:table`                  | `/api/export/$regionSlug/$tableName`           |
| API splat                      | `api/auth.$.ts`                                             | `/api/auth/*`                                 | `/api/auth/$`                                  |
| API “create” segment           | `api/uploads.create.ts`                                     | `/api/uploads/create`                         | `/api/uploads/create`                          |

### TILDA admin naming (important)

TILDA does **not** use `admin/memberships.index.tsx`. There are **no** `*.index.tsx` dot files anywhere under `src/routes/`.

For a typical admin CRUD section (memberships, regions, qa-configs, uploads), TILDA uses a **hybrid**:

```
admin/memberships.tsx              → layout route /admin/memberships (<Outlet />)
admin/memberships/index.tsx        → list at /admin/memberships/
admin/memberships.new.tsx          → /admin/memberships/new   (flat dot file, not in folder)
admin/regions.$regionSlug.edit.tsx → /admin/regions/:slug/edit
```

So list + layout = **folder** (`index.tsx`); simple siblings like `new` and dynamic `edit` = **flat dot** files next to the folder.

`static-dataset-categories` is the exception: everything in a folder (`index.tsx`, `new.tsx`, `$categoryKey.tsx`).

That hybrid is easy to misread in a migration table. **Trassenscout target: folder-only per section** (second option below)—one rule, no mixing.

| Style                         | Example (memberships)                                                                 | Use in Trassenscout                                |
| ----------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Folder-only (recommended)** | `admin/memberships.tsx` + `admin/memberships/index.tsx` + `admin/memberships/new.tsx` | Yes — all admin + project CRUD                     |
| TILDA hybrid                  | `.../memberships/index.tsx` + `admin/memberships.new.tsx`                             | Reference only (optional later convergence)        |
| Flat dot index                | `admin/memberships.index.tsx` + `admin/memberships.new.tsx`                           | Not used in TILDA; avoid unless you verify codegen |

### Cross-cutting (TILDA)

- **`beforeLoad`**: auth redirects (`admin.tsx`, `_home/index.tsx`), trailing-slash canonicalization (`__root.tsx`).
- **`loader` + Query**: region page preloads (`regionen/$regionSlug.tsx`).
- **`ssr`**: `'data-only'` on heavy map routes; `true` on most pages.
- **`preview/`**: dev-only error/pending UI routes (optional for Trassenscout).
- **Generated**: `src/routeTree.gen.ts` via `@tanstack/router-plugin`.

---

## Next.js → TanStack mapping rules

| Next.js                         | TanStack Start file route                                                                |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| `(group)/`                      | `_group.tsx` pathless layout (underscore prefix)                                         |
| `[param]`                       | `$param` in file/folder name                                                             |
| `page.tsx`                      | `index.tsx` or `route.tsx` (TILDA uses `index.tsx` for indexes, named `.tsx` for leaves) |
| `layout.tsx`                    | Parent `*.tsx` with `<Outlet />` (e.g. `_loggedInProjects.tsx`)                          |
| `(tabs)/`                       | `_tabs.tsx` pathless layout **or** single route + tab search param                       |
| `@modal` parallel slot          | See [Parallel routes & modals](#parallel-routes--modals)                                 |
| `(.)` intercepting routes       | Modal/search-param pattern; no direct equivalent                                         |
| `[...rest]`                     | `.$` splat file (e.g. `uploads.$uploadId.$.ts`)                                          |
| `route.ts` (API)                | `api/....ts` with `server.handlers.{GET,POST,...}`                                       |
| Route groups in `api/(apiKey)/` | Folder only; enforce auth in `beforeLoad` / handler                                      |

**Suggested Trassenscout `src/routes/` skeleton:**

```
src/routes/
  __root.tsx
  _marketing.tsx + _marketing/index.tsx          → /
  _content.tsx + _content/{kontakt,datenschutz,browser-version}.tsx
  auth.tsx (optional) + auth/{login,signup,...}.tsx
  _loggedInGeneral.tsx + _loggedInGeneral/{dashboard,support,user/edit}.tsx
  _loggedInFullscreen.tsx + _loggedInFullscreen/$projectSlug/uploads/$uploadId/view.tsx
  _loggedInProjects.tsx                          → layout + modal outlet TBD
  _loggedInProjects/$projectSlug/...             → all project pages
  admin.tsx + admin/...
  beteiligung/$surveySlug.tsx
  api/...
```

---

## Layout routes (pathless)

These Next **route groups** do not appear in the URL. Map them to TanStack **pathless** layouts (`_name.tsx`).

| Next layout                             | Role                                  | TanStack layout file                                       | Auth / notes                                         |
| --------------------------------------- | ------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| `src/app/layout.tsx`                    | Root HTML, providers                  | `__root.tsx`                                               | BlitzProvider → app providers; Nuqs → router adapter |
| `(marketing)/`                          | Public homepage                       | `_marketing.tsx` + `_marketing/index.tsx`                  | `redirectAuthenticatedTo: /dashboard`                |
| `(content)/`                            | Legal / static                        | `_content.tsx`                                             | Public                                               |
| `auth/`                                 | Auth chrome                           | `auth.tsx` (optional)                                      | Public                                               |
| `(loggedInGeneral)/`                    | Global logged-in shell                | `_loggedInGeneral.tsx`                                     | Session required                                     |
| `(loggedInFullscreen)/`                 | Fullscreen upload viewer              | `_loggedInFullscreen.tsx`                                  | Session required                                     |
| `(loggedInProjects)/`                   | Project nav + footer + **modal slot** | `_loggedInProjects.tsx`                                    | Session required; see modals                         |
| `(admin)/admin/`                        | Admin shell                           | `admin.tsx`                                                | `role: ADMIN` (mirror TILDA `admin.tsx`)             |
| `beteiligung/[surveySlug]/layout.tsx`   | Survey participation chrome           | `beteiligung.tsx` or co-located layout on `$surveySlug`    | Public per survey config                             |
| `[projectSlug]/project-records/(tabs)/` | Tab chrome for project records        | `_loggedInProjects/$projectSlug/project-records/_tabs.tsx` | Pathless; URLs unchanged                             |
| `.../land-acquisition/layout.tsx`       | Map + acquisition UI                  | `_loggedInProjects/$projectSlug/.../land-acquisition.tsx`  | Nested layout                                        |

---

## Page routes

Columns:

- **URL** — unchanged public path (route groups stripped).
- **Next.js path** — under `src/app/`.
- **TanStack route file** — proposed path under `src/routes/`.
- **Route id** — argument to `createFileRoute('...')` (from codegen).

### Marketing & content

| URL                | Next.js path                         | TanStack route file            | Route id                    |
| ------------------ | ------------------------------------ | ------------------------------ | --------------------------- |
| `/`                | `(marketing)/page.tsx`               | `_marketing/index.tsx`         | `/_marketing/`              |
| `/kontakt`         | `(content)/kontakt/page.tsx`         | `_content/kontakt.tsx`         | `/_content/kontakt`         |
| `/datenschutz`     | `(content)/datenschutz/page.tsx`     | `_content/datenschutz.tsx`     | `/_content/datenschutz`     |
| `/browser-version` | `(content)/browser-version/page.tsx` | `_content/browser-version.tsx` | `/_content/browser-version` |

### Auth

| URL                     | Next.js path                    | TanStack route file        | Route id                |
| ----------------------- | ------------------------------- | -------------------------- | ----------------------- |
| `/auth/login`           | `auth/login/page.tsx`           | `auth/login.tsx`           | `/auth/login`           |
| `/auth/signup`          | `auth/signup/page.tsx`          | `auth/signup.tsx`          | `/auth/signup`          |
| `/auth/logout`          | `auth/logout/page.tsx`          | `auth/logout.tsx`          | `/auth/logout`          |
| `/auth/forgot-password` | `auth/forgot-password/page.tsx` | `auth/forgot-password.tsx` | `/auth/forgot-password` |
| `/auth/reset-password`  | `auth/reset-password/page.tsx`  | `auth/reset-password.tsx`  | `/auth/reset-password`  |

### Logged-in (general)

| URL          | Next.js path                           | TanStack route file                                 | Route id                      |
| ------------ | -------------------------------------- | --------------------------------------------------- | ----------------------------- |
| `/dashboard` | `(loggedInGeneral)/dashboard/page.tsx` | `_loggedInGeneral/dashboard.tsx`                    | `/_loggedInGeneral/dashboard` |
| `/support`   | `(loggedInGeneral)/support/page.tsx`   | `_loggedInGeneral/support.tsx`                      | `/_loggedInGeneral/support`   |
| `/user/edit` | `(loggedInGeneral)/user/edit/page.tsx` | `_loggedInGeneral/user.edit.tsx` or `user/edit.tsx` | `/_loggedInGeneral/user/edit` |

### Logged-in (fullscreen)

| URL                                    | Next.js path                                                          | TanStack route file                                           | Route id                                                   |
| -------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| `/:projectSlug/uploads/:uploadId/view` | `(loggedInFullscreen)/[projectSlug]/uploads/[uploadId]/view/page.tsx` | `_loggedInFullscreen/$projectSlug/uploads/$uploadId/view.tsx` | `/_loggedInFullscreen/$projectSlug/uploads/$uploadId/view` |

### Public participation

| URL                        | Next.js path                        | TanStack route file           | Route id                   |
| -------------------------- | ----------------------------------- | ----------------------------- | -------------------------- |
| `/beteiligung/:surveySlug` | `beteiligung/[surveySlug]/page.tsx` | `beteiligung/$surveySlug.tsx` | `/beteiligung/$surveySlug` |

### Admin

| URL                                                     | Next.js path                              | TanStack route file                                          | Route id                                                  |
| ------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| `/admin`                                                | `(admin)/admin/page.tsx`                  | `admin/index.tsx`                                            | `/admin/`                                                 |
| `/admin/logEntries`                                     | `(admin)/admin/logEntries/page.tsx`       | `admin/logEntries.tsx`                                       | `/admin/logEntries`                                       |
| `/admin/memberships`                                    | `(admin)/admin/memberships/page.tsx`      | `admin/memberships/index.tsx`                                | `/admin/memberships/`                                     |
| `/admin/memberships/new`                                | `(admin)/admin/memberships/new/page.tsx`  | `admin/memberships/new.tsx`                                  | `/admin/memberships/new`                                  |
| `/admin/projects`                                       | `(admin)/admin/projects/page.tsx`         | `admin/projects/index.tsx`                                   | `/admin/projects/`                                        |
| `/admin/projects/new`                                   | `(admin)/admin/projects/new/page.tsx`     | `admin/projects/new.tsx`                                     | `/admin/projects/new`                                     |
| `/admin/projects/:projectSlug/subsections`              | `.../subsections/page.tsx`                | `admin/projects/$projectSlug/subsections/index.tsx`          | `/admin/projects/$projectSlug/subsections`                |
| `/admin/projects/:projectSlug/subsections/edit`         | `.../subsections/edit/page.tsx`           | `admin/projects/$projectSlug/subsections/edit.tsx`           | `/admin/projects/$projectSlug/subsections/edit`           |
| `/admin/projects/:projectSlug/subsections/multiple-new` | `.../multiple-new/page.tsx`               | `admin/projects/$projectSlug/subsections/multiple-new.tsx`   | `/admin/projects/$projectSlug/subsections/multiple-new`   |
| `/admin/project-records`                                | `.../project-records/page.tsx`            | `admin/project-records/index.tsx`                            | `/admin/project-records/`                                 |
| `/admin/project-records/:projectRecordId/edit`          | `.../[projectRecordId]/edit/page.tsx`     | `admin/project-records/$projectRecordId/edit.tsx`            | `/admin/project-records/$projectRecordId/edit`            |
| `/admin/project-record-emails`                          | `.../project-record-emails/page.tsx`      | `admin/project-record-emails/index.tsx`                      | `/admin/project-record-emails/`                           |
| `/admin/project-record-emails/new`                      | `.../new/page.tsx`                        | `admin/project-record-emails/new.tsx`                        | `/admin/project-record-emails/new`                        |
| `/admin/project-record-emails/:id`                      | `.../[projectRecordEmailId]/page.tsx`     | `admin/project-record-emails/$projectRecordEmailId.tsx`      | `/admin/project-record-emails/$projectRecordEmailId`      |
| `/admin/project-record-emails/:id/edit`                 | `.../edit/page.tsx`                       | `admin/project-record-emails/$projectRecordEmailId/edit.tsx` | `/admin/project-record-emails/$projectRecordEmailId/edit` |
| `/admin/project-record-templates`                       | `.../project-record-templates/page.tsx`   | `admin/project-record-templates/index.tsx`                   | `/admin/project-record-templates/`                        |
| `/admin/project-record-templates/new`                   | `.../new/page.tsx`                        | `admin/project-record-templates/new.tsx`                     | `/admin/project-record-templates/new`                     |
| `/admin/project-record-templates/:templateId/edit`      | `.../edit/page.tsx`                       | `admin/project-record-templates/$templateId/edit.tsx`        | `/admin/project-record-templates/$templateId/edit`        |
| `/admin/email-templates`                                | `.../email-templates/page.tsx`            | `admin/email-templates/index.tsx`                            | `/admin/email-templates/`                                 |
| `/admin/email-templates/:templateKey/edit`              | `.../edit/page.tsx`                       | `admin/email-templates/$templateKey/edit.tsx`                | `/admin/email-templates/$templateKey/edit`                |
| `/admin/surveys`                                        | `.../surveys/page.tsx`                    | `admin/surveys/index.tsx`                                    | `/admin/surveys/`                                         |
| `/admin/surveys/new`                                    | `.../new/page.tsx`                        | `admin/surveys/new.tsx`                                      | `/admin/surveys/new`                                      |
| `/admin/surveys/:surveyId/edit`                         | `.../edit/page.tsx`                       | `admin/surveys/$surveyId/edit.tsx`                           | `/admin/surveys/$surveyId/edit`                           |
| `/admin/surveys/:surveyId/responses`                    | `.../responses/page.tsx`                  | `admin/surveys/$surveyId/responses/index.tsx`                | `/admin/surveys/$surveyId/responses`                      |
| `/admin/surveys/:surveyId/responses/created`            | `.../created/page.tsx`                    | `admin/surveys/$surveyId/responses/created.tsx`              | `/admin/surveys/$surveyId/responses/created`              |
| `/admin/surveys/:surveyId/responses/test`               | `.../test/page.tsx`                       | `admin/surveys/$surveyId/responses/test.tsx`                 | `/admin/surveys/$surveyId/responses/test`                 |
| `/admin/support-documents/:supportDocumentId/edit`      | `.../support-documents/.../edit/page.tsx` | `admin/support-documents/$supportDocumentId/edit.tsx`        | `/admin/support-documents/$supportDocumentId/edit`        |

### Project — dashboard & settings

| URL                  | Next.js path                                | TanStack route file                        | Route id                               |
| -------------------- | ------------------------------------------- | ------------------------------------------ | -------------------------------------- |
| `/:projectSlug`      | `(loggedInProjects)/[projectSlug]/page.tsx` | `_loggedInProjects/$projectSlug/index.tsx` | `/_loggedInProjects/$projectSlug/`     |
| `/:projectSlug/edit` | `.../edit/page.tsx`                         | `_loggedInProjects/$projectSlug/edit.tsx`  | `/_loggedInProjects/$projectSlug/edit` |

### Project — contacts

| URL                                      | Next.js path               | TanStack route file                                 | Route id                       |
| ---------------------------------------- | -------------------------- | --------------------------------------------------- | ------------------------------ |
| `/:projectSlug/contacts`                 | `.../contacts/page.tsx`    | `_loggedInProjects/$projectSlug/contacts/index.tsx` | `.../contacts/`                |
| `/:projectSlug/contacts/table`           | `.../table/page.tsx`       | `.../contacts/table.tsx`                            | `.../contacts/table`           |
| `/:projectSlug/contacts/team`            | `.../team/page.tsx`        | `.../contacts/team.tsx`                             | `.../contacts/team`            |
| `/:projectSlug/contacts/new`             | `.../new/page.tsx`         | `.../contacts/new.tsx`                              | `.../contacts/new`             |
| `/:projectSlug/contacts/:contactId`      | `.../[contactId]/page.tsx` | `.../contacts/$contactId.tsx`                       | `.../contacts/$contactId`      |
| `/:projectSlug/contacts/:contactId/edit` | `.../edit/page.tsx`        | `.../contacts/$contactId.edit.tsx`                  | `.../contacts/$contactId/edit` |

### Project — operators, invites, uploads, network

| URL                                        | Next.js path                     | TanStack route file                                  | Route id                                         |
| ------------------------------------------ | -------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| `/:projectSlug/operators`                  | `.../operators/page.tsx`         | `.../operators/index.tsx`                            | `.../operators/`                                 |
| `/:projectSlug/operators/new`              | `.../new/page.tsx`               | `.../operators/new.tsx`                              | `.../operators/new`                              |
| `/:projectSlug/operators/:operatorId/edit` | `.../edit/page.tsx`              | `.../operators/$operatorId.edit.tsx`                 | `.../operators/$operatorId/edit`                 |
| `/:projectSlug/invites`                    | `.../invites/page.tsx`           | `.../invites/index.tsx`                              | `.../invites/`                                   |
| `/:projectSlug/invites/new`                | `.../new/page.tsx`               | `.../invites/new.tsx`                                | `.../invites/new`                                |
| `/:projectSlug/uploads`                    | `.../uploads/page.tsx`           | `.../uploads/index.tsx`                              | `.../uploads/`                                   |
| `/:projectSlug/uploads/:uploadId/edit`     | `.../edit/page.tsx`              | `.../uploads/$uploadId.edit.tsx`                     | `.../uploads/$uploadId/edit`                     |
| `/:projectSlug/network-hierarchy`          | `.../network-hierarchy/page.tsx` | `.../network-hierarchy/index.tsx`                    | `.../network-hierarchy/`                         |
| `/:projectSlug/network-hierarchy/new`      | `.../new/page.tsx`               | `.../network-hierarchy/new.tsx`                      | `.../network-hierarchy/new`                      |
| `/:projectSlug/network-hierarchy/:id/edit` | `.../edit/page.tsx`              | `.../network-hierarchy/$networkHierarchyId.edit.tsx` | `.../network-hierarchy/$networkHierarchyId/edit` |

### Project — lookup tables (status, quality, infra, …)

| URL                                                        | Next.js path                                | TanStack route file                                                                 | Route id                                                                        |
| ---------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `/:projectSlug/quality-levels`                             | `.../quality-levels/page.tsx`               | `.../quality-levels/index.tsx`                                                      | `.../quality-levels/`                                                           |
| `/:projectSlug/quality-levels/new`                         | `.../new/page.tsx`                          | `.../quality-levels/new.tsx`                                                        | `.../quality-levels/new`                                                        |
| `/:projectSlug/quality-levels/:id/edit`                    | `.../edit/page.tsx`                         | `.../quality-levels/$qualityLevelId.edit.tsx`                                       | `.../quality-levels/$qualityLevelId/edit`                                       |
| `/:projectSlug/subsection-status`                          | `.../subsection-status/...`                 | `.../subsection-status/index.tsx`                                                   | `.../subsection-status/`                                                        |
| `/:projectSlug/subsection-status/new`                      | `.../new/page.tsx`                          | `.../subsection-status/new.tsx`                                                     | `.../subsection-status/new`                                                     |
| `/:projectSlug/subsection-status/:id/edit`                 | `.../edit/page.tsx`                         | `.../subsection-status/$subsectionStatusId.edit.tsx`                                | `.../subsection-status/$subsectionStatusId/edit`                                |
| `/:projectSlug/subsubsection-status`                       | `.../subsubsection-status/...`              | `.../subsubsection-status/index.tsx`                                                | `.../subsubsection-status/`                                                     |
| `/:projectSlug/subsubsection-status/new`                   | `.../new/page.tsx`                          | `.../subsubsection-status/new.tsx`                                                  | `.../subsubsection-status/new`                                                  |
| `/:projectSlug/subsubsection-status/:id/edit`              | `.../edit/page.tsx`                         | `.../subsubsection-status/$subsubsectionStatusId.edit.tsx`                          | `.../subsubsection-status/$subsubsectionStatusId/edit`                          |
| `/:projectSlug/acquisition-area-status`                    | `.../acquisition-area-status/...`           | `.../acquisition-area-status/index.tsx`                                             | `.../acquisition-area-status/`                                                  |
| `/:projectSlug/acquisition-area-status/new`                | `.../new/page.tsx`                          | `.../acquisition-area-status/new.tsx`                                               | `.../acquisition-area-status/new`                                               |
| `/:projectSlug/acquisition-area-status/:id/edit`           | `.../edit/page.tsx`                         | `.../acquisition-area-status/$acquisitionAreaStatusId.edit.tsx`                     | `.../acquisition-area-status/$acquisitionAreaStatusId/edit`                     |
| `/:projectSlug/subsubsection-infra`                        | `.../subsubsection-infra/...`               | `.../subsubsection-infra/index.tsx`                                                 | `.../subsubsection-infra/`                                                      |
| `/:projectSlug/subsubsection-infra/new`                    | `.../new/page.tsx`                          | `.../subsubsection-infra/new.tsx`                                                   | `.../subsubsection-infra/new`                                                   |
| `/:projectSlug/subsubsection-infra/:id/edit`               | `.../edit/page.tsx`                         | `.../subsubsection-infra/$subsubsectionInfraId.edit.tsx`                            | `.../subsubsection-infra/$subsubsectionInfraId/edit`                            |
| `/:projectSlug/subsubsection-infrastructure-type`          | `.../subsubsection-infrastructure-type/...` | `.../subsubsection-infrastructure-type/index.tsx`                                   | `.../subsubsection-infrastructure-type/`                                        |
| `/:projectSlug/subsubsection-infrastructure-type/new`      | `.../new/page.tsx`                          | `.../subsubsection-infrastructure-type/new.tsx`                                     | `.../subsubsection-infrastructure-type/new`                                     |
| `/:projectSlug/subsubsection-infrastructure-type/:id/edit` | `.../edit/page.tsx`                         | `.../subsubsection-infrastructure-type/$subsubsectionInfrastructureTypeId.edit.tsx` | `.../subsubsection-infrastructure-type/$subsubsectionInfrastructureTypeId/edit` |
| `/:projectSlug/subsubsection-special`                      | `.../subsubsection-special/...`             | `.../subsubsection-special/index.tsx`                                               | `.../subsubsection-special/`                                                    |
| `/:projectSlug/subsubsection-special/new`                  | `.../new/page.tsx`                          | `.../subsubsection-special/new.tsx`                                                 | `.../subsubsection-special/new`                                                 |
| `/:projectSlug/subsubsection-special/:id/edit`             | `.../edit/page.tsx`                         | `.../subsubsection-special/$subsubsectionSpecialId.edit.tsx`                        | `.../subsubsection-special/$subsubsectionSpecialId/edit`                        |
| `/:projectSlug/subsubsection-task`                         | `.../subsubsection-task/...`                | `.../subsubsection-task/index.tsx`                                                  | `.../subsubsection-task/`                                                       |
| `/:projectSlug/subsubsection-task/new`                     | `.../new/page.tsx`                          | `.../subsubsection-task/new.tsx`                                                    | `.../subsubsection-task/new`                                                    |
| `/:projectSlug/subsubsection-task/:id/edit`                | `.../edit/page.tsx`                         | `.../subsubsection-task/$subsubsectionTaskId.edit.tsx`                              | `.../subsubsection-task/$subsubsectionTaskId/edit`                              |

### Project — abschnitte / fuehrung / land acquisition

| URL                                                                    | Next.js path                         | TanStack route file                                 | Route id                                        |
| ---------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------- | ----------------------------------------------- |
| `/:projectSlug/abschnitte/new`                                         | `.../abschnitte/new/page.tsx`        | `.../abschnitte/new.tsx`                            | `.../abschnitte/new`                            |
| `/:projectSlug/abschnitte/:subsectionSlug`                             | `.../[subsectionSlug]/page.tsx`      | `.../abschnitte/$subsectionSlug/index.tsx`          | `.../abschnitte/$subsectionSlug/`               |
| `/:projectSlug/abschnitte/:subsectionSlug/edit`                        | `.../edit/page.tsx`                  | `.../abschnitte/$subsectionSlug.edit.tsx`           | `.../abschnitte/$subsectionSlug/edit`           |
| `/:projectSlug/abschnitte/:subsectionSlug/fuehrung/new`                | `.../fuehrung/new/page.tsx`          | `.../fuehrung/new.tsx`                              | `.../fuehrung/new`                              |
| `/:projectSlug/abschnitte/:subsectionSlug/fuehrung/:subsubsectionSlug` | `.../[subsubsectionSlug]/page.tsx`   | `.../fuehrung/$subsubsectionSlug/index.tsx`         | `.../fuehrung/$subsubsectionSlug/`              |
| `/:projectSlug/.../fuehrung/:subsubsectionSlug/edit`                   | `.../edit/page.tsx`                  | `.../fuehrung/$subsubsectionSlug.edit.tsx`          | `.../fuehrung/$subsubsectionSlug/edit`          |
| `/:projectSlug/.../land-acquisition`                                   | `.../land-acquisition/page.tsx`      | `.../land-acquisition/index.tsx`                    | `.../land-acquisition/`                         |
| `/:projectSlug/.../acquisition-areas/new`                              | `.../acquisition-areas/new/page.tsx` | `.../acquisition-areas/new.tsx`                     | `.../acquisition-areas/new`                     |
| `/:projectSlug/.../acquisition-areas/:acquisitionAreaId/edit`          | `.../edit/page.tsx`                  | `.../acquisition-areas/$acquisitionAreaId.edit.tsx` | `.../acquisition-areas/$acquisitionAreaId/edit` |

_Abbreviated prefix for land-acquisition rows:_
`/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition/...`

### Project — project records

| URL                                                     | Next.js path                     | TanStack route file                                  | Route id                                      |
| ------------------------------------------------------- | -------------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `/:projectSlug/project-records`                         | `.../(tabs)/page.tsx`            | `.../project-records/index.tsx` + `_tabs.tsx` layout | `.../project-records/`                        |
| `/:projectSlug/project-records/needreview`              | `.../(tabs)/needreview/page.tsx` | `.../project-records/needreview.tsx`                 | `.../project-records/needreview`              |
| `/:projectSlug/project-records/:projectRecordId`        | `.../[projectRecordId]/page.tsx` | `.../project-records/$projectRecordId.tsx`           | `.../project-records/$projectRecordId`        |
| `/:projectSlug/project-records/:projectRecordId/edit`   | `.../edit/page.tsx`              | `.../project-records/$projectRecordId.edit.tsx`      | `.../project-records/$projectRecordId/edit`   |
| `/:projectSlug/project-records/:projectRecordId/delete` | `.../delete/page.tsx`            | `.../project-records/$projectRecordId.delete.tsx`    | `.../project-records/$projectRecordId/delete` |

### Project — surveys

| URL                                                                                  | Next.js path              | TanStack route file                                          | Route id                                            |
| ------------------------------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| `/:projectSlug/surveys`                                                              | `.../surveys/page.tsx`    | `.../surveys/index.tsx`                                      | `.../surveys/`                                      |
| `/:projectSlug/surveys/:surveyId`                                                    | `.../[surveyId]/page.tsx` | `.../surveys/$surveyId.tsx`                                  | `.../surveys/$surveyId`                             |
| `/:projectSlug/surveys/:surveyId/responses`                                          | `.../responses/page.tsx`  | `.../surveys/$surveyId.responses.tsx`                        | `.../surveys/$surveyId/responses`                   |
| `/:projectSlug/surveys/:surveyId/responses/map`                                      | `.../map/page.tsx`        | `.../surveys/$surveyId.responses.map.tsx`                    | `.../surveys/$surveyId/responses/map`               |
| `/:projectSlug/surveys/:surveyId/responses/:surveyResponseId/uploads/:uploadId/edit` | `.../edit/page.tsx`       | `.../responses/$surveyResponseId/uploads/$uploadId.edit.tsx` | full id under `.../surveys/$surveyId/responses/...` |

---

## API routes

Next route handlers → TanStack server routes (`server.handlers`).
Parent folders `(apiKey)`, `(auth)`, `(public)` are **organizational only**; enforce with shared `beforeLoad` or handler guards.

| URL                                                                   | Next.js path                                           | TanStack route file                                                     | Route id                                                              |
| --------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `/api/cron-invites-cleanup`                                           | `api/(apiKey)/cron-invites-cleanup/route.ts`           | `api/cron-invites-cleanup.ts`                                           | `/api/cron-invites-cleanup`                                           |
| `/api/cron-logEntries-cleanup`                                        | `api/(apiKey)/cron-logEntries-cleanup/route.ts`        | `api/cron-logEntries-cleanup.ts`                                        | `/api/cron-logEntries-cleanup`                                        |
| `/api/cron-surveyResponses-cleanup`                                   | `api/(apiKey)/cron-surveyResponses-cleanup/route.ts`   | `api/cron-surveyResponses-cleanup.ts`                                   | `/api/cron-surveyResponses-cleanup`                                   |
| `/api/process-project-record-email`                                   | `api/(apiKey)/process-project-record-email/route.ts`   | `api/process-project-record-email.ts`                                   | `/api/process-project-record-email`                                   |
| `/api/subsections/import`                                             | `api/(apiKey)/subsections/import/route.ts`             | `api/subsections.import.ts`                                             | `/api/subsections/import`                                             |
| `/api/subsubsections/import`                                          | `api/(apiKey)/subsubsections/import/route.ts`          | `api/subsubsections.import.ts`                                          | `/api/subsubsections/import`                                          |
| `/api/survey-geojson/:slug`                                           | `api/(apiKey)/survey-geojson/[slug]/route.ts`          | `api/survey-geojson.$slug.ts`                                           | `/api/survey-geojson/$slug`                                           |
| `/api/projects/:slug`                                                 | `api/(public)/projects/[slug]/route.ts`                | `api/projects.$slug.ts`                                                 | `/api/projects/$slug`                                                 |
| `/api/survey-upload`                                                  | `api/(public)/survey-upload/route.ts`                  | `api/survey-upload.ts`                                                  | `/api/survey-upload`                                                  |
| `/api/:projectSlug/subsections/export`                                | `api/(auth)/[projectSlug]/subsections/export/route.ts` | `api/$projectSlug.subsections.export.ts`                                | `/api/$projectSlug/subsections/export`                                |
| `/api/:projectSlug/subsections/:subsectionSlug/subsubsections/export` | `.../subsubsections/export/route.ts`                   | `api/$projectSlug.subsections.$subsectionSlug.subsubsections.export.ts` | `/api/$projectSlug/subsections/$subsectionSlug/subsubsections/export` |
| `/api/:projectSlug/upload`                                            | `api/(auth)/[projectSlug]/upload/route.ts`             | `api/$projectSlug.upload.ts`                                            | `/api/$projectSlug/upload`                                            |
| `/api/:projectSlug/uploads/:uploadId/*`                               | `.../uploads/[uploadId]/[...rest]/route.ts`            | `api/$projectSlug.uploads.$uploadId.$.ts`                               | `/api/$projectSlug/uploads/$uploadId/$`                               |
| `/api/:projectSlug/surveys/:surveyId/part1/questions`                 | `.../part1/questions/route.ts`                         | `api/$projectSlug.surveys.$surveyId.part1.questions.ts`                 | `/api/$projectSlug/surveys/$surveyId/part1/questions`                 |
| `/api/:projectSlug/surveys/:surveyId/part1/answers`                   | `.../part1/answers/route.ts`                           | `api/...part1.answers.ts`                                               | `/api/$projectSlug/surveys/$surveyId/part1/answers`                   |
| `/api/:projectSlug/surveys/:surveyId/part1/results`                   | `.../part1/results/route.ts`                           | `api/...part1.results.ts`                                               | `/api/$projectSlug/surveys/$surveyId/part1/results`                   |
| `/api/:projectSlug/surveys/:surveyId/part2/results`                   | `.../part2/results/route.ts`                           | `api/...part2.results.ts`                                               | `/api/$projectSlug/surveys/$surveyId/part2/results`                   |
| `/api/support/documents/upload`                                       | `api/(auth)/support/documents/upload/route.ts`         | `api/support.documents.upload.ts`                                       | `/api/support/documents/upload`                                       |
| `/api/support/documents/:documentId/*`                                | `.../[documentId]/[...rest]/route.ts`                  | `api/support.documents.$documentId.$.ts`                                | `/api/support/documents/$documentId/$`                                |

**New (no Next equivalent today)** — align with TILDA better-auth:

| URL           | TanStack route file | Route id      |
| ------------- | ------------------- | ------------- |
| `/api/auth/*` | `api/auth.$.ts`     | `/api/auth/$` |

---

## Parallel routes & modals

Next **parallel** `@modal` + **intercepting** `(.)` routes:

| Next path                                                        | Purpose                  |
| ---------------------------------------------------------------- | ------------------------ |
| `@modal/(.)[projectSlug]/project-records/[projectRecordId]`      | Record detail overlay    |
| `@modal/(.)[projectSlug]/project-records/[projectRecordId]/edit` | Record edit overlay      |
| `@modal/(.)[projectSlug]/project-records/needreview`             | Need-review list overlay |
| `@modal/(...)[projectSlug]/uploads/[uploadId]/edit`              | Upload edit overlay      |
| `@modal/[...catchAll]`                                           | Empty catch-all          |

TanStack Router has no identical parallel-slot model. **Recommended options** (pick one per feature):

1. **Search-param drawer** (simplest): e.g. `/project-records?record=:id` on the list route; `beforeLoad` opens drawer component.
2. **Child modal route + default parent**: nested route with `modal: true` in static data and layout that renders `<Outlet />` for background + modal panel (custom layout).
3. **Dedicated modal routes** under `_loggedInProjects/_modal/` pathless tree (URLs may differ slightly from intercepting behavior).

Intercepting “soft navigation opens modal, hard refresh opens full page” needs an explicit product decision in Start.

---

## Blitz RPC (not a page route)

| Current                                        | Target                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `src/pages/api/rpc/[[...blitz]].ts`            | Remove; port each query/mutation to `src/server/**/*.functions.ts` |
| `useQuery` / `useMutation` from `@blitzjs/rpc` | TanStack Query + `createServerFn`                                  |

---

## TILDA route inventory (for comparison)

TILDA has **no** Trassenscout-equivalent project/trasse domain. Use it for **patterns**, not 1:1 URLs.

| Area          | Example URLs                                                     | Layout parent |
| ------------- | ---------------------------------------------------------------- | ------------- |
| Home          | `/`                                                              | `/_home`      |
| Static        | `/kontakt`, `/datenschutz`, `/access-denied`, `/docs/:tableName` | `/_pages`     |
| Regions       | `/regionen`, `/regionen/:regionSlug`, `/regionen/stats`          | `/regionen`   |
| Admin         | `/admin`, `/admin/regions`, …                                    | `/admin`      |
| API           | `/api/stats`, `/api/export/...`, `/api/auth/*`, …                | —             |
| Preview (dev) | `/preview/...`                                                   | `/preview`    |

Trassenscout’s largest structural analogue is **`/regionen/$regionSlug`** ↔ **`/:projectSlug/abschnitte/.../land-acquisition`** (map-heavy, loader + Query hydration).

---

## Migration checklist

1. Add `src/routes/__root.tsx` and pathless layouts (`_marketing`, `_content`, `_loggedInGeneral`, `_loggedInProjects`, `admin`).
2. Port leaf routes in batches (auth → dashboard → admin → per-project CRUD → map routes last).
3. Replace `@modal` with chosen modal strategy before cutting over project records.
4. Port `src/app/api/**` to `src/routes/api/**` with shared auth helpers for ex-`(apiKey)` / `(auth)` groups.
5. Wire `@tanstack/router-plugin` → `routeTree.gen.ts`; set `trailingSlash: 'never'` like TILDA.
6. Delete `src/app/` and `src/pages/api/rpc/` when parity is verified.

---

_Generated from filesystem scans of `trassenscout/src/app` and `tilda-geo/app/src/routes`._
