import Head from "next/head"
import { isProduction } from "../../utils"
import SocialSharingImage from "./assets/default.png"

const seoDefaultValues = {
  defaultTitle: "Trassenscout",
  defaultDescription: "Daten zur Trasse.",
  baseUrl: "https://#todo.de",
}

type Props = {
  noindex?: boolean
  title?: string | null
  description?: string | null
  image?: string | null
  article?: boolean | null
}

// TODO APPDIRECTORY: Can we remove this component after we migrated
export const MetaTags: React.FC<Props> = ({ noindex, title, description, image, article }) => {
  const { defaultTitle, defaultDescription, baseUrl } = seoDefaultValues

  if (noindex === undefined) noindex = !isProduction

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: `${baseUrl}${image || SocialSharingImage}`,
  }

  if (noindex) {
    return (
      <Head>
        <title>{seo.title}</title>
        <meta name="robots" content="noindex" />
      </Head>
    )
  }

  // FYI, we do not inlcude the url meta tags since is work to handle edge cases but let the browser handle this.
  // We do not have propper SocialSharing anyways, since we don't generate static content.
  return (
    <Head>
      <title>{seo.title}</title>
      <meta property="og:title" content={seo.title} />
      <meta name="twitter:title" content={seo.title} />

      <meta name="description" content={seo.description} />
      <meta property="og:description" content={seo.description} />
      <meta name="twitter:description" content={seo.description} />

      <meta name="image" content={seo.image} />
      <meta property="og:image" content={seo.image} />
      <meta name="twitter:image" content={seo.image} />

      {(article ? true : null) && <meta property="og:type" content="article" />}
      <meta name="twitter:card" content="summary_large_image" />

      <meta name="theme-color" content="#34d399" />
    </Head>
  )
}
