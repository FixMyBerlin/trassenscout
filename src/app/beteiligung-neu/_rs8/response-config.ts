export type TResponseConfig = {
  evaluationRefs: {
    category: number
    enableLocation: number
    location: number
    feedbackText: number
    feedbackText_2?: number // survey RS8
    "geometry-category"?: number // this is typed as optional because it is introduced in survey BB, for RS8 and FRM7 we use a fallback geometry-category
    "line-id"?: number // survey BB
    "line-from-to-name"?: number // survey BB
  }
}

export const responseConfig: TResponseConfig = {
  evaluationRefs: {
    category: 21,
    enableLocation: 22,
    location: 23,
    feedbackText: 34,
    feedbackText_2: 35,
  },
}
