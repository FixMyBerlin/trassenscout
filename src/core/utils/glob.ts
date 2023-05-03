export const glob = (obj: Record<string, any>) => {
  if (typeof window === "undefined") return
  Object.entries(obj).forEach(([k, v]) => {
    // @ts-ignore
    window[k] = v
  })
}
