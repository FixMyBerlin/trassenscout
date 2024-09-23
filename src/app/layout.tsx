import SocialSharingImage from "@/src/app/_components/layouts/assets/og-image-default.png"
import "@/src/app/_components/layouts/global.css"
import { clsx } from "clsx"
import { Metadata, Viewport } from "next"
import { BlitzProvider } from "../blitz-client"
import { isProduction } from "../core/utils"
import { fontClasses } from "./_components/layouts/fonts"
import { TailwindResponsiveHelper } from "./_components/TailwindResponsiveHelper/TailwindResponsiveHelper"

// https://nextjs.org/docs/app/building-your-application/optimizing/metadata
// https://nextjs.org/docs/app/api-reference/functions/generate-metadata

// TODO APPDIRECTORY: Migrate Matomo from other layout file

export const metadata: Metadata = {
  // 'noindex': No default on Production, but everyting is 'noindex' on Staging & Development
  // For testing, use ...{ robots: true ? undefined : 'noindex' },
  ...{ robots: isProduction ? undefined : "noindex" },
  title: {
    default: "Trassenscout",
    template: "%s – Trassenscout",
  },
  description:
    "Der Trassenscout unterstützt Kommunen und Regionalverbände bei der Erstellung von Machbarkeitsstudien und Vorplanungen für Radschnellverbindungen und anderen liniengebundenen Bauwerken.",
  metadataBase: new URL("https://trassenscout.de/rs8"),
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={clsx(fontClasses, "h-full scroll-smooth")}>
      <body className="flex min-h-full w-full flex-col text-gray-800 antialiased">
        <BlitzProvider>
          <div className="flex h-full w-full flex-none flex-grow flex-col">{children}</div>
        </BlitzProvider>
        <TailwindResponsiveHelper />
      </body>
    </html>
  )
}

export const viewport: Viewport = {
  themeColor: "#1f2937",
}
