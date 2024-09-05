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

// to be used to debug resolver pipes
export function createLogger(...args: any[]) {
  return (input: any) => {
    console.log(...args)
    return input
  }
}
