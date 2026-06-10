/**
 * Route-safe auth-boundary markers: `public` and `inherited` only.
 *
 * TanStack route modules (`beforeLoad`, loaders) must start with an `endpointAuth.*` call
 * (enforced by our custom `require-endpoint-auth` lint rule). When a route does not perform
 * its own session check, it still must document where auth comes from.
 *
 * These methods are sync no-ops (plus dev-only reason validation). They do not read
 * headers or throw auth errors. For real checks (`session`, `projectRole`, `admin`, …)
 * import `@/src/server/auth/endpointAuth.server` in API handlers and server exports.
 *
 * @see endpointAuth.server.ts — full API; spreads these markers via `...endpointAuthBoundary`
 * @see .agents/skills/trassenscout-auth/references/auth.md
 */

export const endpointAuth = {
  /** Intentionally unauthenticated. `reason` must name why that is acceptable. */
  public: (reason: string) => {
    if (process.env.NODE_ENV === "development" && !reason.trim()) {
      throw new Error("endpointAuth.public/inherited requires a non-empty reason")
    }
  },
  /** Auth enforced elsewhere. `reason` must name the layout, handler, or export that guards access. */
  inherited: (reason: string) => {
    if (process.env.NODE_ENV === "development" && !reason.trim()) {
      throw new Error("endpointAuth.public/inherited requires a non-empty reason")
    }
  },
} as const
