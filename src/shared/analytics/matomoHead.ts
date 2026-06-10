import { matomoConfig, type MatomoConfig } from "@/src/shared/analytics/matomoConfig"

function buildMatomoInitScript(config: MatomoConfig) {
  return `
window._paq = window._paq || [];
window._paq.push(['setTrackerUrl', ${JSON.stringify(config.trackerUrl)}]);
window._paq.push(['setSiteId', ${config.siteId}]);
window._paq.push(['disableCookies']);
`.trim()
}

function buildConsoleMatomoScript(config: MatomoConfig) {
  return `
${buildMatomoInitScript(config)}
console.log('[Matomo]', ${JSON.stringify(config)}, window._paq);
`.trim()
}

export function getMatomoHeadAssets() {
  switch (import.meta.env.VITE_APP_ENV) {
    case "development":
    case "staging":
      return { scripts: [{ children: buildConsoleMatomoScript(matomoConfig) }] }
    case "production":
      return {
        scripts: [
          { children: buildMatomoInitScript(matomoConfig) },
          { src: matomoConfig.scriptSrc, async: true, defer: true },
        ],
      }
  }
}
