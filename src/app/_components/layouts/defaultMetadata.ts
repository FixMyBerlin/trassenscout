import SocialSharingImage from "@/src/app/_components/layouts/assets/og-image-default.png"
import { isProduction } from "@/src/core/utils"
import { Metadata } from "next"

// https://nextjs.org/docs/app/building-your-application/optimizing/metadata
// https://nextjs.org/docs/app/api-reference/functions/generate-metadata

export const defaultMetadata: Metadata = {
  // 'noindex': No default on Production, but everyting is 'noindex' on Staging & Development
  // For testing, use ...{ robots: true ? undefined : 'noindex' },
  ...{ robots: isProduction ? undefined : "noindex" },
  title: {
    default: "Trassenscout",
    template: "%s – Trassenscout",
  },
  description:
    "Der Trassenscout unterstützt Kommunen und Regionalverbände bei der Erstellung von Machbarkeitsstudien und Vorplanungen für Radschnellverbindungen und anderen liniengebundenen Bauwerken.",
  metadataBase: new URL("https://trassenscout.de"),
  openGraph: {
    images: [
      {
        url: SocialSharingImage.src,
        width: 1200,
        height: 630,
        // alt: "Trassenscout", // TODO
      },
    ],
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@fixmyberlin",
    images: [SocialSharingImage.src],
  },
}
