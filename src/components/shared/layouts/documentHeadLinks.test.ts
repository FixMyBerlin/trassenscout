import { describe, expect, it } from "vitest"
import { preferDeepestIconLinks } from "./documentHeadLinks"

const rootIcons = [
  { tag: "link", attrs: { rel: "stylesheet", href: "/app.css" } },
  { tag: "link", attrs: { rel: "icon", href: "/favicon.svg" } },
  { tag: "link", attrs: { rel: "icon", href: "/favicon-32x32.png" } },
  { tag: "link", attrs: { rel: "apple-touch-icon", href: "/apple-touch-icon.png" } },
  { tag: "link", attrs: { rel: "manifest", href: "/manifest.json" } },
]

const rootMatches = [
  {
    links: [
      { rel: "stylesheet", href: "/app.css" },
      { rel: "icon", href: "/favicon.svg" },
      { rel: "icon", href: "/favicon-32x32.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  },
]

describe("preferDeepestIconLinks", () => {
  it("keeps the app favicon set when no child route defines an icon", () => {
    expect(preferDeepestIconLinks(rootIcons, rootMatches)).toEqual(rootIcons)
  })

  it("replaces icon and apple-touch-icon when a deeper route defines them", () => {
    const logo = "https://www.oberhavel.de/media/custom/logo.PNG"
    const tags = [
      ...rootIcons,
      { tag: "link", attrs: { rel: "canonical", href: "https://www.oberhavel.de/" } },
      { tag: "link", attrs: { rel: "icon", href: logo, type: "image/png" } },
      { tag: "link", attrs: { rel: "apple-touch-icon", href: logo } },
    ]
    const matches = [
      ...rootMatches,
      {
        links: [
          { rel: "canonical", href: "https://www.oberhavel.de/" },
          { rel: "icon", href: logo },
          { rel: "apple-touch-icon", href: logo },
        ],
      },
    ]

    expect(preferDeepestIconLinks(tags, matches).map((tag) => tag.attrs)).toEqual([
      { rel: "stylesheet", href: "/app.css" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "canonical", href: "https://www.oberhavel.de/" },
      { rel: "icon", href: logo, type: "image/png" },
      { rel: "apple-touch-icon", href: logo },
    ])
  })

  it("leaves apple-touch-icon in place when the child only replaces rel=icon", () => {
    const logo = "https://example.test/logo.svg"
    const tags = [...rootIcons, { tag: "link", attrs: { rel: "icon", href: logo } }]
    const matches = [...rootMatches, { links: [{ rel: "icon", href: logo }] }]

    expect(preferDeepestIconLinks(tags, matches).map((tag) => tag.attrs?.href)).toEqual([
      "/app.css",
      "/apple-touch-icon.png",
      "/manifest.json",
      logo,
    ])
  })
})
