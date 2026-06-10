import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import favicons from "favicons"
import { APP_META } from "@/src/meta.const"

const publicDir = join(process.cwd(), "public")
const source = join(publicDir, "favicon.svg")

const response = await favicons(source, {
  appName: APP_META.title,
  appShortName: APP_META.shortName,
  appDescription: APP_META.description,
  background: APP_META.themeColor,
  theme_color: APP_META.themeColor,
  path: "/",
  icons: {
    favicons: true,
    android: true,
    appleIcon: true,
    appleStartup: false,
    windows: false,
    yandex: false,
  },
})

await mkdir(publicDir, { recursive: true })

for (const image of response.images) {
  await writeFile(join(publicDir, image.name), image.contents)
}

for (const file of response.files) {
  await writeFile(join(publicDir, file.name), file.contents)
}

await writeFile(
  join(publicDir, "manifest.json"),
  `${JSON.stringify(
    {
      name: APP_META.title,
      short_name: APP_META.shortName,
      description: APP_META.description,
      icons: [
        { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
        { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: APP_META.themeColor,
      background_color: APP_META.themeColor,
      display: "standalone",
    },
    null,
    2,
  )}\n`,
)
