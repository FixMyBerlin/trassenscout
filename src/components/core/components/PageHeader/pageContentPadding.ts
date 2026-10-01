/** Padded page body under PageHeader; full bordered chrome is fine (gap below header separator). */
export const pageContentPaddingClassName = "p-4"
/**
 * Same padding, for a wrapper whose only child may render nothing — an admin box for a normal
 * user, a notice with no items or a dismissed one. Without the collapse the padding alone is
 * left behind as a 32px band.
 */
export const optionalPageContentPaddingClassName = "p-4 empty:hidden"
