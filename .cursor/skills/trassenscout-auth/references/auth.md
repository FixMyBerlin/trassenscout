# Auth in TanStack Start (Trassenscout)

Repo-specific file paths and `endpointAuth` patterns. For `betterAuth({ ... })` options, plugins, and adapters, see shared skill **`tanstack-start-auth`**.

---

## 1. File layout

| Role                  | Path                                        |
| --------------------- | ------------------------------------------- |
| Server config         | `src/server/auth/auth.server.ts`            |
| Boundary API          | `src/server/auth/endpointAuth.server.ts`    |
| Route auth markers    | `src/server/auth/endpointAuthBoundary.ts`   |
| Session helpers       | `src/server/auth/session.server.ts`         |
| Server fns for routes | `src/server/auth/auth.functions.ts`         |
| Client                | `src/components/shared/auth/auth-client.ts` |
| Auth API route        | `src/routes/api/auth.$.ts`                  |

Sign-in is email/password via Better Auth (`/auth/login`). No OAuth sign-in routes in this repo.

---

## 2. Mount handler and cookies

Use Better Auth's **`tanstackStartCookies()`** plugin as the **last** entry in `plugins`. The route mounts `auth.handler` and marks the boundary public:

```ts
// src/routes/api/auth.$.ts
GET: ({ request }) => {
  endpointAuth.public("Better Auth session handler")
  return auth.handler(request)
}
```

Details and version caveats: shared skill `tanstack-start-auth` → `references/auth.md`.

---

## 3. `endpointAuth` — sole public boundary API

Import **only** `endpointAuth` from `src/server/auth/endpointAuth.server.ts` at call sites. Do **not** call `requireAuth`, `guardAdmin`, etc. directly — oxlint enforces this.

The **first statement** in each boundary function must be one of:

| Method                                                        | Use when                                             |
| ------------------------------------------------------------- | ---------------------------------------------------- |
| `endpointAuth.session(headers)`                               | Logged-in user required                              |
| `endpointAuth.admin(headers)`                                 | Admin role (fresh session)                           |
| `endpointAuth.projectRole(headers, slug, roles)`              | Project RBAC; returns `{ projectId, session }`       |
| `endpointAuth.projectMember({ headers, projectSlug, roles })` | Project RBAC; returns session                        |
| `endpointAuth.apiKey(request)`                                | Cron / automation endpoints                          |
| `endpointAuth.routeSession(location)`                         | Layout: redirect if logged out                       |
| `endpointAuth.routeAdmin(location)`                           | Layout: admin only                                   |
| `endpointAuth.routeProject(location, slug)`                   | Layout: session + membership                         |
| `endpointAuth.routeGuest(location?)`                          | Layout: redirect if logged in                        |
| `endpointAuth.public("reason")`                               | Intentionally open; reason required (string literal) |
| `endpointAuth.inherited("reason")`                            | Auth guaranteed by parent layout / callee            |

`public` and `inherited` are sync noops — they document intent for review and lint.

Oxlint plugins: `lint/plugins/require-endpoint-auth.mjs`, `lint/plugins/no-auth-boundary-import.mjs`. Portable docs: shared skill `tanstack-start-auth` → `references/endpoint-auth-lint.md`.

---

## 4. Typical protection matrix

| Area          | Protection        | Pattern                                                                             |
| ------------- | ----------------- | ----------------------------------------------------------------------------------- |
| Public home   | Optional redirect | `beforeLoad` reads post–sign-in cookie; no auth required                            |
| Admin layout  | Admin only        | Parent `beforeLoad` + `routeAdminFn` / `getFreshSession`                            |
| Resource page | Public + member   | `beforeLoad` → `isAuthorized` in context                                            |
| API routes    | Per-handler       | `endpointAuth.session` / `projectRole` / `apiKey` / `public`; no route `beforeLoad` |

---

## 5. Checklist

- [ ] New admin page under `/admin` → parent layout `beforeLoad` with `routeAdminFn`
- [ ] New protected nested route → inherit parent `beforeLoad` / context (or `endpointAuth.inherited("…")` on leaf routes)
- [ ] New session API route → first line `endpointAuth.session` / `projectRole` / `admin`
- [ ] New script API route → first line `endpointAuth.apiKey(request)`
- [ ] New intentionally open API / server export → first line `endpointAuth.public("…")` with non-empty string literal reason
- [ ] New server function needing user → `getRequestHeaders()` in `*.functions.ts`; boundary in `*.server.ts`
