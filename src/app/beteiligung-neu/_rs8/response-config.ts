export type TResponseConfig = {
  evaluationRefs: {
    category: number
    "is-location": number
    location: number
    "usertext-1": number
    "usertext-2"?: number // survey RS8
    "geometry-category"?: number // this is typed as optional because it is introduced in survey BB, for RS8 and FRM7 we use a fallback geometry-category
    "line-id"?: number // survey BB
    "line-from-to-name"?: number // survey BB
  }
}

export const responseConfig: TResponseConfig = {
  evaluationRefs: {
    category: 21,
    "is-location": 22,
    location: 23,
    "usertext-1": 34,
    "usertext-2": 35,
  },
}
