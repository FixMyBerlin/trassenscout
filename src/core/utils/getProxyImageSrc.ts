import { getPrdOrStgDomain } from "../components/links/getDomain"

// Some images are stored on S3 and proxied to this path
// See `docker/nginx/default.conf.tpl` for more
export const getProxyImageSrc = (logoSrc: string) => {
  const origin = getPrdOrStgDomain()
  return `${origin}/assets/${logoSrc}`
}
