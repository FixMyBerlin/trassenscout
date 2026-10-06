import { Asset, useMatches, useRouter, useTags } from "@tanstack/react-router"
import { preferDeepestIconLinks } from "@/src/components/shared/layouts/documentHeadLinks"

/**
 * Same rendering path as TanStack Router's `HeadContent` (`useTags` → `Asset`, nonce, keys).
 * We do not use `HeadContent` directly because merged route `head.links` keep every match's
 * favicons; browsers use the first `rel="icon"`. `preferDeepestIconLinks` drops stale root
 * icon / apple-touch-icon tags when a deeper route defines them.
 */
export function DocumentHead() {
  const tags = useTags()
  const matches = useMatches()
  const nonce = useRouter().options.ssr?.nonce
  const visibleTags = preferDeepestIconLinks(tags, matches)

  return (
    <>
      {visibleTags.map((tag) => (
        <Asset key={`tsr-meta-${JSON.stringify(tag)}`} {...tag} nonce={nonce} />
      ))}
    </>
  )
}
