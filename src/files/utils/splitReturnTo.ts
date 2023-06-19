type Props = { returnPath?: string }

export const splitReturnTo = (params: Props) => {
  if (!params.returnPath) {
    return {}
  }
  const [subsectionSlug, subsubsectionSlug] = params.returnPath.split("/")
  return { subsectionSlug, subsubsectionSlug }
}
