export function globalize(values: Record<string, any>) {
  // for debugging only
  // const test = 'TEST'
  // globalize({ test }) to make variable test available as window.test
  if (typeof window !== "undefined") {
    Object.entries(values).forEach(([name, value]) => {
      // @ts-expect-error
      window[name] = value
    })
  }
}
