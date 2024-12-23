import Head from "next/head"

type Props = {
  title?: string | null
  canonicalUrl?: string
}

export const SurveyMetaTags = ({ title, canonicalUrl }: Props) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="robots" content="noindex" />
      <meta property="og:url" content={canonicalUrl} />
    </Head>
  )
}
