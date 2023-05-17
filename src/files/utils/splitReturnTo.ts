type Props = { returnPath?: string }

export const splitReturnTo = (params: Props) => {
  if (!params.returnPath) {
    return {}
  }
  const [sectionSlug, subsectionSlug, subsubsectionSlug] = params.returnPath.split("/")
  return { sectionSlug, subsectionSlug, subsubsectionSlug }
}
