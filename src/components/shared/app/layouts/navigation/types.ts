/**
 * `auto` — authenticated shell (user is guaranteed by the route's `beforeLoad`).
 * `loggedOut` — guest-only routes (`_marketing`, `auth`): static auth buttons.
 * `public` — open routes (`_content`): session-aware, user menu or auth buttons.
 */
export type NavigationUserVariant = "auto" | "loggedOut" | "public"
