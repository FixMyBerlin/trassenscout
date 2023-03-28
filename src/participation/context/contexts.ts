import { createContext } from "react"

export type TProgressContext = {
  progress: { current: number; total: number }
  setProgress: ({ current, total }: { current: number; total: number }) => void
}

export const ProgressContext = createContext<TProgressContext>({
  progress: { current: 0, total: 0 },
  setProgress: () => {},
})

export const PinContext = createContext(null)
