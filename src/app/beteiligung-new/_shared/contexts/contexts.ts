import { createContext } from "react"

type TProgressContext = {
  progress: number
  setProgress: (current: number) => void
}

export const ProgressContext = createContext<TProgressContext>({
  progress: 0,
  setProgress: () => {},
})
