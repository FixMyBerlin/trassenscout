import appCss from "@/src/components/shared/layouts/global.css?url"

export const APP_META = {
  title: "Trassenscout",
  shortName: "Trassenscout",
  description:
    "Der Trassenscout unterstützt Kommunen und Regionalverbände bei der Erstellung von Machbarkeitsstudien und Vorplanungen für Radschnellverbindungen und anderen liniengebundenen Bauwerken.",
  themeColor: "#1f2937",
  siteUrl: "https://trassenscout.de",
  privateTitleSuffix: "trassenscout.de",
  twitterCreator: "@fixmyberlin",
  ogImage: {
    width: 1200,
    height: 630,
  },
  faviconLinks: [
    { rel: "stylesheet", href: appCss },
    { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    { rel: "icon", href: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    { rel: "manifest", href: "/manifest.json" },
  ],
}
