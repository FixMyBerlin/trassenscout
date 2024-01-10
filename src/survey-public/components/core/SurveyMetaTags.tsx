import Head from "next/head"
import React from "react"

type Props = {
  title?: string | null
  canonicalUrl?: string
}

export const SurveyMetaTags: React.FC<Props> = ({ title, canonicalUrl }) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="robots" content="noindex" />
      <meta property="og:url" content={canonicalUrl} />
    </Head>
  )
}
